-- =========================
-- PREPARO E HELPERS
-- =========================
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- Atualizador genérico de updated_at (idempotente)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =========================
-- 1) ENTIDADES
-- =========================
create table if not exists public.entities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  entity_type text not null check (entity_type in ('company','person','couple')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_entities_user on public.entities(user_id);

drop trigger if exists trg_entities_updated_at on public.entities;
create trigger trg_entities_updated_at
before update on public.entities
for each row execute function public.set_updated_at();

alter table public.entities enable row level security;

drop policy if exists ent_select on public.entities;
create policy ent_select on public.entities
for select using (user_id = auth.uid());

drop policy if exists ent_insert on public.entities;
create policy ent_insert on public.entities
for insert with check (user_id = auth.uid());

drop policy if exists ent_update on public.entities;
create policy ent_update on public.entities
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists ent_delete on public.entities;
create policy ent_delete on public.entities
for delete using (user_id = auth.uid());

-- =========================
-- 2) CATEGORIAS
-- =========================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  parent_id   uuid null references public.categories(id) on delete set null,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, name)
);
create index if not exists idx_categories_user on public.categories(user_id);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists cat_select on public.categories;
create policy cat_select on public.categories
for select using (user_id = auth.uid());

drop policy if exists cat_insert on public.categories;
create policy cat_insert on public.categories
for insert with check (user_id = auth.uid());

drop policy if exists cat_update on public.categories;
create policy cat_update on public.categories
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists cat_delete on public.categories;
create policy cat_delete on public.categories
for delete using (user_id = auth.uid());

-- =========================
-- 3) CONTAS
-- =========================
create table if not exists public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  owner_entity_id uuid null references public.entities(id) on delete set null,
  name            text not null,
  account_type    text not null check (account_type in ('bank','card','wallet')),
  currency        char(3) not null default 'BRL',
  close_day       smallint null check (close_day between 1 and 31),
  due_day         smallint null check (due_day between 1 and 31),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_accounts_owner on public.accounts(owner_entity_id);

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

alter table public.accounts enable row level security;

drop policy if exists acc_select on public.accounts;
create policy acc_select on public.accounts
for select using (user_id = auth.uid());

drop policy if exists acc_insert on public.accounts;
create policy acc_insert on public.accounts
for insert with check (user_id = auth.uid());

drop policy if exists acc_update on public.accounts;
create policy acc_update on public.accounts
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists acc_delete on public.accounts;
create policy acc_delete on public.accounts
for delete using (user_id = auth.uid());

-- =========================
-- 4) IMPORTS (lotes de extrato)
-- =========================
create table if not exists public.imports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  account_id   uuid not null references public.accounts(id) on delete cascade,
  source       text null,      -- ex.: 'csv-itau','ofx-nubank'
  period_start date null,
  period_end   date null,
  file_hash    text null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique(user_id, file_hash)
);
create index if not exists idx_imports_user on public.imports(user_id);
create index if not exists idx_imports_account on public.imports(account_id);

alter table public.imports enable row level security;

drop policy if exists imp_select on public.imports;
create policy imp_select on public.imports
for select using (user_id = auth.uid());

drop policy if exists imp_insert on public.imports;
create policy imp_insert on public.imports
for insert with check (user_id = auth.uid());

drop policy if exists imp_update on public.imports;
create policy imp_update on public.imports
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists imp_delete on public.imports;
create policy imp_delete on public.imports
for delete using (user_id = auth.uid());

-- =========================
-- 5) STAGING (triagem)
-- =========================
create table if not exists public.staging_transactions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  import_id          uuid not null references public.imports(id) on delete cascade,
  account_id         uuid not null references public.accounts(id) on delete cascade,
  external_id        text null,
  txn_date           date not null,
  amount             numeric(14,2) not null,
  description        text not null,
  description_norm   text generated always as (regexp_replace(lower(coalesce(description,'')),'\\s+',' ','g')) stored,
  description_hash   text generated always as (md5(regexp_replace(lower(coalesce(description,'')),'\\s+',' ','g'))) stored,
  ai_category_hint   text null,
  ai_confidence      numeric(5,2) null check (ai_confidence between 0 and 100),
  suggested_category_id uuid null references public.categories(id) on delete set null,
  suggested_entity_id   uuid null references public.entities(id) on delete set null,
  status             text not null default 'pending' check (status in ('pending','approved','ignored','skipped')),
  lock_owner         uuid null references auth.users(id) on delete set null,
  locked_at          timestamptz null,
  version            int not null default 1,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

-- Evita duplicados por import+external_id
create unique index if not exists uq_staging_import_external
  on public.staging_transactions(import_id, external_id) where external_id is not null;

-- Dedupe heurístico
create index if not exists idx_staging_dedupe
  on public.staging_transactions(account_id, txn_date, amount, description_hash);

create index if not exists idx_staging_user
  on public.staging_transactions(user_id);

alter table public.staging_transactions enable row level security;

drop policy if exists stg_select on public.staging_transactions;
create policy stg_select on public.staging_transactions
for select using (user_id = auth.uid());

drop policy if exists stg_insert on public.staging_transactions;
create policy stg_insert on public.staging_transactions
for insert with check (user_id = auth.uid());

drop policy if exists stg_update on public.staging_transactions;
create policy stg_update on public.staging_transactions
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists stg_delete on public.staging_transactions;
create policy stg_delete on public.staging_transactions
for delete using (user_id = auth.uid());

-- =========================
-- 6) INVOICES (criar antes de transactions por FK)
-- =========================
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  account_id      uuid not null references public.accounts(id) on delete cascade,
  cycle_start     date not null,
  cycle_end       date not null,
  due_date        date not null,
  status          text not null default 'open' check (status in ('open','closed','paid','partial','overdue')),
  paid_amount     numeric(14,2) null,
  paid_at         date null,
  payer_account_id uuid null references public.accounts(id) on delete set null, -- de onde saiu o pagamento
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, account_id, cycle_start, cycle_end)
);
create index if not exists idx_invoices_user on public.invoices(user_id);
create index if not exists idx_invoices_account on public.invoices(account_id);

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

drop policy if exists inv_select on public.invoices;
create policy inv_select on public.invoices
for select using (user_id = auth.uid());

drop policy if exists inv_insert on public.invoices;
create policy inv_insert on public.invoices
for insert with check (user_id = auth.uid());

drop policy if exists inv_update on public.invoices;
create policy inv_update on public.invoices
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists inv_delete on public.invoices;
create policy inv_delete on public.invoices
for delete using (user_id = auth.uid());

-- =========================
-- 7) TRANSACTIONS (lançamentos finais)
-- =========================
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  account_id    uuid not null references public.accounts(id) on delete cascade,
  entity_id     uuid not null references public.entities(id) on delete restrict,
  txn_date      date not null,
  amount        numeric(14,2) not null check (amount <> 0),
  description   text not null,
  category_id   uuid null references public.categories(id) on delete set null,
  kind          text not null check (kind in ('income','expense','transfer','adjustment')),
  economic_nature text null check (economic_nature in (
    'operational','salary','owner_draw','internal_move','refund','investment','fee','interest','fine','iof','discount'
  )),
  parent_id     uuid null references public.transactions(id) on delete set null, -- split
  installment_plan_id uuid null,
  installment_n smallint null,
  installment_of smallint null,
  invoice_id    uuid null references public.invoices(id) on delete set null,
  transfer_group_id uuid null,
  counts_in_company_result boolean not null default false,
  counts_in_personal_result boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_tx_user_date on public.transactions(user_id, txn_date);
create index if not exists idx_tx_account_date on public.transactions(account_id, txn_date);
create index if not exists idx_tx_entity on public.transactions(entity_id);
create index if not exists idx_tx_category on public.transactions(category_id);
create index if not exists idx_tx_invoice on public.transactions(invoice_id);
create index if not exists idx_tx_transfer on public.transactions(transfer_group_id);
create index if not exists idx_tx_installment on public.transactions(installment_plan_id);

drop trigger if exists trg_tx_updated_at on public.transactions;
create trigger trg_tx_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.transactions enable row level security;

drop policy if exists tx_select on public.transactions;
create policy tx_select on public.transactions
for select using (user_id = auth.uid());

drop policy if exists tx_insert on public.transactions;
create policy tx_insert on public.transactions
for insert with check (user_id = auth.uid());

drop policy if exists tx_update on public.transactions;
create policy tx_update on public.transactions
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists tx_delete on public.transactions;
create policy tx_delete on public.transactions
for delete using (user_id = auth.uid());

-- =========================
-- 8) INVOICE ITEMS (vínculo N:N)
-- =========================
create table if not exists public.invoice_items (
  invoice_id     uuid not null references public.invoices(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  primary key (invoice_id, transaction_id)
);

-- Garante que cada transação pertence a no máximo 1 fatura
create unique index if not exists uq_invoice_item_tx on public.invoice_items(transaction_id);

alter table public.invoice_items enable row level security;

-- RLS por existência: usuário deve ser dono da invoice E da transaction
drop policy if exists invitem_select on public.invoice_items;
create policy invitem_select on public.invoice_items
for select using (
  exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
  and
  exists (select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid())
);

drop policy if exists invitem_insert on public.invoice_items;
create policy invitem_insert on public.invoice_items
for insert with check (
  exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
  and
  exists (select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid())
);

drop policy if exists invitem_delete on public.invoice_items;
create policy invitem_delete on public.invoice_items
for delete using (
  exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
  and
  exists (select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid())
);

-- (Update não é necessário; a PK não deve mudar)

-- =========================
-- 9) ADJUSTMENTS (IOF/JUROS/MULTA/FEE/DESCONTO)
-- =========================
create table if not exists public.adjustments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid null references public.transactions(id) on delete cascade,
  invoice_id     uuid null references public.invoices(id) on delete cascade,
  kind        text not null check (kind in ('iof','interest','fine','fee','discount')),
  entity_id   uuid not null references public.entities(id) on delete restrict,
  amount      numeric(14,2) not null,
  note        text null,
  created_at  timestamptz not null default now(),
  check ((transaction_id is not null) or (invoice_id is not null))
);
create index if not exists idx_adj_user on public.adjustments(user_id);

alter table public.adjustments enable row level security;

drop policy if exists adj_select on public.adjustments;
create policy adj_select on public.adjustments
for select using (user_id = auth.uid());

drop policy if exists adj_insert on public.adjustments;
create policy adj_insert on public.adjustments
for insert with check (user_id = auth.uid());

drop policy if exists adj_update on public.adjustments;
create policy adj_update on public.adjustments
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists adj_delete on public.adjustments;
create policy adj_delete on public.adjustments
for delete using (user_id = auth.uid());

-- =========================
-- 10) REGRAS RECORRENTES (RRULE)
-- =========================
create table if not exists public.recurring_rules (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  entity_id    uuid not null references public.entities(id) on delete cascade,
  category_id  uuid null references public.categories(id) on delete set null,
  account_id   uuid null references public.accounts(id) on delete set null,
  title        text not null,
  amount       numeric(14,2) null, -- pode ser preenchido na geração
  rrule        text not null,
  next_run_at  timestamptz null,
  last_run_at  timestamptz null,
  is_paused    boolean not null default false,
  template     jsonb not null default '{}'::jsonb, -- ex.: { "description": "Luz EDP" }
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_recurring_user on public.recurring_rules(user_id);

drop trigger if exists trg_recurring_updated_at on public.recurring_rules;
create trigger trg_recurring_updated_at
before update on public.recurring_rules
for each row execute function public.set_updated_at();

alter table public.recurring_rules enable row level security;

drop policy if exists rr_select on public.recurring_rules;
create policy rr_select on public.recurring_rules
for select using (user_id = auth.uid());

drop policy if exists rr_insert on public.recurring_rules;
create policy rr_insert on public.recurring_rules
for insert with check (user_id = auth.uid());

drop policy if exists rr_update on public.recurring_rules;
create policy rr_update on public.recurring_rules
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists rr_delete on public.recurring_rules;
create policy rr_delete on public.recurring_rules
for delete using (user_id = auth.uid());

-- =========================
-- 11) REGRAS LOCAIS (triagem automática)
-- =========================
create table if not exists public.local_rules (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  scope              text not null default 'global' check (scope in ('global','account','entity')),
  account_id         uuid null references public.accounts(id) on delete cascade,
  entity_id          uuid null references public.entities(id) on delete cascade,
  match_type         text not null check (match_type in ('contains','equals','starts_with','regex')),
  pattern            text not null,
  suggest_category_id uuid null references public.categories(id) on delete set null,
  suggest_entity_id   uuid null references public.entities(id) on delete set null,
  priority           int not null default 100,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_local_rules_user on public.local_rules(user_id);
create index if not exists idx_local_rules_pattern on public.local_rules using gin (pattern gin_trgm_ops);

drop trigger if exists trg_local_rules_updated_at on public.local_rules;
create trigger trg_local_rules_updated_at
before update on public.local_rules
for each row execute function public.set_updated_at();

alter table public.local_rules enable row level security;

drop policy if exists lr_select on public.local_rules;
create policy lr_select on public.local_rules
for select using (user_id = auth.uid());

drop policy if exists lr_insert on public.local_rules;
create policy lr_insert on public.local_rules
for insert with check (user_id = auth.uid());

drop policy if exists lr_update on public.local_rules;
create policy lr_update on public.local_rules
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists lr_delete on public.local_rules;
create policy lr_delete on public.local_rules
for delete using (user_id = auth.uid());