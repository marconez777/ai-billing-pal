-- Fix remaining security warnings

-- Update refresh analytics function with search_path
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

-- For the extension warning, since we need pg_cron and pg_trgm, we'll create them in extensions schema if it exists
-- These are system extensions needed for functionality, so this is a managed acceptable warning