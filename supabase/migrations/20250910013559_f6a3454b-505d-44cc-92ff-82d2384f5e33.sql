-- A) Hardening de ENTITIES
alter table public.entities
  add constraint if not exists chk_entities_name check (length(trim(name)) > 0);

create unique index if not exists uq_entities_user_name
  on public.entities(user_id, name);

create index if not exists idx_entities_user_active
  on public.entities(user_id, is_active);

-- (já existe RLS completo em entities / transactions / accounts / adjustments)
-- (transactions.entity_id segue ON DELETE RESTRICT, evitando apagar em uso)

-- B) (Opcional) RPC de uso por entidade — facilita UI (countUsage)
create or replace function public.fn_entity_usage(p_entity_id uuid)
returns jsonb
language plpgsql
security invoker
as $$
declare
  uid uuid := auth.uid();
  v_tx int := 0; v_acc int := 0; v_adj int := 0;
begin
  if uid is null then raise exception 'auth required'; end if;

  select count(*) into v_tx
    from public.transactions t where t.user_id = uid and t.entity_id = p_entity_id;

  select count(*) into v_acc
    from public.accounts a where a.user_id = uid and a.owner_entity_id = p_entity_id;

  select count(*) into v_adj
    from public.adjustments ad where ad.user_id = uid and ad.entity_id = p_entity_id;

  return jsonb_build_object(
    'transactions', v_tx,
    'accounts',     v_acc,
    'adjustments',  v_adj,
    'total',        (v_tx + v_acc + v_adj)
  );
end $$;

comment on function public.fn_entity_usage is 'Retorna contagem de uso (transactions, accounts, adjustments) da entidade do usuário atual.';