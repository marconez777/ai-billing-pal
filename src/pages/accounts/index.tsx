import { useState, useMemo } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import EntitiesSelect from '@/components/finance/EntitiesSelect';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import type { AccountType } from '@/services/accounts.service';
import { useToast } from '@/hooks/use-toast';

const TYPES: {label:string,value:AccountType}[] = [
  { label:'Banco',  value:'bank'},
  { label:'Cartão', value:'card'},
  { label:'Carteira', value:'wallet'},
];

export default function AccountsPage() {
  const { rows, loading, create, update, remove } = useAccounts(true);
  const { toast } = useToast();

  // form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState('BRL');
  const [closeDay, setCloseDay] = useState<number|''>('');
  const [dueDay, setDueDay] = useState<number|''>('');
  const [owner, setOwner] = useState<string>('');
  const valid = name.trim().length>0;

  const columns = useMemo(()=>[
    { key:'name', label:'Nome', width:240 },
    { key:'account_type', label:'Tipo', width:120, render:(v:AccountType)=> TYPES.find(t=>t.value===v)?.label || v },
    { key:'currency', label:'Moeda', width:90 },
    { key:'owner_entity_id', label:'Dono', width:220, render:(v:string)=> v ? v : '-' },
    { key:'close_day', label:'Fechamento', width:110, render:(v:number|null)=> v ? `Dia ${v}` : '-' },
    { key:'due_day', label:'Vencimento', width:100, render:(v:number|null)=> v ? `Dia ${v}` : '-' },
    { key:'is_active', label:'Ativa', width:80, render:(v:boolean)=> v?'Sim':'Não' },
  ],[]);

  const handleSave = async () => {
    try {
      await create({
        name: name.trim(),
        account_type: type,
        currency,
        close_day: type==='card' ? (closeDay||null) : null,
        due_day: type==='card' ? (dueDay||null) : null,
        owner_entity_id: owner || null,
        is_active: true
      });
      setName(''); setOwner(''); setType('bank'); setCurrency('BRL'); setCloseDay(''); setDueDay('');
      toast({ title: 'Conta criada com sucesso!' });
    } catch (error: any) {
      toast({ title: 'Erro ao criar conta', description: error.message, variant: 'destructive' });
    }
  };

  const handleRowClick = async (row: any) => {
    try {
      await update({ id: row.id, patch: { is_active: !row.is_active } });
      toast({ title: `Conta ${row.is_active ? 'desativada' : 'ativada'} com sucesso!` });
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar conta', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contas</h1>
        <p className="text-muted-foreground">Cadastre suas contas bancárias, cartões e carteiras.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Nova Conta</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input 
              className="w-full border rounded px-3 py-2 mt-1" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="Ex.: Nubank final 1234" 
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select 
              className="w-full border rounded px-3 py-2 mt-1" 
              value={type} 
              onChange={e=>setType(e.target.value as AccountType)}
            >
              {TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Moeda</label>
            <input 
              className="w-full border rounded px-3 py-2 mt-1" 
              value={currency} 
              onChange={e=>setCurrency(e.target.value)} 
              placeholder="BRL" 
            />
          </div>
          {type==='card' && (
            <>
              <div>
                <label className="text-sm font-medium">Dia de Fechamento</label>
                <input 
                  type="number" 
                  min={1} 
                  max={31} 
                  className="w-full border rounded px-3 py-2 mt-1" 
                  value={closeDay} 
                  onChange={e=>setCloseDay(e.target.value?Number(e.target.value):'')} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dia de Vencimento</label>
                <input 
                  type="number" 
                  min={1} 
                  max={31} 
                  className="w-full border rounded px-3 py-2 mt-1" 
                  value={dueDay} 
                  onChange={e=>setDueDay(e.target.value?Number(e.target.value):'')} 
                />
              </div>
            </>
          )}
          <div className="md:col-span-2">
            <label className="text-sm font-medium block">Entidade (dona da conta)</label>
            <div className="mt-1">
              <EntitiesSelect value={owner} onChange={setOwner}/>
            </div>
          </div>
          <div className="flex items-end">
            <Button disabled={!valid || loading} onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Minhas Contas</CardTitle></CardHeader>
        <CardContent>
          <DataGridVirtualized
            height={480}
            rowHeight={40}
            columns={columns}
            data={rows}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}