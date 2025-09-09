-- ==========================================================
-- PROMPT 4: RLS Extra + Analytics Views (FIXED)
-- ==========================================================

-- ==========================================================
-- PREPARO
-- ==========================================================
-- Garantir função de updated_at (pode já existir)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ==========================================================
-- VIEW: Transações Enriquecidas (join informativo)
-- ==========================================================
create or replace view public.v_transactions_enriched
with (security_invoker = true) as
select
  t.id,
  t.user_id,
  t.account_id,
  a.name        as account_name,
  a.account_type,
  t.entity_id,
  e.name        as entity_name,
  t.txn_date,
  t.amount,
  t.description,
  t.category_id,
  c.name        as category_name,
  t.kind,
  t.economic_nature,
  t.parent_id,
  t.installment_plan_id,
  t.installment_n,
  t.installment_of,
  t.invoice_id,
  t.transfer_group_id,
  t.counts_in_company_result,
  t.counts_in_personal_result,
  t.metadata,
  t.created_at,
  t.updated_at,
  -- campos úteis para relatórios
  case when t.amount > 0 then t.amount else 0 end as inflow,
  case when t.amount < 0 then abs(t.amount) else 0 end as outflow,
  date_trunc('month', t.txn_date)::date as month
from public.transactions t
join public.accounts   a on a.id = t.account_id and a.user_id = t.user_id
join public.entities   e on e.id = t.entity_id  and e.user_id = t.user_id
left join public.categories c on c.id = t.category_id;

-- ==========================================================
-- VIEW: P&L Empresa (exclui transfers; usa flag counts_in_company_result)
-- ==========================================================
create or replace view public.v_pl_company
with (security_invoker = true) as
select *
from public.v_transactions_enriched v
where v.counts_in_company_result = true
  and v.kind <> 'transfer';

-- Resumo mensal P&L Empresa
create or replace view public.v_pl_company_monthly
with (security_invoker = true) as
select
  user_id,
  month,
  sum(inflow)  as income,
  sum(outflow) as expenses,
  sum(amount)  as net_result
from public.v_pl_company
group by user_id, month;

-- ==========================================================
-- VIEW: P&L Pessoal (exclui transfers; usa flag counts_in_personal_result)
-- ==========================================================
create or replace view public.v_pl_personal
with (security_invoker = true) as
select *
from public.v_transactions_enriched v
where v.counts_in_personal_result = true
  and v.kind <> 'transfer';

-- Resumo mensal P&L Pessoal
create or replace view public.v_pl_personal_monthly
with (security_invoker = true) as
select
  user_id,
  month,
  sum(inflow)  as income,
  sum(outflow) as expenses,
  sum(amount)  as net_result
from public.v_pl_personal
group by user_id, month;

-- ==========================================================
-- VIEW: Ledger de Caixa (inclui transfers; fluxo por conta)
-- ==========================================================
create or replace view public.v_cash_ledger
with (security_invoker = true) as
select
  v.*,
  sum(v.amount) over (
    partition by v.user_id, v.account_id
    order by v.txn_date, v.created_at, v.id
    rows between unbounded preceding and current row
  ) as running_balance
from public.v_transactions_enriched v;

-- Saldos diários por conta (agregado)
create or replace view public.v_daily_cash_by_account
with (security_invoker = true) as
with daily as (
  select
    user_id,
    account_id,
    txn_date::date as day,
    sum(amount) as day_delta
  from public.v_transactions_enriched
  group by user_id, account_id, txn_date
)
select
  d.*,
  sum(d.day_delta) over (
    partition by d.user_id, d.account_id
    order by d.day
    rows between unbounded preceding and current row
  ) as day_balance
from daily d;

-- Resumo mensal de caixa (entrada/saída) por conta
create or replace view public.v_monthly_cashflow_by_account
with (security_invoker = true) as
select
  user_id,
  account_id,
  date_trunc('month', txn_date)::date as month,
  sum(case when amount > 0 then amount else 0 end) as cash_in,
  sum(case when amount < 0 then abs(amount) else 0 end) as cash_out,
  sum(amount) as net_cash
from public.v_transactions_enriched
group by user_id, account_id, date_trunc('month', txn_date)::date;

-- ==========================================================
-- VIEW: Transfers (origem/destino consolidadas por grupo) - FIXED
-- Nota: espera-se par de lançamentos com mesmo transfer_group_id
-- ==========================================================
create or replace view public.v_transfers
with (security_invoker = true) as
with transfer_pairs as (
  select
    t.user_id,
    t.transfer_group_id,
    t.txn_date,
    t.account_id,
    a.name as account_name,
    t.amount,
    t.description,
    case when t.amount < 0 then 'from' else 'to' end as direction
  from public.transactions t
  join public.accounts a on a.id = t.account_id
  where t.transfer_group_id is not null
)
select
  tp.user_id,
  tp.transfer_group_id,
  min(tp.txn_date) as txn_date,
  -- origem é a linha com amount < 0; destino a com amount > 0
  (array_agg(tp.account_id) filter (where tp.direction = 'from'))[1] as from_account_id,
  (array_agg(tp.account_name) filter (where tp.direction = 'from'))[1] as from_account_name,
  (array_agg(tp.account_id) filter (where tp.direction = 'to'))[1] as to_account_id,
  (array_agg(tp.account_name) filter (where tp.direction = 'to'))[1] as to_account_name,
  -- valor absoluto (assumindo simetria)
  max(abs(tp.amount)) as amount_abs,
  -- descrição preferindo a da origem
  coalesce(
    (array_agg(tp.description) filter (where tp.direction = 'from'))[1],
    (array_agg(tp.description) filter (where tp.direction = 'to'))[1]
  ) as description
from transfer_pairs tp
group by tp.user_id, tp.transfer_group_id;

-- ==========================================================
-- VIEW: Resumo de Faturas (cartão)
-- - calcula total de itens vinculados (invoice_items -> transactions)
-- - saldo em aberto considerando paid_amount
-- ==========================================================
create or replace view public.v_invoice_summaries
with (security_invoker = true) as
with items as (
  select
    ii.invoice_id,
    sum(case when t.amount < 0 then abs(t.amount) else 0 end) as charges_total,
    sum(case when t.amount > 0 then t.amount else 0 end)      as credits_total
  from public.invoice_items ii
  join public.transactions t on t.id = ii.transaction_id
  group by ii.invoice_id
)
select
  i.id,
  i.user_id,
  i.account_id,
  i.cycle_start,
  i.cycle_end,
  i.due_date,
  i.status,
  coalesce(it.charges_total, 0) - coalesce(it.credits_total, 0) as invoice_total,
  coalesce(i.paid_amount, 0) as paid_amount,
  (coalesce(it.charges_total, 0) - coalesce(it.credits_total, 0)) - coalesce(i.paid_amount, 0) as remaining_amount,
  i.payer_account_id,
  i.paid_at,
  i.created_at,
  i.updated_at
from public.invoices i
left join items it on it.invoice_id = i.id;

-- Aberto/em cobrança
create or replace view public.v_open_invoices
with (security_invoker = true) as
select *
from public.v_invoice_summaries
where status in ('open','partial','overdue')
  and remaining_amount > 0.005; -- tolerância centavos