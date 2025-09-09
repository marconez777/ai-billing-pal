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

export const TransferFormStub = () => {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
    date: new Date(),
    economicNature: 'internal_move',
    countsInCompanyResult: false,
    countsInPersonalResult: false
  });

  // Mock accounts data
  const mockAccounts = [
    { id: '1', name: 'Conta Corrente PJ', type: 'bank' },
    { id: '2', name: 'Conta Poupança', type: 'bank' },
    { id: '3', name: 'Cartão Nubank', type: 'card' },
    { id: '4', name: 'PayPal', type: 'wallet' }
  ];

  const economicNatures = [
    { value: 'internal_move', label: 'Movimentação Interna' },
    { value: 'owner_draw', label: 'Retirada Sócio' },
    { value: 'investment', label: 'Investimento' },
    { value: 'refund', label: 'Reembolso' }
  ];

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
                {mockAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
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
                {mockAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
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
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="countsInCompanyResult"
                checked={formData.countsInCompanyResult}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, countsInCompanyResult: !!checked }))
                }
              />
              <Label htmlFor="countsInCompanyResult" className="text-sm">
                Impacta P&L da Empresa
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="countsInPersonalResult"
                checked={formData.countsInPersonalResult}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, countsInPersonalResult: !!checked }))
                }
              />
              <Label htmlFor="countsInPersonalResult" className="text-sm">
                Impacta P&L Pessoal
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button type="button" className="flex-1" disabled>
            Criar Transferência (Em breve)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};