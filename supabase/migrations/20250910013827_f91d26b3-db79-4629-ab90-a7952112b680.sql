-- Corrigir aviso de segurança: Function Search Path Mutable
-- Recriar a função com search_path fixo
DROP FUNCTION IF EXISTS public.fn_entity_usage(uuid);

CREATE OR REPLACE FUNCTION public.fn_entity_usage(p_entity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_tx int := 0; v_acc int := 0; v_adj int := 0;
BEGIN
  IF uid IS NULL THEN 
    RAISE EXCEPTION 'auth required'; 
  END IF;

  SELECT count(*) INTO v_tx
    FROM public.transactions t 
    WHERE t.user_id = uid AND t.entity_id = p_entity_id;

  SELECT count(*) INTO v_acc
    FROM public.accounts a 
    WHERE a.user_id = uid AND a.owner_entity_id = p_entity_id;

  SELECT count(*) INTO v_adj
    FROM public.adjustments ad 
    WHERE ad.user_id = uid AND ad.entity_id = p_entity_id;

  RETURN jsonb_build_object(
    'transactions', v_tx,
    'accounts',     v_acc,
    'adjustments',  v_adj,
    'total',        (v_tx + v_acc + v_adj)
  );
END $$;

COMMENT ON FUNCTION public.fn_entity_usage IS 'Retorna contagem de uso (transactions, accounts, adjustments) da entidade do usuário atual.';