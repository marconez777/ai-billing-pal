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
create or replace function public.fn_seed_categories_base()
returns int
language plpgsql
security invoker
as $$
declare
  uid uuid := auth.uid();
  inserted int := 0;
  parent_receitas uuid;
  parent_despesas uuid;
  cat_id uuid;
begin
  if uid is null then
    raise exception 'fn_seed_categories_base(): require authenticated user';
  end if;

  -- Helper para garantir categoria
  -- Receitas parent
  select id into parent_receitas from public.categories where user_id = uid and name = 'Receitas' limit 1;
  if parent_receitas is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Receitas', null) returning id into parent_receitas;
    inserted := inserted + 1;
  end if;

  -- Despesas parent
  select id into parent_despesas from public.categories where user_id = uid and name = 'Despesas' limit 1;
  if parent_despesas is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Despesas', null) returning id into parent_despesas;
    inserted := inserted + 1;
  end if;

  -- Receitas filhas
  select id into cat_id from public.categories where user_id = uid and name = 'Vendas/Serviços' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Vendas/Serviços', parent_receitas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Outras Receitas' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Outras Receitas', parent_receitas);
    inserted := inserted + 1;
  end if;

  -- Despesas filhas
  select id into cat_id from public.categories where user_id = uid and name = 'Moradia' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Moradia', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Transporte' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Transporte', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Alimentação' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Alimentação', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Saúde' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Saúde', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Educação' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Educação', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Assinaturas/Softwares' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Assinaturas/Softwares', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Impostos/Taxas' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Impostos/Taxas', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Tarifas Bancárias' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Tarifas Bancárias', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'IOF/Juros/Multa' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'IOF/Juros/Multa', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Investimentos' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Investimentos', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Marketing' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Marketing', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Operacional' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Operacional', parent_despesas);
    inserted := inserted + 1;
  end if;

  select id into cat_id from public.categories where user_id = uid and name = 'Folha/Pró-labore' limit 1;
  if cat_id is null then
    insert into public.categories (user_id, name, parent_id) values (uid, 'Folha/Pró-labore', parent_despesas);
    inserted := inserted + 1;
  end if;

  return inserted;
end; $$;

comment on function public.fn_seed_categories_base is
'Cria categorias base para o usuário autenticado (idempotente).';

-- =========================
-- 3) FUNÇÃO: seed de ENTIDADES para o usuário atual
-- =========================
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
  exists_id uuid;
begin
  if uid is null then
    raise exception 'fn_seed_entities_basic(): require authenticated user';
  end if;

  -- Company
  if p_company is not null and length(trim(p_company)) > 0 then
    select id into exists_id from public.entities where user_id = uid and name = p_company limit 1;
    if exists_id is null then
      insert into public.entities (user_id, name, entity_type) values (uid, p_company, 'company');
      created := created + 1;
    end if;
  end if;

  -- Person 1
  if p_person1 is not null and length(trim(p_person1)) > 0 then
    select id into exists_id from public.entities where user_id = uid and name = p_person1 limit 1;
    if exists_id is null then
      insert into public.entities (user_id, name, entity_type) values (uid, p_person1, 'person');
      created := created + 1;
    end if;
  end if;

  -- Person 2
  if p_person2 is not null and length(trim(p_person2)) > 0 then
    select id into exists_id from public.entities where user_id = uid and name = p_person2 limit 1;
    if exists_id is null then
      insert into public.entities (user_id, name, entity_type) values (uid, p_person2, 'person');
      created := created + 1;
    end if;
  end if;

  -- Couple
  if p_couple is not null and length(trim(p_couple)) > 0 then
    select id into exists_id from public.entities where user_id = uid and name = p_couple limit 1;
    if exists_id is null then
      insert into public.entities (user_id, name, entity_type) values (uid, p_couple, 'couple');
      created := created + 1;
    end if;
  end if;

  return created;
end; $$;

comment on function public.fn_seed_entities_basic is
'Cria entidades iniciais (empresa/pessoas/casal) para o usuário autenticado, se não existirem.';

-- =========================
-- 4) FUNÇÃO: seed de ACCOUNTS (contas/ cartões) para o usuário atual
-- =========================
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