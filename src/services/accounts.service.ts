// src/services/accounts.service.ts
export type AccountType = 'bank' | 'card' | 'wallet';

export interface AccountRow {
  id: string;
  name: string;
  account_type: AccountType;
  currency: string;            // 'BRL' por padrão
  close_day?: number | null;   // para cartões
  due_day?: number | null;     // para cartões
  owner_entity_id?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IAccountsService {
  list(activeOnly?: boolean): Promise<AccountRow[]>;
  create(payload: Omit<AccountRow, 'id'|'created_at'|'updated_at'>): Promise<AccountRow>;
  update(id: string, patch: Partial<Omit<AccountRow,'id'>>): Promise<AccountRow>;
  delete(id: string): Promise<void>;
}

// Fallback em memória (para ambientes sem Supabase)
let _mem: AccountRow[] = [
  { id: 'mem-a1', name: 'Carteira', account_type: 'wallet', currency: 'BRL', is_active: true },
];
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export class AccountsServiceMemory implements IAccountsService {
  async list(activeOnly = true) {
    await sleep(120);
    return activeOnly ? _mem.filter(a=>a.is_active) : [..._mem];
  }
  async create(payload: Omit<AccountRow,'id'|'created_at'|'updated_at'>) {
    await sleep(120);
    const row: AccountRow = { id: 'mem-'+crypto.randomUUID(), ...payload };
    _mem.unshift(row); return row;
  }
  async update(id: string, patch: Partial<Omit<AccountRow,'id'>>) {
    await sleep(120);
    const i = _mem.findIndex(a=>a.id===id);
    if (i<0) throw new Error('Conta não encontrada');
    _mem[i] = { ..._mem[i], ...patch };
    return _mem[i];
  }
  async delete(id: string) {
    await sleep(80);
    _mem = _mem.filter(a=>a.id!==id);
  }
}