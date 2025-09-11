// src/services/index.ts
import { EntitiesServiceSupabase } from './entities.supabase';
import { AccountsServiceSupabase } from './accounts.supabase';

export const entitiesService = new EntitiesServiceSupabase();
export const accountsService = new AccountsServiceSupabase();
// Agora usando Supabase real em vez do mock in-memory
