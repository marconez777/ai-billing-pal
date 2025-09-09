import { useState } from 'react';
import type { EntityRow, EntityType } from '@/services/entities.service';

type Props = {
  initial?: Partial<EntityRow>;
  onSubmit: (payload: Omit<EntityRow,'id'|'created_at'|'updated_at'>) => Promise<void>;
  onCancel?: () => void;
};

const TYPES: {label:string,value:EntityType}[] = [
  {label:'Empresa', value:'company'},
  {label:'Pessoa',  value:'person'},
  {label:'Casal',   value:'couple'},
];

export default function EntityForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<EntityType>(initial?.entity_type ?? 'company');
  const [active, setActive] = useState<boolean>(initial?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const valid = name.trim().length > 0;

  return (
    <form
      className="space-y-3"
      onSubmit={async (e)=>{ e.preventDefault(); if(!valid) return;
        setSubmitting(true);
        await onSubmit({ name: name.trim(), entity_type: type, is_active: active });
        setSubmitting(false);
      }}>
      <div className="space-y-1">
        <label className="text-sm">Nome</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Minha Empresa" />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Tipo</label>
        <select className="w-full border rounded px-3 py-2" value={type} onChange={e=>setType(e.target.value as EntityType)}>
          {TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
        <span>Ativo</span>
      </label>

      <div className="flex gap-2 justify-end">
        {onCancel && <button type="button" className="px-3 py-2 border rounded" onClick={onCancel}>Cancelar</button>}
        <button disabled={!valid||submitting} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
          {submitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
