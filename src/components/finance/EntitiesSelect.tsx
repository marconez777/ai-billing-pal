import { useEntities } from '@/hooks/useEntities';

export default function EntitiesSelect({ value, onChange }:{
  value?: string; onChange: (id: string)=>void;
}) {
  const { rows, loading } = useEntities(true);
  if (loading) return <select className="border rounded px-2 py-1"><option>Carregando…</option></select>;
  return (
    <select className="border rounded px-2 py-1" value={value ?? ''} onChange={e=>onChange(e.target.value)}>
      <option value="">Selecione…</option>
      {rows.map(e=> <option key={e.id} value={e.id}>{e.name} — {e.entity_type}</option>)}
    </select>
  );
}
