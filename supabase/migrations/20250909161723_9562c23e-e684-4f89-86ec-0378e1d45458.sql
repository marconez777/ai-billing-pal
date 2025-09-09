-- =========================
-- PREPARO
-- =========================
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Garantia: helper de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =========================
-- 1) TRANSFERÊNCIAS (par origem/destino)
-- =========================
/*
Cria uma transferência com 2 lançamentos:
  - origem: valor negativo na conta de origem
  - destino: valor positivo na conta de destino
Flags de P&L:
  - Nunca conta no resultado da Empresa por padrão
  - Conta no resultado Pessoal apenas se p_counts_personal = true (ex.: owner_draw)
*/
create or replace function public.fn_create_transfer(
  p_src_account uuid,
  p_src_entity  uuid,
  p_dst_account uuid,
  p_dst_entity  uuid,
  p_amount      numeric,
  p_txn_date    date,
  p_description text,
  p_economic_nature text default 'internal_move',
  p_counts_personal boolean default false
) returns uuid
language plpgsql
security invoker
as $$
declare
  v_group uuid := gen_random_uuid();
  v_user  uuid := auth.uid();
  v_src_user uuid;
  v_dst_user uuid;
begin
  if p_amount is null or p_amount = 0 then
    raise exception 'Amount must be non-zero';
  end if;

  -- Ownership checks via accounts
  select user_id into v_src_user from public.accounts where id = p_src_account;
  select user_id into v_dst_user from public.accounts where id = p_dst_account;
  if v_src_user is null or v_dst_user is null or v_src_user <> v_user or v_dst_user <> v_user then
    raise exception 'Unauthorized account(s) or not found';
  end if;

  -- Origem (negativo)
  insert into public.transactions (
    user_id, account_id, entity_id, txn_date, amount, description, category_id,
    kind, economic_nature, parent_id, installment_plan_id, installment_n, installment_of,
    invoice_id, transfer_group_id, counts_in_company_result, counts_in_personal_result, metadata
  ) values (
    v_user, p_src_account, p_src_entity, p_txn_date, -abs(p_amount), p_description, null,
    'transfer', p_economic_nature, null, null, null, null,
    null, v_group, false, false, '{}'::jsonb
  );

  -- Destino (positivo)
  insert into public.transactions (
    user_id, account_id, entity_id, txn_date, amount, description, category_id,
    kind, economic_nature, parent_id, installment_plan_id, installment_n, installment_of,
    invoice_id, transfer_group_id, counts_in_company_result, counts_in_personal_result, metadata
  ) values (
    v_user, p_dst_account, p_dst_entity, p_txn_date, abs(p_amount), p_description, null,
    'transfer', p_economic_nature, null, null, null, null,
    null, v_group, false, p_counts_personal, '{}'::jsonb
  );

  return v_group;
end; $$;

comment on function public.fn_create_transfer is
'Cria transferência em par (origem negativa, destino positiva). p_counts_personal=true para contar como renda pessoal (ex.: owner_draw).';

-- =========================
-- 2) TRIAGEM: LOCK/UNLOCK (concorrência)
-- =========================
create or replace function public.fn_staging_lock(p_id uuid)
returns boolean
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_updated int;
begin
  update public.staging_transactions
  set lock_owner = v_user, locked_at = now()
  where id = p_id
    and user_id = v_user
    and (lock_owner is null or lock_owner = v_user or locked_at < now() - interval '15 minutes');
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end; $$;

create or replace function public.fn_staging_unlock(p_id uuid)
returns boolean
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_updated int;
begin
  update public.staging_transactions
  set lock_owner = null, locked_at = null
  where id = p_id
    and user_id = v_user
    and lock_owner = v_user;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end; $$;

create or replace function public.fn_staging_unlock_all_for_user()
returns int
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_count int;
begin
  update public.staging_transactions
  set lock_owner = null, locked_at = null
  where user_id = v_user and lock_owner = v_user;
  get diagnostics v_count = row_count;
  return v_count;
end; $$;

create or replace function public.fn_staging_release_stale_locks(p_max_minutes int default 15)
returns int
language plpgsql
security invoker
as $$
declare v_count int;
begin
  update public.staging_transactions
  set lock_owner = null, locked_at = null
  where user_id = auth.uid()
    and locked_at is not null
    and locked_at < now() - (p_max_minutes || ' minutes')::interval;
  get diagnostics v_count = row_count;
  return v_count;
end; $$;

comment on function public.fn_staging_lock is 'Tenta bloquear item de staging (timeout 15min).';
comment on function public.fn_staging_release_stale_locks is 'Libera locks do próprio usuário mais antigos que N minutos.';

-- =========================
-- 3) TRIAGEM → TRANSACTIONS (aprovação)
-- =========================
/*
Aprova um item do staging para transactions:
- Define kind automaticamente: income (amount>0) / expense (amount<0)
- Seta flags de P&L conforme tipo de entidade: company -> company_result, person/couple -> personal_result
- Copia metadata e marca staging.status='approved'
*/
create or replace function public.fn_staging_approve(
  p_staging_id uuid,
  p_entity_id  uuid,
  p_category_id uuid
) returns uuid
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  s record;
  v_entity_type text;
  v_kind text;
  v_tx_id uuid;
begin
  select * into s
  from public.staging_transactions
  where id = p_staging_id and user_id = v_user and status in ('pending','skipped')
  for update;

  if not found then
    raise exception 'Staging item not found or not editable';
  end if;

  select entity_type into v_entity_type
  from public.entities
  where id = p_entity_id and user_id = v_user;

  if v_entity_type is null then
    raise exception 'Invalid entity';
  end if;

  v_kind := case when s.amount > 0 then 'income' else 'expense' end;

  insert into public.transactions(
    user_id, account_id, entity_id, txn_date, amount, description,
    category_id, kind, counts_in_company_result, counts_in_personal_result, metadata
  ) values (
    v_user, s.account_id, p_entity_id, s.txn_date, s.amount, s.description,
    p_category_id, v_kind,
    (v_entity_type = 'company'),
    (v_entity_type in ('person','couple')),
    coalesce(s.metadata, '{}'::jsonb)
  )
  returning id into v_tx_id;

  update public.staging_transactions
  set status = 'approved'
  where id = p_staging_id;

  return v_tx_id;
end; $$;

comment on function public.fn_staging_approve is
'Aprova staging→transactions com flags de P&L por tipo de entidade.';

-- =========================
-- 4) CONCILIAÇÃO AUTOMÁTICA DE FATURAS (heurística 3 passos)
-- =========================
/*
Heurística:
1) Calcula total da fatura (itens charges - credits).
2) Busca transação despesa (kind <> 'transfer' e amount < 0) na janela due_date ± 3 dias
   com valor ≈ total (tolerância em centavos).
3) Desempate: conta mais usada anteriormente para pagar este cartão; depois menor diferença; depois data mais cedo.
Atualiza payer_account_id, paid_amount, paid_at e status ('paid' | 'partial').
Retorna id da transação candidata ou NULL se não há candidato.
*/
create or replace function public.fn_invoice_autoreconcile(
  p_invoice_id uuid,
  p_tolerance_cents integer default 100
) returns uuid
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  i record;
  v_total numeric(14,2);
  candidate record;
begin
  select * into i from public.invoices
  where id = p_invoice_id and user_id = v_user
  for update;
  if not found then
    raise exception 'Invoice not found';
  end if;

  -- total da fatura (itens)
  select
    coalesce(sum(case when t.amount < 0 then abs(t.amount) else 0 end),0)
    - coalesce(sum(case when t.amount > 0 then t.amount else 0 end),0)
  into v_total
  from public.invoice_items ii
  join public.transactions t on t.id = ii.transaction_id
  where ii.invoice_id = i.id and t.user_id = v_user;

  -- candidata
  select t.*
  into candidate
  from public.transactions t
  where t.user_id = v_user
    and t.kind <> 'transfer'
    and t.amount < 0
    and t.txn_date between (i.due_date - interval '3 days') and (i.due_date + interval '3 days')
    and abs(abs(t.amount) - v_total) <= (p_tolerance_cents::numeric / 100.0)
  order by
    (select count(*) from public.invoices i2
      where i2.user_id = v_user and i2.account_id = i.account_id and i2.payer_account_id = t.account_id) desc,
    abs(abs(t.amount) - v_total) asc,
    t.txn_date asc
  limit 1;

  if not found then
    return null;
  end if;

  update public.invoices
  set payer_account_id = candidate.account_id,
      paid_amount = abs(candidate.amount),
      paid_at = candidate.txn_date,
      status = case when abs(candidate.amount) >= v_total - (p_tolerance_cents::numeric/100.0) then 'paid' else 'partial' end
  where id = i.id;

  return candidate.id;
end; $$;

comment on function public.fn_invoice_autoreconcile is
'Aplica heurística de auto-conciliação de fatura: janela ±3d, valor aproximado e conta preferida histórica.';

-- =========================
-- 5) REFRESH DE ANALYTICS + CRON (no-op se não houver matviews)
-- =========================
/*
Se no futuro criarmos materialized views (ex.: mv_pl_company_monthly), esta função as atualizará.
Se não existirem, apenas não faz nada. Rodaremos todo dia às 03:00 via pg_cron.
*/
create or replace function public.fn_refresh_analytics()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  for r in
    select schemaname, matviewname
    from pg_matviews
    where schemaname='public'
      and matviewname in (
        'mv_pl_company_monthly',
        'mv_pl_personal_monthly',
        'mv_daily_cash_by_account',
        'mv_monthly_cashflow_by_account'
      )
  loop
    execute format('refresh materialized view concurrently %I.%I', r.schemaname, r.matviewname);
  end loop;
end; $$;

-- Agendamento diário 03:00 (idempotente)
create extension if not exists pg_cron;
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'faturai_analytics_nightly') then
    perform cron.schedule('faturai_analytics_nightly', '0 3 * * *', $$select public.fn_refresh_analytics();$$);
  end if;
end $$;