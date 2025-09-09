import { useMemo, useState } from 'react';
import { useEntities } from '@/hooks/useEntities';
import EntityForm from '@/components/finance/EntityForm';
import type { EntityRow } from '@/services/entities.service';

export default function EntitiesPage() {
  const { rows, loading, error, create, update, remove, countUsage, refresh } = useEntities(false);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<EntityRow|undefined>(undefined);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    return q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Entidades</h1>
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2" placeholder="Buscar..." value={query} onChange={e=>setQuery(e.target.value)} />
          <button className="px-3 py-2 rounded bg-black text-white" onClick={()=>setCreating(true)}>Nova</button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {loading && <div>Carregando…</div>}

      {/* Tabela simples (poderia usar DataGridVirtualized) */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row=>(
              <tr key={row.id} className="border-t">
                <td className="p-3">{row.name}</td>
                <td className="p-3 capitalize">{row.entity_type}</td>
                <td className="p-3">{row.is_active ? 'Ativo' : 'Inativo'}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 border rounded" onClick={()=>setEditing(row)}>Editar</button>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={async ()=>{
                        const usage = await countUsage(row.id);
                        if (usage.total > 0) { alert('Não é possível excluir: existem vínculos. Inative.'); return; }
                        if (confirm(`Excluir "${row.name}"?`)) await remove(row.id);
                      }}>
                      Excluir
                    </button>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={()=>update(row.id, { is_active: !row.is_active })}>
                      {row.is_active ? 'Inativar' : 'Reativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && !loading && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhuma entidade.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de criar */}
      {creating && (
        <div className="fixed inset-0 grid place-items-center bg-black/30">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Nova entidade</h2>
            <EntityForm
              onSubmit={async (payload)=>{ await create(payload as any); setCreating(false); }}
              onCancel={()=>setCreating(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de editar */}
      {editing && (
        <div className="fixed inset-0 grid place-items-center bg-black/30">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Editar entidade</h2>
            <EntityForm
              initial={editing}
              onSubmit={async (payload)=>{ await update(editing.id, payload as any); setEditing(undefined); }}
              onCancel={()=>setEditing(undefined)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
