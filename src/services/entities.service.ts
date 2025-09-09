// src/services/entities.service.ts
export type EntityType = 'company'|'person'|'couple';

export interface EntityRow {
  id: string;
  name: string;
  entity_type: EntityType;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EntityUsage {
  transactions: number;
  accounts: number;
  adjustments: number;
  total: number;
}

export interface IEntitiesService {
  list(activeOnly?: boolean): Promise<EntityRow[]>;
  create(payload: Omit<EntityRow, 'id'|'created_at'|'updated_at'>): Promise<EntityRow>;
  update(id: string, patch: Partial<Omit<EntityRow,'id'>>): Promise<EntityRow>;
  delete(id: string): Promise<void>; // só permitido se uso=0 (UI valida)
  countUsage(id: string): Promise<EntityUsage>;
}

// -------- In-memory fallback (Jules) --------
let _mem: EntityRow[] = [
  { id: 'mem-1', name: 'Minha Empresa', entity_type: 'company', is_active: true },
  { id: 'mem-2', name: 'Pessoa A', entity_type: 'person', is_active: true },
  { id: 'mem-3', name: 'Casal A', entity_type: 'couple', is_active: false },
];

const sleep = (ms: number)=> new Promise(r=>setTimeout(r, ms));

export class EntitiesServiceMemory implements IEntitiesService {
  async list(activeOnly = true) {
    await sleep(150);
    return activeOnly ? _mem.filter(e=>e.is_active) : [..._mem];
  }
  async create(payload: Omit<EntityRow,'id'|'created_at'|'updated_at'>) {
    await sleep(120);
    const exists = _mem.some(e => e.name.trim().toLowerCase() === payload.name.trim().toLowerCase());
    if (exists) throw new Error('Já existe uma entidade com esse nome.');
    const row: EntityRow = { id: 'mem-'+crypto.randomUUID(), ...payload };
    _mem.unshift(row);
    return row;
  }
  async update(id: string, patch: Partial<Omit<EntityRow,'id'>>) {
    await sleep(120);
    const i = _mem.findIndex(e=>e.id===id);
    if (i<0) throw new Error('Entidade não encontrada.');
    _mem[i] = { ..._mem[i], ...patch };
    return _mem[i];
  }
  async delete(id: string) {
    await sleep(100);
    const i = _mem.findIndex(e=>e.id===id);
    if (i<0) return;
    // Simula regra: se "uso" > 0, bloqueia
    const usage = await this.countUsage(id);
    if (usage.total > 0) throw new Error('Não é possível excluir: existem vínculos. Inative.');
    _mem.splice(i,1);
  }
  async countUsage(_id: string): Promise<EntityUsage> {
    await sleep(80);
    // No mock, tudo 0 para permitir exclusão de quem não quiser testar vínculo
    return { transactions: 0, accounts: 0, adjustments: 0, total: 0 };
  }
}
