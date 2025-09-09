import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { RuleBuilderFormStub } from '@/components/finance/RuleBuilderFormStub';
import { Settings, Plus, Play, Pause, ArrowUp, ArrowDown } from 'lucide-react';
import { LocalRule } from '@/lib/types';

const RulesPage = () => {
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);

  // Mock rules data
  const mockRules: LocalRule[] = [
    {
      id: '1',
      user_id: 'mock-user-id',
      name: 'Postos de Combustível',
      match_type: 'contains',
      pattern: 'posto',
      scope: 'global',
      priority: 100,
      suggested_category: 'Combustível',
      active: true
    },
    {
      id: '2',
      user_id: 'mock-user-id',
      name: 'Pagamentos PIX Recebidos',
      match_type: 'starts_with',
      pattern: 'PIX RECEBIDO',
      scope: 'account',
      scope_id: '1',
      priority: 50,
      suggested_category: 'Receita de Serviços',
      active: true
    },
    {
      id: '3',
      user_id: 'mock-user-id',
      name: 'Google Ads - Marketing',
      match_type: 'equals',
      pattern: 'GOOGLE ADS',
      scope: 'global',
      priority: 80,
      suggested_category: 'Marketing Digital',
      active: true
    },
    {
      id: '4',
      user_id: 'mock-user-id',
      name: 'Transferências DOC/TED',
      match_type: 'regex',
      pattern: '(DOC|TED).*TRANSFERENCIA',
      scope: 'global',
      priority: 120,
      suggested_category: 'Transferência Bancária',
      active: false
    }
  ];

  const mockAccounts = [
    { id: '1', name: 'Conta Corrente PJ' },
    { id: '2', name: 'Conta Poupança' },
    { id: '3', name: 'Cartão Nubank' }
  ];

  const mockEntities = [
    { id: '1', name: 'Empresa' },
    { id: '2', name: 'Marco' },
    { id: '3', name: 'Keila' }
  ];

  const getScopeDisplay = (rule: LocalRule): string => {
    if (rule.scope === 'global') return 'Global';
    if (rule.scope === 'account') {
      const account = mockAccounts.find(acc => acc.id === rule.scope_id);
      return `Conta: ${account?.name || 'N/A'}`;
    }
    if (rule.scope === 'entity') {
      const entity = mockEntities.find(ent => ent.id === rule.scope_id);
      return `Entidade: ${entity?.name || 'N/A'}`;
    }
    return rule.scope;
  };

  const getMatchTypeDisplay = (matchType: string): string => {
    const types = {
      contains: 'Contém',
      equals: 'Igual',
      starts_with: 'Inicia com',
      regex: 'Regex'
    };
    return types[matchType as keyof typeof types] || matchType;
  };

  const columns = [
    {
      key: 'priority',
      label: 'Prioridade',
      width: 100,
      render: (value: number, _: LocalRule, index: number) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              disabled
              title="Mover para cima"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              disabled
              title="Mover para baixo"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Nome da Regra',
      width: 200,
      render: (value: string, row: LocalRule) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">
            {getMatchTypeDisplay(row.match_type)}: "{row.pattern}"
          </div>
        </div>
      )
    },
    {
      key: 'scope',
      label: 'Escopo',
      width: 150,
      render: (_: any, row: LocalRule) => (
        <Badge variant="outline" className="text-xs">
          {getScopeDisplay(row)}
        </Badge>
      )
    },
    {
      key: 'suggested_category',
      label: 'Categoria Sugerida',
      width: 180,
      render: (value: string) => (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'active',
      label: 'Status',
      width: 100,
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativa' : 'Pausada'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      width: 150,
      render: (_: any, row: LocalRule) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled
            title={row.active ? 'Pausar regra' : 'Ativar regra'}
          >
            {row.active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Editar regra"
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Testar regra"
          >
            Testar
          </Button>
        </div>
      )
    }
  ];

  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...mockRules].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regras de Categorização</h1>
          <p className="text-muted-foreground">
            Configure regras automáticas para categorizar transações baseadas em padrões
          </p>
        </div>
        
        <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Regra de Categorização</DialogTitle>
            </DialogHeader>
            <RuleBuilderFormStub />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Regras</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockRules.filter(r => r.active).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Globais</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockRules.filter(r => r.scope === 'global').length}
            </div>
            <p className="text-xs text-muted-foreground">Aplicam a todas as contas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras por Conta</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockRules.filter(r => r.scope === 'account').length}
            </div>
            <p className="text-xs text-muted-foreground">Específicas por conta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pausadas</CardTitle>
            <Settings className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockRules.filter(r => !r.active).length}
            </div>
            <p className="text-xs text-muted-foreground">Precisam atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Regras</CardTitle>
          <CardDescription>
            Regras são aplicadas por ordem de prioridade (menor número = maior prioridade).
            Regras locais sempre têm precedência sobre sugestões da IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataGridVirtualized
            data={sortedRules}
            columns={columns}
            height={400}
            rowHeight={60}
            onRowClick={(row) => console.log('Rule clicked:', row)}
          />
        </CardContent>
      </Card>

      {/* Rule Priority Information */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funcionam as Regras</CardTitle>
          <CardDescription>
            Entenda a lógica de aplicação das regras de categorização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Ordem de Precedência:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Regras locais (por ordem de prioridade - menor número primeiro)</li>
                <li>Sugestões da IA (quando nenhuma regra local se aplica)</li>
                <li>Categoria padrão (quando não há regra nem sugestão da IA)</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tipos de Correspondência:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Contém:</strong> A descrição deve conter o texto (mais flexível)</li>
                <li><strong>Igual:</strong> A descrição deve ser exatamente igual ao padrão</li>
                <li><strong>Inicia com:</strong> A descrição deve começar com o texto</li>
                <li><strong>Regex:</strong> Padrão de expressão regular (mais avançado)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Escopos Suportados:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Global:</strong> Aplica a transações de todas as contas</li>
                <li><strong>Conta específica:</strong> Aplica apenas a uma conta bancária</li>
                <li><strong>Entidade específica:</strong> Aplica apenas a uma entidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RulesPage;