-- =========================
-- PREPARO
-- =========================
create extension if not exists pgcrypto;

-- Helper updated_at (idempotente)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =========================
-- 1) PLANS (globais) – upsert
-- =========================
-- Observação: estes inserts são globais e independem de auth.uid().
-- Se já existirem, serão atualizados (nome/preço/limits/sort_order).

insert into public.plans (code, name, price_cents, period, limits, is_active, sort_order)
values
  ('free',    'Free',      0,     'monthly', jsonb_build_object(
      'accounts_limit', 2, 'entities_limit', 2, 'imports_per_month', 5,
      'ai_categ_calls', 100, 'recurrences_limit', 3, 'invoices_limit', 3
  ), true, 10),
  ('starter', 'Starter',   4900,  'monthly', jsonb_build_object(
      'accounts_limit', 5, 'entities_limit', 4, 'imports_per_month', 50,
      'ai_categ_calls', 2000, 'recurrences_limit', 20, 'invoices_limit', 20
  ), true, 20),
  ('pro',     'Pro',       14900, 'monthly', jsonb_build_object(
      'accounts_limit', 20, 'entities_limit', 10, 'imports_per_month', 500,
      'ai_categ_calls', 10000, 'recurrences_limit', 200, 'invoices_limit', 200
  ), true, 30)
on conflict (code) do update
set name = excluded.name,
    price_cents = excluded.price_cents,
    period = excluded.period,
    limits = excluded.limits,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order,
    updated_at = now();

-- =========================
-- 2) FUNÇÃO: seed de CATEGORIAS base para o usuário atual
-- =========================
/*
Cria uma hierarquia básica de categorias para o usuário autenticado (auth.uid()).
RLS-friendly: SECURITY INVOKER e usa user_id = auth.uid().
Executar: select public.fn_seed_categories_base();
Pode ser chamada múltiplas vezes (idempotente).
*/
create or replace function public.fn_seed_categories_base()
returns int
language plpgsql
security invoker
as $$
declare
  uid uuid := auth.uid();
  inserted int := 0;

  -- helpers
  parent_receitas uuid;
  parent_despesas uuid;

  -- util local: garante existência de uma categoria e retorna id
  function ensure_cat(p_name text, p_parent uuid default null) returns uuid
  language plpgsql
  as $f$
  declare cid uuid;
  begin
    select id into cid from public.categories
      where user_id = uid and name = p_name limit 1;
    if cid is null then
      insert into public.categories (user_id, name, parent_id)
      values (uid, p_name, p_parent)
      returning id into cid;
      inserted := inserted + 1;
    end if;
    return cid;
  end;
  $f$;

begin
  if uid is null then
    raise exception 'fn_seed_categories_base(): require authenticated user';
  end if;

  -- Pais
  parent_receitas := ensure_cat('Receitas', null);
  parent_despesas := ensure_cat('Despesas', null);

  -- Receitas
  perform ensure_cat('Vendas/Serviços', parent_receitas);
  perform ensure_cat('Outras Receitas', parent_receitas);

  -- Despesas (grupos comuns para PF/PJ)
  perform ensure_cat('Moradia', parent_despesas);
  perform ensure_cat('Transporte', parent_despesas);
  perform ensure_cat('Alimentação', parent_despesas);
  perform ensure_cat('Saúde', parent_despesas);
  perform ensure_cat('Educação', parent_despesas);
  perform ensure_cat('Assinaturas/Softwares', parent_despesas);
  perform ensure_cat('Impostos/Taxas', parent_despesas);
  perform ensure_cat('Tarifas Bancárias', parent_despesas);
  perform ensure_cat('IOF/Juros/Multa', parent_despesas);
  perform ensure_cat('Investimentos', parent_despesas);
  perform ensure_cat('Marketing', parent_despesas);
  perform ensure_cat('Operacional', parent_despesas);
  perform ensure_cat('Folha/Pró-labore', parent_despesas);

  return inserted;
end; $$;

comment on function public.fn_seed_categories_base is
'Cria categorias base para o usuário autenticado (idempotente).';

-- =========================
-- 3) FUNÇÃO: seed de ENTIDADES para o usuário atual
-- =========================
/*
Cria até 4 entidades com nomes fornecidos (qualquer parâmetro pode ser NULL para pular).
Executar exemplo:
select public.fn_seed_entities_basic('Minha Empresa', 'Pessoa A', 'Pessoa B', 'Casal A');
*/
create or replace function public.fn_seed_entities_basic(
  p_company text default null,
  p_person1 text default null,
  p_person2 text default null,
  p_couple  text default null
) returns int
language plpgsql
security invoker
as $$
declare
  uid uuid := auth.uid();
  created int := 0;

  procedure ensure_entity(p_name text, p_type text)
  language plpgsql
  as $p$
  declare exists_id uuid;
  begin
    if p_name is null or length(trim(p_name)) = 0 then
      return;
    end if;
    select id into exists_id from public.entities
      where user_id = uid and name = p_name limit 1;
    if exists_id is null then
      insert into public.entities (user_id, name, entity_type)
      values (uid, p_name, p_type);
      created := created + 1;
    end if;
  end;
  $p$;

begin
  if uid is null then
    raise exception 'fn_seed_entities_basic(): require authenticated user';
  end if;

  if p_company is not null then
    perform ensure_entity(p_company, 'company');
  end if;
  if p_person1 is not null then
    perform ensure_entity(p_person1, 'person');
  end if;
  if p_person2 is not null then
    perform ensure_entity(p_person2, 'person');
  end if;
  if p_couple is not null then
    perform ensure_entity(p_couple, 'couple');
  end if;

  return created;
end; $$;

comment on function public.fn_seed_entities_basic is
'Cria entidades iniciais (empresa/pessoas/casal) para o usuário autenticado, se não existirem.';

-- =========================
-- 4) FUNÇÃO: seed de ACCOUNTS (contas/ cartões) para o usuário atual
-- =========================
/*
Cria contas básicas vinculadas às entidades por NOME.
Se não encontrar a entidade pelo nome, ignora aquela conta.
Executar exemplo:
select public.fn_seed_accounts_basic(
  jsonb_build_array(
    jsonb_build_object('name','Conta Corrente Itau','type','bank','owner','Minha Empresa'),
    jsonb_build_object('name','Cartão Nubank','type','card','owner','Pessoa A','close_day',5,'due_day',15)
  )
);
*/
create or replace function public.fn_seed_accounts_basic(p_accounts jsonb)
returns int
language plpgsql
security invoker
as $$
declare
  uid uuid := auth.uid();
  created int := 0;
  acc jsonb;
  v_name text;
  v_type text;
  v_owner text;
  v_close smallint;
  v_due smallint;
  owner_id uuid;
  exists_id uuid;
begin
  if uid is null then
    raise exception 'fn_seed_accounts_basic(): require authenticated user';
  end if;

  if p_accounts is null or jsonb_typeof(p_accounts) <> 'array' then
    raise exception 'Provide a JSONB array of accounts';
  end if;

  for acc in select * from jsonb_array_elements(p_accounts)
  loop
    v_name := acc->>'name';
    v_type := acc->>'type';
    v_owner := acc->>'owner';
    v_close := coalesce((acc->>'close_day')::smallint, null);
    v_due   := coalesce((acc->>'due_day')::smallint, null);

    if v_name is null or v_type is null then
      continue;
    end if;

    select id into owner_id from public.entities
      where user_id = uid and name = v_owner limit 1;

    -- evita duplicar por (user, name)
    select id into exists_id from public.accounts
      where user_id = uid and name = v_name limit 1;

    if exists_id is null then
      insert into public.accounts (user_id, owner_entity_id, name, account_type, close_day, due_day)
      values (uid, owner_id, v_name, v_type, v_close, v_due);
      created := created + 1;
    end if;
  end loop;

  return created;
end; $$;

comment on function public.fn_seed_accounts_basic is
'Cria contas básicas (bank/card/wallet) vinculadas por nome de entidade. JSONB de entrada define os itens.';

-- =========================
-- 5) FUNÇÃO: seed DEMO completo (opcional)
-- =========================
/*
Cria categorias base, entidades e duas contas (corrente + cartão).
Personalize os nomes conforme preferir.
*/
create or replace function public.fn_seed_demo_minimal(
  p_company text default 'Minha Empresa',
  p_person1 text default 'Pessoa A',
  p_person2 text default null,
  p_couple  text default 'Casal A'
) returns text
language plpgsql
security invoker
as $$
declare
  c int;
  e int;
  a int;
begin
  c := public.fn_seed_categories_base();
  e := public.fn_seed_entities_basic(p_company, p_person1, p_person2, p_couple);
  a := public.fn_seed_accounts_basic(
    jsonb_build_array(
      jsonb_build_object('name','Conta Corrente - '||p_company,'type','bank','owner',p_company),
      jsonb_build_object('name','Cartão - '||p_person1,'type','card','owner',p_person1,'close_day',5,'due_day',15)
    )
  );
  return format('Seed OK: categorias=%s, entidades=%s, contas=%s', c, e, a);
end; $$;

comment on function public.fn_seed_demo_minimal is
'Cria um conjunto mínimo de demo para o usuário autenticado (categorias, entidades e 2 contas).';