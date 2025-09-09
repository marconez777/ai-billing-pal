import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Settings, Lightbulb } from 'lucide-react';

export const RuleBuilderFormStub = () => {
  const [formData, setFormData] = useState({
    name: '',
    matchType: 'contains',
    pattern: '',
    scope: 'global',
    scopeId: '',
    priority: 100,
    suggestedCategory: '',
    active: true
  });

  const matchTypes = [
    { value: 'contains', label: 'Contém', description: 'A descrição contém o texto' },
    { value: 'equals', label: 'Igual', description: 'A descrição é exatamente igual' },
    { value: 'starts_with', label: 'Inicia com', description: 'A descrição inicia com o texto' },
    { value: 'regex', label: 'Regex', description: 'Padrão de expressão regular' }
  ];

  const scopes = [
    { value: 'global', label: 'Global', description: 'Aplica a todas as contas' },
    { value: 'account', label: 'Conta específica', description: 'Aplica apenas a uma conta' },
    { value: 'entity', label: 'Entidade específica', description: 'Aplica apenas a uma entidade' }
  ];

  const mockCategories = [
    'Receita de Serviços',
    'Marketing Digital',
    'Combustível',
    'Alimentação',
    'Material de Escritório',
    'Impostos',
    'Transferência Bancária'
  ];

  const mockAccounts = [
    { id: '1', name: 'Conta Corrente PJ' },
    { id: '2', name: 'Cartão Nubank' },
    { id: '3', name: 'PayPal' }
  ];

  const mockEntities = [
    { id: '1', name: 'Empresa' },
    { id: '2', name: 'Marco' },
    { id: '3', name: 'Keila' }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Criar Regra de Categorização
        </CardTitle>
        <CardDescription>
          Configure regras automáticas para categorizar transações baseadas em padrões de texto.
          Regras com maior prioridade serão aplicadas primeiro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Regra</Label>
          <Input
            id="name"
            placeholder="Ex: Pagamentos de combustível"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="matchType">Tipo de Correspondência</Label>
            <Select value={formData.matchType} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, matchType: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {matchTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern">Padrão de Texto</Label>
            <Input
              id="pattern"
              placeholder={
                formData.matchType === 'contains' ? 'posto' :
                formData.matchType === 'equals' ? 'POSTO SHELL' :
                formData.matchType === 'starts_with' ? 'POSTO' :
                '\\bposto\\b.*combustivel'
              }
              value={formData.pattern}
              onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope">Escopo da Regra</Label>
          <Select value={formData.scope} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, scope: value, scopeId: '' }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scopes.map(scope => (
                <SelectItem key={scope.value} value={scope.value}>
                  <div>
                    <div className="font-medium">{scope.label}</div>
                    <div className="text-xs text-muted-foreground">{scope.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.scope === 'account' && (
          <div className="space-y-2">
            <Label htmlFor="scopeAccount">Conta Específica</Label>
            <Select value={formData.scopeId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, scopeId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
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
        )}

        {formData.scope === 'entity' && (
          <div className="space-y-2">
            <Label htmlFor="scopeEntity">Entidade Específica</Label>
            <Select value={formData.scopeId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, scopeId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a entidade" />
              </SelectTrigger>
              <SelectContent>
                {mockEntities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="1000"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
            />
            <p className="text-xs text-muted-foreground">
              Menor número = maior prioridade
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedCategory">Categoria Sugerida</Label>
            <Select value={formData.suggestedCategory} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, suggestedCategory: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, active: !!checked }))
            }
          />
          <Label htmlFor="active" className="text-sm">
            Regra ativa
          </Label>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Prévia da Regra:</p>
              <p className="text-muted-foreground">
                Quando uma transação{' '}
                {formData.scope === 'account' ? 'na conta selecionada ' : 
                 formData.scope === 'entity' ? 'da entidade selecionada ' : ''}
                <Badge variant="outline" className="mx-1">
                  {matchTypes.find(t => t.value === formData.matchType)?.label.toLowerCase() || 'contém'}
                </Badge>
                o texto "{formData.pattern || '...'}",{' '}
                será categorizada como{' '}
                <Badge variant="secondary" className="mx-1">
                  {formData.suggestedCategory || 'categoria selecionada'}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button type="button" className="flex-1" disabled>
            Criar Regra (Em breve)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};