// src/services/index.ts
import { EntitiesServiceSupabase } from './entities.supabase';
export const entitiesService = new EntitiesServiceSupabase();
// Agora usando Supabase real em vez do mock in-memory
