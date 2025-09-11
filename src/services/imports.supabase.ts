import { supabase } from '@/integrations/supabase/client';

export interface StagingPayload {
  import_id: string;
  account_id: string;
  txn_date: string;          // ISO date (YYYY-MM-DD)
  description: string;
  amount: number;            // número (positivo receita, negativo despesa)
  external_id?: string|null;
  metadata?: any;
}

export async function createImport(accountId: string, title: string, metadata: any = {}) {
  const { data, error } = await supabase.from('imports').insert({
    account_id: accountId,
    source: title,
    metadata,
    user_id: (await supabase.auth.getUser()).data.user?.id
  }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function insertStagingBatch(rows: StagingPayload[]) {
  // Adicionar user_id a cada linha
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const rowsWithUser = rows.map(row => ({
    ...row,
    user_id: userId
  }));
  
  // Inserção em lote
  const { error } = await supabase.from('staging_transactions').insert(rowsWithUser);
  if (error) throw error;
}