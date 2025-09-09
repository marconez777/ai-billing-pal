import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { SplitBadge } from '@/components/finance/SplitBadge';
import { ParcelBadge } from '@/components/finance/ParcelBadge';
import { TransferFormStub } from '@/components/finance/TransferFormStub';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Plus, ArrowRightLeft, Split, CreditCard } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/pnl';

const TransactionsPage = () => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Mock transactions data with parent/child relationships
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      user_id: 'mock-user-id',
      account_id: '1',
      entity_id: '1',
      description: 'PIX RECEBIDO - CLIENTE SILVA LTDA',
      amount: 2500.00,
      date: '2024-01-15',
      kind: 'income',
      economic_nature: 'operational',
      counts_in_company_result: true,
      counts_in_personal_result: false
    },
    {
      id: '2',
      user_id: 'mock-user-id',
      account_id: '2',
      entity_id: '1',
      description: 'COMPRA PARCELADA - EQUIPAMENTOS',
      amount: -1200.00,
      date: '2024-01-10',
      kind: 'expense',
      economic_nature: 'operational',
      counts_in_company_result: true,
      counts_in_personal_result: false,
      installment_number: null,
      installment_total: 12
    },
    {
      id: '2-1',
      user_id: 'mock-user-id',
      account_id: '2',
      entity_id: '1',
      description: 'COMPRA PARCELADA - EQUIPAMENTOS (1/12)',
      amount: -100.00,
      date: '2024-01-10',
      kind: 'expense',
      economic_nature: 'operational',
      counts_in_company_result: true,
      counts_in_personal_result: false,
      parent_id: '2',
      installment_number: 1,
      installment_total: 12
    },
    {
      id: '2-2',
      user_id: 'mock-user-id',
      account_id: '2',
      entity_id: '1',
      description: 'COMPRA PARCELADA - EQUIPAMENTOS (2/12)',
      amount: -100.00,
      date: '2024-02-10',
      kind: 'expense',
      economic_nature: 'operational',
      counts_in_company_result: true,
      counts_in_personal_result: false,
      parent_id: '2',
      installment_number: 2,
      installment_total: 12
    },
    {
      id: '3',
      user_id: 'mock-user-id',
      account_id: '1',
      entity_id: '1',
      description: 'TRANSFERENCIA ENTRE CONTAS',
      amount: -1000.00,
      date: '2024-01-12',
      kind: 'transfer',
      economic_nature: 'internal_move',
      transfer_group_id: 'transfer-001',
      counts_in_company_result: false,
      counts_in_personal_result: false
    },
    {
      id: '4',
      user_id: 'mock-user-id',
      account_id: '2',
      entity_id: '1',
      description: 'TRANSFERENCIA ENTRE CONTAS',
      amount: 1000.00,
      date: '2024-01-12',
      kind: 'transfer',
      economic_nature: 'internal_move',
      transfer_group_id: 'transfer-001',
      counts_in_company_result: false,
      counts_in_personal_result: false
    }
  ];

  // Filter out child transactions for main display, show them only when parent is expanded
  const mainTransactions = mockTransactions.filter(t => !t.parent_id);
  const childTransactions = mockTransactions.filter(t => t.parent_id);

  // Build display data
  const displayData: Transaction[] = [];
  mainTransactions.forEach(transaction => {
    displayData.push(transaction);
    
    // If parent is expanded, add children
    if (expandedRows.includes(transaction.id)) {
      const children = childTransactions.filter(child => child.parent_id === transaction.id);
      displayData.push(...children);
    }
  });

  const toggleExpanded = (transactionId: string) => {
    setExpandedRows(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const columns = [
    {
      key: 'date',
      label: 'Data',
      width: 100,
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'description',
      label: 'Descrição',
      width: 300,
      render: (value: string, row: Transaction) => (
        <div className="space-y-1">
          <div className={`font-medium ${row.parent_id ? 'pl-6 text-sm' : ''}`}>
            {value}
          </div>
          <div className="flex gap-2">
            {row.installment_total && !row.parent_id && (
              <ParcelBadge
                currentInstallment={row.installment_number || 1}
                totalInstallments={row.installment_total}
                isParent={true}
                isExpanded={expandedRows.includes(row.id)}
                onToggle={() => toggleExpanded(row.id)}
                showCaret={true}
              />
            )}
            {row.installment_number && row.installment_total && row.parent_id && (
              <ParcelBadge
                currentInstallment={row.installment_number}
                totalInstallments={row.installment_total}
                isParent={false}
              />
            )}
            {row.transfer_group_id && (
              <Badge variant="outline" className="text-xs">
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                Transfer
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Valor',
      width: 120,
      render: (value: number, row: Transaction) => (
        <div className={row.parent_id ? 'pl-6' : ''}>
          <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(value)}
          </span>
        </div>
      )
    },
    {
      key: 'kind',
      label: 'Tipo',
      width: 100,
      render: (value: string) => {
        const variants = {
          income: { label: 'Receita', variant: 'default' as const },
          expense: { label: 'Despesa', variant: 'destructive' as const },
          transfer: { label: 'Transferência', variant: 'secondary' as const },
          adjustment: { label: 'Ajuste', variant: 'outline' as const }
        };
        const config = variants[value as keyof typeof variants];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      key: 'economic_nature',
      label: 'Natureza',
      width: 150,
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value === 'operational' ? 'Operacional' :
           value === 'salary' ? 'Salário' :
           value === 'owner_draw' ? 'Retirada' :
           value === 'internal_move' ? 'Movimentação' :
           value === 'investment' ? 'Investimento' :
           value}
        </Badge>
      )
    },
    {
      key: 'result_impact',
      label: 'Impacto P&L',
      width: 120,
      render: (_: any, row: Transaction) => (
        <div className="flex flex-col gap-1">
          {row.counts_in_company_result && (
            <Badge variant="default" className="text-xs">Empresa</Badge>
          )}
          {row.counts_in_personal_result && (
            <Badge variant="secondary" className="text-xs">Pessoal</Badge>
          )}
          {!row.counts_in_company_result && !row.counts_in_personal_result && (
            <Badge variant="outline" className="text-xs">Caixa</Badge>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as transações financeiras
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Nova Transferência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Transferência</DialogTitle>
              </DialogHeader>
              <TransferFormStub />
            </DialogContent>
          </Dialog>
          
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mainTransactions.filter(t => t.kind === 'income').reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.abs(mainTransactions.filter(t => t.kind === 'expense').reduce((sum, t) => sum + t.amount, 0)))}
            </div>
            <p className="text-xs text-muted-foreground">-5% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferências</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mainTransactions.filter(t => t.kind === 'transfer').length / 2}
            </div>
            <p className="text-xs text-muted-foreground">Pares de transferência</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Clique no caret para expandir transações parceladas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataGridVirtualized
            data={displayData}
            columns={columns}
            height={500}
            rowHeight={60}
            onRowClick={(row) => console.log('Transaction clicked:', row)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;