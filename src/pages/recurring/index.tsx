import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { RefreshCw, Plus, Play, Pause, Calendar, SkipForward } from 'lucide-react';
import { formatCurrency } from '@/lib/pnl';

interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  entity_id: string;
  description: string;
  amount: number;
  kind: 'income' | 'expense';
  economic_nature: string;
  rrule: string; // RRULE RFC standard
  next_run_at: string;
  last_run_at?: string;
  active: boolean;
  created_at: string;
}

const RecurringPage = () => {
  // Mock recurring transactions data
  const mockRecurringTransactions: RecurringTransaction[] = [
    {
      id: '1',
      user_id: 'mock-user-id',
      account_id: '1',
      entity_id: '1',
      description: 'ALUGUEL ESCRITORIO',
      amount: -2500.00,
      kind: 'expense',
      economic_nature: 'operational',
      rrule: 'FREQ=MONTHLY;BYMONTHDAY=5',
      next_run_at: '2024-02-05T10:00:00Z',
      last_run_at: '2024-01-05T10:00:00Z',
      active: true,
      created_at: '2023-12-01T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'mock-user-id',
      account_id: '2',
      entity_id: '1',
      description: 'HONORARIOS CONTADOR',
      amount: -800.00,
      kind: 'expense',
      economic_nature: 'operational',
      rrule: 'FREQ=MONTHLY;BYMONTHDAY=15',
      next_run_at: '2024-02-15T10:00:00Z',
      last_run_at: '2024-01-15T10:00:00Z',
      active: true,
      created_at: '2023-11-01T10:00:00Z'
    },
    {
      id: '3',
      user_id: 'mock-user-id',
      account_id: '1',
      entity_id: '1',
      description: 'CLIENTE MENSAL - EMPRESA XYZ',
      amount: 5000.00,
      kind: 'income',
      economic_nature: 'operational',
      rrule: 'FREQ=MONTHLY;BYMONTHDAY=1',
      next_run_at: '2024-03-01T10:00:00Z',
      last_run_at: '2024-02-01T10:00:00Z',
      active: true,
      created_at: '2023-10-01T10:00:00Z'
    },
    {
      id: '4',
      user_id: 'mock-user-id',
      account_id: '1',
      entity_id: '2',
      description: 'PRO-LABORE MENSAL',
      amount: 3500.00,
      kind: 'income',
      economic_nature: 'salary',
      rrule: 'FREQ=MONTHLY;BYMONTHDAY=25',
      next_run_at: '2024-02-25T10:00:00Z',
      active: false,
      created_at: '2023-09-01T10:00:00Z'
    }
  ];

  const mockAccounts = [
    { id: '1', name: 'Conta Corrente PJ' },
    { id: '2', name: 'Conta Poupança' },
    { id: '3', name: 'Cartão Nubank' }
  ];

  const parseRRule = (rrule: string): string => {
    if (rrule.includes('FREQ=MONTHLY')) {
      const dayMatch = rrule.match(/BYMONTHDAY=(\d+)/);
      const day = dayMatch ? dayMatch[1] : '1';
      return `Mensal, dia ${day}`;
    }
    if (rrule.includes('FREQ=WEEKLY')) {
      return 'Semanal';
    }
    if (rrule.includes('FREQ=YEARLY')) {
      return 'Anual';
    }
    return 'Personalizada';
  };

  const columns = [
    {
      key: 'description',
      label: 'Descrição',
      width: 250,
      render: (value: string, row: RecurringTransaction) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">
            {mockAccounts.find(acc => acc.id === row.account_id)?.name}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Valor',
      width: 120,
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'kind',
      label: 'Tipo',
      width: 100,
      render: (value: string) => (
        <Badge variant={value === 'income' ? 'default' : 'destructive'}>
          {value === 'income' ? 'Receita' : 'Despesa'}
        </Badge>
      )
    },
    {
      key: 'rrule',
      label: 'Frequência',
      width: 120,
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {parseRRule(value)}
        </Badge>
      )
    },
    {
      key: 'next_run_at',
      label: 'Próxima Execução',
      width: 150,
      render: (value: string, row: RecurringTransaction) => (
        <div className="space-y-1">
          <div className="text-sm">
            {new Date(value).toLocaleDateString('pt-BR')}
          </div>
          {row.last_run_at && (
            <div className="text-xs text-muted-foreground">
              Última: {new Date(row.last_run_at).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
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
      width: 180,
      render: (_: any, row: RecurringTransaction) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled
            title={row.active ? 'Pausar recorrência' : 'Retomar recorrência'}
          >
            {row.active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Gerar transação agora"
          >
            <SkipForward className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Editar recorrência"
          >
            Editar
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transações Recorrentes</h1>
          <p className="text-muted-foreground">
            Configure e gerencie transações que se repetem automaticamente
          </p>
        </div>
        
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Nova Recorrência
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recorrências</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRecurringTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockRecurringTransactions.filter(t => t.active).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Recorrentes</CardTitle>
            <RefreshCw className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockRecurringTransactions
                .filter(t => t.kind === 'income' && t.active)
                .reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Por mês (estimado)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Recorrentes</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.abs(mockRecurringTransactions
                .filter(t => t.kind === 'expense' && t.active)
                .reduce((sum, t) => sum + t.amount, 0)))}
            </div>
            <p className="text-xs text-muted-foreground">Por mês (estimado)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Execuções</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRecurringTransactions.filter(t => {
                const nextRun = new Date(t.next_run_at);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return t.active && nextRun <= nextWeek;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Recorrências</CardTitle>
          <CardDescription>
            Todas as transações configuradas para execução automática usando padrão RRULE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataGridVirtualized
            data={mockRecurringTransactions}
            columns={columns}
            height={400}
            rowHeight={60}
            onRowClick={(row) => console.log('Recurring transaction clicked:', row)}
          />
        </CardContent>
      </Card>

      {/* RRULE Information */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre Recorrências (RRULE)</CardTitle>
          <CardDescription>
            Como funcionam as regras de recorrência no FaturAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Padrões Suportados:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Mensal:</strong> FREQ=MONTHLY;BYMONTHDAY=X (dia X do mês)</li>
                <li><strong>Semanal:</strong> FREQ=WEEKLY (toda semana no mesmo dia)</li>
                <li><strong>Anual:</strong> FREQ=YEARLY (todo ano na mesma data)</li>
                <li><strong>Personalizado:</strong> Qualquer padrão RRULE válido</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recursos:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Execução automática baseada em <code>next_run_at</code></li>
                <li>Controle de exceções para datas específicas</li>
                <li>Botão "Gerar Agora" para execução manual</li>
                <li>Pausar/retomar recorrências sem perder configuração</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringPage;