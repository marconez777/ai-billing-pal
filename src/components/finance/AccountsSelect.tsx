import { useAccounts } from '@/hooks/useAccounts';

export default function AccountsSelect({ value, onChange }:{
  value?: string; onChange: (id: string)=>void;
}) {
  const { rows, loading } = useAccounts(true);
  if (loading) return <select className="border rounded px-2 py-1"><option>Carregando…</option></select>;
  return (
    <select className="border rounded px-2 py-1" value={value ?? ''} onChange={e=>onChange(e.target.value)}>
      <option value="">Selecione…</option>
      {rows.map(a=> <option key={a.id} value={a.id}>{a.name} — {a.account_type}</option>)}
    </select>
  );
}