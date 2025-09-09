// src/services/entities.supabase.ts
import { IEntitiesService, EntityRow, EntityUsage } from './entities.service';
import { supabase } from '@/lib/supabaseClient';

export class EntitiesServiceSupabase implements IEntitiesService {
  async list(activeOnly = true): Promise<EntityRow[]> {
    let q = supabase.from('entities').select('*').order('created_at', { ascending: false });
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as EntityRow[];
  }
  async create(payload: Omit<EntityRow,'id'|'created_at'|'updated_at'>) {
    const { data, error } = await supabase.from('entities').insert(payload).select('*').single();
    if (error) throw error;
    return data as EntityRow;
  }
  async update(id: string, patch: Partial<Omit<EntityRow,'id'>>) {
    const { data, error } = await supabase.from('entities').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return data as EntityRow;
  }
  async delete(id: string) {
    const { error } = await supabase.from('entities').delete().eq('id', id);
    if (error) throw error;
  }
  async countUsage(id: string): Promise<EntityUsage> {
    // Versão 1: 3 contagens em paralelo (funciona com RLS)
    const [tx, acc, adj] = await Promise.all([
      supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('entity_id', id),
      supabase.from('accounts').select('id', { count: 'exact', head: true }).eq('owner_entity_id', id),
      supabase.from('adjustments').select('id', { count: 'exact', head: true }).eq('entity_id', id),
    ]);
    if (tx.error || acc.error || adj.error) throw tx.error || acc.error || adj.error;
    const usage: EntityUsage = {
      transactions: tx.count ?? 0,
      accounts: acc.count ?? 0,
      adjustments: adj.count ?? 0,
      total: (tx.count ?? 0) + (acc.count ?? 0) + (adj.count ?? 0),
    };
    return usage;
  }
}
