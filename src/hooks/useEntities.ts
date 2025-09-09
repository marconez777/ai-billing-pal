// src/hooks/useEntities.ts
import { useEffect, useMemo, useState } from 'react';
import { entitiesService } from '@/services';
import type { EntityRow, EntityType } from '@/services/entities.service';

export function useEntities(activeOnly = true) {
  const [rows, setRows]   = useState<EntityRow[]>([]);
  const [loading, setL]   = useState(false);
  const [error, setErr]   = useState<string|undefined>(undefined);

  const refresh = async () => {
    setL(true); setErr(undefined);
    try { setRows(await entitiesService.list(activeOnly)); }
    catch (e:any){ setErr(e.message ?? 'Erro ao buscar entidades'); }
    finally { setL(false); }
  };

  useEffect(()=>{ refresh(); /* eslint-disable-next-line */ }, [activeOnly]);

  const create = async (payload: Omit<EntityRow,'id'|'created_at'|'updated_at'>) => { await entitiesService.create(payload); await refresh(); };
  const update = async (id: string, patch: Partial<Omit<EntityRow,'id'>>) => { await entitiesService.update(id, patch); await refresh(); };
  const remove = async (id: string) => { await entitiesService.delete(id); await refresh(); };
  const countUsage = async (id: string) => entitiesService.countUsage(id);

  const companies = useMemo(()=> rows.filter(r=>r.entity_type==='company'), [rows]);
  const persons   = useMemo(()=> rows.filter(r=>r.entity_type==='person'), [rows]);
  const couples   = useMemo(()=> rows.filter(r=>r.entity_type==='couple'), [rows]);

  return { rows, loading, error, refresh, create, update, remove, countUsage, companies, persons, couples };
}
