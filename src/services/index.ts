// src/services/index.ts
import { EntitiesServiceMemory } from './entities.service';
export const entitiesService = new EntitiesServiceMemory();
// Quando for usar Supabase amanhã, troque para:
// import { EntitiesServiceSupabase } from './entities.supabase';
// export const entitiesService = new EntitiesServiceSupabase();
