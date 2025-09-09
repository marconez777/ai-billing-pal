-- Aprova pagamento e estende assinatura do usuário de forma transacional (admin only)
create or replace function public.fn_admin_approve_payment(p_payment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid(); -- admin
  p record;
  s record;
  pl record;
  v_now timestamptz := now();
  v_new_valid_until timestamptz;
begin
  -- Apenas admin
  if not public.is_admin(v_actor) then
    raise exception 'Only admin can approve payments';
  end if;

  -- Carrega pagamento pendente
  select * into p from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Payment not found';
  end if;
  if p.status <> 'pending' then
    raise exception 'Payment must be pending';
  end if;

  -- Assinatura (ou cria se não houver)
  if p.subscription_id is null then
    -- assume assinatura vigente única por usuário: cria trial/past_due e depois ativa
    insert into public.subscriptions (user_id, plan_code, status, valid_until)
    values (p.user_id, 'starter', 'past_due', null)
    returning * into s;
  else
    select * into s from public.subscriptions where id = p.subscription_id for update;
  end if;

  -- Plano
  select * into pl from public.plans where code = s.plan_code and is_active = true;
  if pl.code is null then
    raise exception 'Plan not found or inactive';
  end if;

  -- Calcula nova validade
  v_new_valid_until := coalesce(s.valid_until, v_now);
  if pl.period = 'monthly' then
    v_new_valid_until := v_new_valid_until + interval '30 days';
  else
    v_new_valid_until := v_new_valid_until + interval '1 year';
  end if;

  -- Atualiza pagamento
  update public.payments
  set status = 'approved', paid_at = v_now, subscription_id = s.id
  where id = p.id;

  -- Atualiza assinatura
  update public.subscriptions
  set status = 'active', valid_until = v_new_valid_until, trial_until = null, updated_at = v_now
  where id = s.id;

  -- Audit
  insert into public.audit_logs (user_id, actor_id, action, table_name, row_id, payload)
  values (p.user_id, v_actor, 'payment.approved', 'payments', p.id::text,
          jsonb_build_object('amount_cents', p.amount_cents, 'provider', p.provider, 'subscription_id', s.id));

  return jsonb_build_object(
    'subscription_id', s.id,
    'new_valid_until', v_new_valid_until,
    'payment_id', p.id,
    'status', 'ok'
  );
end $$;