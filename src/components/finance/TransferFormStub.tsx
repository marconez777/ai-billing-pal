import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, ArrowRightLeft } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/hooks/useAccounts';
import { useEntities } from '@/hooks/useEntities';

export const TransferFormStub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { rows: accounts, loading: accountsLoading } = useAccounts(true);
  const { rows: entities, loading: entitiesLoading } = useEntities(true);
  
  const [formData, setFormData] = useState({
    fromAccount: '',
    fromEntity: '',
    toAccount: '',
    toEntity: '',
    amount: '',
    description: '',
    date: new Date(),
    economicNature: 'internal_move',
    countsInPersonalResult: false
  });

  const [loading, setLoading] = useState(false);

  const economicNatures = [
    { value: 'internal_move', label: 'Movimentação Interna' },
    { value: 'owner_draw', label: 'Retirada Sócio' },
    { value: 'investment', label: 'Investimento' },
    { value: 'refund', label: 'Reembolso' }
  ];

  const handleSubmit = async () => {
    if (!user || !formData.fromAccount || !formData.fromEntity || 
        !formData.toAccount || !formData.toEntity || !formData.amount) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_create_transfer', {
        p_src_account: formData.fromAccount,
        p_src_entity: formData.fromEntity,
        p_dst_account: formData.toAccount,
        p_dst_entity: formData.toEntity,
        p_amount: Number(formData.amount),
        p_txn_date: format(formData.date, 'yyyy-MM-dd'),
        p_description: formData.description || 'Transferência',
        p_economic_nature: formData.economicNature,
        p_counts_personal: formData.countsInPersonalResult
      });

      if (error) throw error;

      toast({
        title: "Transferência criada",
        description: `Transfer group ID: ${data}`,
        action: (
          <Button variant="outline" size="sm" onClick={() => {
            // Navigate to transactions filtered by this group
            window.location.href = `/transactions?transfer_group=${data}`;
          }}>
            Ver no Extrato
          </Button>
        )
      });

      // Reset form
      setFormData({
        fromAccount: '',
        fromEntity: '',
        toAccount: '',
        toEntity: '',
        amount: '',
        description: '',
        date: new Date(),
        economicNature: 'internal_move',
        countsInPersonalResult: false
      });
    } catch (error: any) {
      console.error('Error creating transfer:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar transferência",
        description: error.message || "Verifique se as contas e entidades pertencem a você"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Nova Transferência
        </CardTitle>
        <CardDescription>
          Registre uma transferência entre contas. O sistema criará automaticamente 
          os lançamentos de débito e crédito vinculados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">Conta de Origem</Label>
            <Select value={formData.fromAccount} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, fromAccount: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta de origem" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.account_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAccount">Conta de Destino</Label>
            <Select value={formData.toAccount} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, toAccount: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta de destino" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(acc => acc.id !== formData.fromAccount).map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.account_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromEntity">Entidade de Origem</Label>
            <Select value={formData.fromEntity} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, fromEntity: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a entidade" />
              </SelectTrigger>
              <SelectContent>
                {entities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name} ({entity.entity_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toEntity">Entidade de Destino</Label>
            <Select value={formData.toEntity} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, toEntity: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a entidade" />
              </SelectTrigger>
              <SelectContent>
                {entities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name} ({entity.entity_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Descrição da transferência"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="economicNature">Natureza Econômica</Label>
          <Select value={formData.economicNature} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, economicNature: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {economicNatures.map(nature => (
                <SelectItem key={nature.value} value={nature.value}>
                  {nature.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Contabilização nos Resultados</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="countsInPersonalResult"
              checked={formData.countsInPersonalResult}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, countsInPersonalResult: !!checked }))
              }
            />
            <Label htmlFor="countsInPersonalResult" className="text-sm">
              Impacta P&L Pessoal (para retiradas de sócio, por exemplo)
            </Label>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            className="flex-1" 
            onClick={handleSubmit}
            disabled={loading || !user}
          >
            {loading ? 'Criando...' : 'Criar Transferência'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};