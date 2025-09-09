-- ==============
-- PREPARO
-- ==============
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Atualizador genérico de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ==============
-- PROFILES
-- ==============
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'user' check (role in ('user','admin')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Função helper: sou admin? (após criar tabela profiles)
create or replace function public.is_admin(p_uid uuid default auth.uid())
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles
    where id = coalesce(p_uid, auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

alter table public.profiles enable row level security;

-- SELECT: o próprio usuário ou admin
drop policy if exists prof_select on public.profiles;
create policy prof_select on public.profiles
for select using (id = auth.uid() or public.is_admin());

-- INSERT: o próprio usuário (ou admin)
drop policy if exists prof_insert on public.profiles;
create policy prof_insert on public.profiles
for insert with check (id = auth.uid() or public.is_admin());

-- UPDATE: o próprio usuário pode editar seu nome; admin pode tudo
drop policy if exists prof_update_self on public.profiles;
create policy prof_update_self on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists prof_update_admin on public.profiles;
create policy prof_update_admin on public.profiles
for update using (public.is_admin())
with check (public.is_admin());

-- DELETE: apenas admin
drop policy if exists prof_delete_admin on public.profiles;
create policy prof_delete_admin on public.profiles
for delete using (public.is_admin());

-- Cria profile automaticamente quando novo usuário surge no auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name','Usuário'), 'user')
  on conflict (id) do nothing;
  return new;
end $$;

-- Pode falhar se já existir; tudo bem.
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  end if;
end $$;

-- ==============
-- PLANS
-- ==============
create table if not exists public.plans (
  code        text primary key,
  name        text not null,
  price_cents integer not null check (price_cents >= 0),
  period      text not null check (period in ('monthly','yearly')),
  limits      jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true,
  sort_order  int not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

alter table public.plans enable row level security;

-- Leitura aberta a usuários autenticados
drop policy if exists plans_select_all on public.plans;
create policy plans_select_all on public.plans
for select using (true);

-- CUD apenas admin
drop policy if exists plans_admin_cud on public.plans;
create policy plans_admin_cud on public.plans
for all using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_plans_active_order on public.plans (is_active, sort_order);

-- ==============
-- SUBSCRIPTIONS
-- ==============
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plan_code    text not null references public.plans(code) on update cascade,
  status       text not null check (status in ('active','past_due','canceled','trial')),
  valid_until  timestamptz null,
  trial_until  timestamptz null,
  canceled_at  timestamptz null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  metadata     jsonb not null default '{}'::jsonb
);

drop trigger if exists trg_subs_updated_at on public.subscriptions;
create trigger trg_subs_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- Garante no máximo 1 assinatura "vigente" por usuário (active/past_due/trial)
drop index if exists uq_sub_user_active;
create unique index uq_sub_user_active
on public.subscriptions(user_id)
where status in ('active','past_due','trial');

alter table public.subscriptions enable row level security;

-- SELECT: dono ou admin
drop policy if exists subs_select on public.subscriptions;
create policy subs_select on public.subscriptions
for select using (user_id = auth.uid() or public.is_admin());

-- INSERT: dono cria/atualiza sua assinatura (ou admin)
drop policy if exists subs_insert on public.subscriptions;
create policy subs_insert on public.subscriptions
for insert with check (user_id = auth.uid() or public.is_admin());

-- UPDATE/DELETE: apenas admin (evita fraude de datas/planos)
drop policy if exists subs_update_admin on public.subscriptions;
create policy subs_update_admin on public.subscriptions
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists subs_delete_admin on public.subscriptions;
create policy subs_delete_admin on public.subscriptions
for delete using (public.is_admin());

create index if not exists idx_subs_user on public.subscriptions(user_id);
create index if not exists idx_subs_status_valid on public.subscriptions(status, valid_until);

-- ==============
-- PAYMENTS
-- ==============
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid null references public.subscriptions(id) on delete set null,
  provider        text not null check (provider in ('manual','stripe')),
  amount_cents    integer not null check (amount_cents >= 0),
  status          text not null check (status in ('pending','approved','failed')),
  paid_at         timestamptz null,
  reference       text null,     -- ex.: TXID/Stripe session id/PIX ref
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

-- SELECT: dono ou admin
drop policy if exists pay_select on public.payments;
create policy pay_select on public.payments
for select using (user_id = auth.uid() or public.is_admin());

-- INSERT: dono cria pagamento 'pending' (ou admin)
drop policy if exists pay_insert on public.payments;
create policy pay_insert on public.payments
for insert with check (user_id = auth.uid() or public.is_admin());

-- UPDATE/DELETE: apenas admin (aprovar/recusar)
drop policy if exists pay_update_admin on public.payments;
create policy pay_update_admin on public.payments
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists pay_delete_admin on public.payments;
create policy pay_delete_admin on public.payments
for delete using (public.is_admin());

create index if not exists idx_pay_user on public.payments(user_id);
create index if not exists idx_pay_status_created on public.payments(status, created_at desc);

-- ==============
-- AUDIT LOGS
-- ==============
create table if not exists public.audit_logs (
  id           bigserial primary key,
  user_id      uuid null,          -- alvo do evento (ex.: dono da assinatura)
  actor_id     uuid null,          -- quem executou (admin/usuário/sistema)
  action       text not null,      -- ex.: 'payment.approved','subscription.canceled'
  table_name   text null,
  row_id       text null,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- SELECT: admin vê tudo; usuário vê logs próprios (onde user_id=ele ou actor_id=ele)
drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs
for select using (public.is_admin() or user_id = auth.uid() or actor_id = auth.uid());

-- INSERT: qualquer autenticado pode registrar um evento próprio (admin/rotas server-side usarão isso)
drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs
for insert with check (auth.uid() is not null);

-- UPDATE/DELETE: só admin
drop policy if exists audit_update_admin on public.audit_logs;
create policy audit_update_admin on public.audit_logs
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists audit_delete_admin on public.audit_logs;
create policy audit_delete_admin on public.audit_logs
for delete using (public.is_admin());