import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { CreditCard, Calendar, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatCurrency } from '@/lib/pnl';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const InvoicesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [invoicesRes, accountsRes] = await Promise.all([
          supabase.from('v_invoice_summaries').select('*').eq('user_id', user.id).order('due_date', { ascending: false }),
          supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true)
        ]);

        if (invoicesRes.error) throw invoicesRes.error;
        if (accountsRes.error) throw accountsRes.error;

        setInvoices(invoicesRes.data || []);
        setAccounts(accountsRes.data || []);
      } catch (error) {
        console.error('Error loading invoices:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar faturas",
          description: "Não foi possível carregar as faturas"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const handleAutoReconcile = async (invoiceId: string) => {
    setReconciling(invoiceId);
    try {
      const { data, error } = await supabase.rpc('fn_invoice_autoreconcile', {
        p_invoice_id: invoiceId,
        p_tolerance_cents: 100
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Fatura conciliada",
          description: `Conciliada com transação ${data}`,
        });
        // Reload invoices
        const { data: updatedInvoices } = await supabase
          .from('v_invoice_summaries')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: false });
        
        setInvoices(updatedInvoices || []);
      } else {
        toast({
          title: "Nenhum pagamento encontrado",
          description: "Não foi encontrado pagamento dentro da janela ±3 dias/tolerância",
        });
      }
    } catch (error: any) {
      console.error('Error reconciling invoice:', error);
      toast({
        variant: "destructive",
        title: "Erro na conciliação",
        description: error.message || "Erro ao tentar conciliar a fatura"
      });
    } finally {
      setReconciling(null);
    }
  };

  const columns = [
    {
      key: 'account',
      label: 'Cartão',
      width: 150,
      render: (_: any, row: any) => {
        const account = accounts.find(acc => acc.id === row.account_id);
        return account?.name || 'N/A';
      }
    },
    {
      key: 'cycle_start',
      label: 'Início Ciclo',
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
      key: 'invoice_total',
      label: 'Valor Total',
      width: 120,
      render: (value: number) => (
        <span className="font-medium">{formatCurrency(value || 0)}</span>
      )
    },
    {
      key: 'remaining_amount',
      label: 'Restante',
      width: 120,
      render: (value: number, row: any) => {
        if (!value || value <= 0) return <span className="text-green-600">—</span>;
        return <span className="font-medium text-red-600">{formatCurrency(value)}</span>;
      }
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
      render: (_: any, row: any) => {
        if (!row.payer_account_id) {
          return <span className="text-muted-foreground">—</span>;
        }
        const account = accounts.find(acc => acc.id === row.payer_account_id);
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
      width: 200,
      render: (_: any, row: any) => (
        <div className="flex gap-2">
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
          {row.status !== 'paid' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoReconcile(row.id)}
              disabled={reconciling === row.id}
            >
              {reconciling === row.id ? 'Conciliando...' : 'Conciliar'}
            </Button>
          )}
        </div>
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
                  <span>{accounts.find(acc => acc.id === selectedInvoice.account_id)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início Ciclo:</span>
                  <span>{new Date(selectedInvoice.cycle_start).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span>{new Date(selectedInvoice.due_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.invoice_total || 0)}</span>
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
                {selectedInvoice.remaining_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Restante:</span>
                    <span className="text-red-600">{formatCurrency(selectedInvoice.remaining_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago por:</span>
                  {selectedInvoice.payer_account_id ? (
                    <span>{accounts.find(acc => acc.id === selectedInvoice.payer_account_id)?.name}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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
                <p className="font-medium mb-1">Conciliação Automática</p>
                <p className="text-muted-foreground">
                  O sistema busca automaticamente movimentações de saída no período 
                  de vencimento (±3 dias) com valor similar (±R$1,00) para identificar 
                  qual conta foi usada para pagamento.
                </p>
                {selectedInvoice.status !== 'paid' && (
                  <Button 
                    className="mt-2" 
                    size="sm" 
                    onClick={() => handleAutoReconcile(selectedInvoice.id)}
                    disabled={reconciling === selectedInvoice.id}
                  >
                    {reconciling === selectedInvoice.id ? 'Conciliando...' : 'Tentar Conciliar'}
                  </Button>
                )}
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
                  <span>{formatCurrency(selectedInvoice.invoice_total || 0)}</span>
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
            <div className="text-2xl font-bold">{invoices.length}</div>
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
              {invoices.filter(inv => inv.status === 'open').length}
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
              {invoices.filter(inv => inv.status === 'overdue').length}
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
              {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.invoice_total || 0), 0))}
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
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DataGridVirtualized
              data={invoices}
              columns={columns}
              height={400}
              rowHeight={50}
              onRowClick={(row) => {
                setSelectedInvoice(row);
                setDetailDialogOpen(true);
              }}
            />
          )}
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