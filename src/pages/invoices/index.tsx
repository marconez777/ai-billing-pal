import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { CreditCard, Calendar, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatCurrency } from '@/lib/pnl';

const InvoicesPage = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Mock invoices data
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      user_id: 'mock-user-id',
      account_id: '3', // Cartão Nubank
      close_date: '2024-01-15',
      due_date: '2024-02-08',
      amount: 2850.00,
      paid_amount: 2850.00,
      payer_account_id: '1', // Conta Corrente PJ
      status: 'paid'
    },
    {
      id: '2',
      user_id: 'mock-user-id',
      account_id: '3',
      close_date: '2024-02-15',
      due_date: '2024-03-08',
      amount: 1950.00,
      status: 'open'
    },
    {
      id: '3',
      user_id: 'mock-user-id',
      account_id: '4', // Cartão Empresa
      close_date: '2024-01-20',
      due_date: '2024-02-12',
      amount: 890.00,
      status: 'overdue'
    }
  ];

  // Mock accounts for the select
  const mockAccounts = [
    { id: '1', name: 'Conta Corrente PJ' },
    { id: '2', name: 'Conta Poupança' },
    { id: '3', name: 'Cartão Nubank' },
    { id: '4', name: 'Cartão Empresa' }
  ];

  const columns = [
    {
      key: 'account',
      label: 'Cartão',
      width: 150,
      render: (_: any, row: Invoice) => {
        const account = mockAccounts.find(acc => acc.id === row.account_id);
        return account?.name || 'N/A';
      }
    },
    {
      key: 'close_date',
      label: 'Fechamento',
      width: 120,
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'due_date',
      label: 'Vencimento',
      width: 120,
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'amount',
      label: 'Valor',
      width: 120,
      render: (value: number) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 100,
      render: (value: string) => {
        const variants = {
          paid: { label: 'Paga', variant: 'default' as const, icon: null },
          open: { label: 'Em aberto', variant: 'secondary' as const, icon: null },
          overdue: { label: 'Vencida', variant: 'destructive' as const, icon: AlertTriangle }
        };
        const config = variants[value as keyof typeof variants];
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="flex items-center gap-1">
            {Icon && <Icon className="h-3 w-3" />}
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'payer_account',
      label: 'Pago por',
      width: 150,
      render: (_: any, row: Invoice) => {
        if (!row.payer_account_id) {
          return <span className="text-muted-foreground">-</span>;
        }
        const account = mockAccounts.find(acc => acc.id === row.payer_account_id);
        return (
          <Badge variant="outline" className="text-xs">
            {account?.name || 'N/A'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      width: 120,
      render: (_: any, row: Invoice) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedInvoice(row);
            setDetailDialogOpen(true);
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          Detalhes
        </Button>
      )
    }
  ];

  const InvoiceDetailDialog = () => {
    if (!selectedInvoice) return null;

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Fatura</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Informações Gerais</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cartão:</span>
                  <span>{mockAccounts.find(acc => acc.id === selectedInvoice.account_id)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fechamento:</span>
                  <span>{new Date(selectedInvoice.close_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span>{new Date(selectedInvoice.due_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Pagamento</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedInvoice.status === 'paid' ? 'default' : selectedInvoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                    {selectedInvoice.status === 'paid' ? 'Paga' : selectedInvoice.status === 'overdue' ? 'Vencida' : 'Em aberto'}
                  </Badge>
                </div>
                {selectedInvoice.paid_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Pago:</span>
                    <span className="text-green-600">{formatCurrency(selectedInvoice.paid_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago por:</span>
                  {selectedInvoice.payer_account_id ? (
                    <span>{mockAccounts.find(acc => acc.id === selectedInvoice.payer_account_id)?.name}</span>
                  ) : (
                    <Select disabled>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecionar conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAccounts.filter(acc => acc.id !== selectedInvoice.account_id).map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Matching Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Conciliação Automática (Futura)</p>
                <p className="text-muted-foreground">
                  O sistema buscará automaticamente movimentações de saída no período 
                  de vencimento (±3 dias) com valor similar (±R$1,00) para identificar 
                  qual conta foi usada para pagamento. Priorizará contas mais utilizadas 
                  para este cartão.
                </p>
              </div>
            </div>
          </div>

          {/* Mock Invoice Items */}
          <div className="space-y-2">
            <h3 className="font-medium">Itens da Fatura (Mock)</h3>
            <div className="border rounded-lg">
              <div className="p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>POSTO SHELL - COMBUSTIVEL</span>
                  <span>R$ 85,50</span>
                </div>
                <div className="flex justify-between">
                  <span>AMAZON - MATERIAL ESCRITORIO</span>
                  <span>R$ 234,90</span>
                </div>
                <div className="flex justify-between">
                  <span>GOOGLE ADS - MARKETING</span>
                  <span>R$ 450,00</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faturas de Cartão</h1>
        <p className="text-muted-foreground">
          Gerencie faturas de cartões de crédito e conciliação de pagamentos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Faturas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInvoices.length}</div>
            <p className="text-xs text-muted-foreground">Este ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockInvoices.filter(inv => inv.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando vencimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockInvoices.filter(inv => inv.status === 'overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Últimas 3 faturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Faturas</CardTitle>
          <CardDescription>
            Clique em "Detalhes" para ver informações completas da fatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataGridVirtualized
            data={mockInvoices}
            columns={columns}
            height={400}
            rowHeight={50}
            onRowClick={(row) => {
              setSelectedInvoice(row);
              setDetailDialogOpen(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <InvoiceDetailDialog />
      </Dialog>
    </div>
  );
};

export default InvoicesPage;