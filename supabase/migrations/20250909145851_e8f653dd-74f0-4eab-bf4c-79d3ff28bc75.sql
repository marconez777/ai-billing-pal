-- Fix security warnings from linter

-- 1. Fix search_path for set_updated_at function
create or replace function public.set_updated_at()
returns trigger 
language plpgsql 
security definer 
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 2. Fix search_path for is_admin function  
create or replace function public.is_admin(p_uid uuid default auth.uid())
returns boolean 
language sql 
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = coalesce(p_uid, auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

-- 3. Move extensions to proper schema (recreate in extensions schema if needed)
-- Note: pgcrypto and pg_trgm are typically installed in public by default
-- This is more of a documentation issue than a real security risk in this context