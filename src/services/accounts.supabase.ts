// src/services/accounts.supabase.ts
import { supabase } from '@/integrations/supabase/client';
import type { AccountRow, IAccountsService } from './accounts.service';

export class AccountsServiceSupabase implements IAccountsService {
  async list(activeOnly = true): Promise<AccountRow[]> {
    let q = supabase.from('accounts').select('*').order('created_at', { ascending: false });
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as AccountRow[];
  }
  async create(payload: Omit<AccountRow,'id'|'created_at'|'updated_at'>) {
    const { data, error } = await supabase.from('accounts').insert({
      ...payload,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }).select('*').single();
    if (error) throw error;
    return data as AccountRow;
  }
  async update(id: string, patch: Partial<Omit<AccountRow,'id'>>) {
    const { data, error } = await supabase.from('accounts').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return data as AccountRow;
  }
  async delete(id: string) {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  }
}