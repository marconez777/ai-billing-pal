import { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { ApprovePaymentDialog } from './ApprovePaymentDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const PaymentsTab = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!payments_user_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar pagamentos",
        description: "Não foi possível carregar a lista de pagamentos"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.rpc('fn_admin_approve_payment', {
        p_payment_id: paymentId
      });

      if (error) throw error;

      toast({
        title: "Pagamento aprovado",
        description: "Assinatura estendida com sucesso"
      });

      fetchPayments(); // Refresh the list
      setDialogOpen(false);
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        variant: "destructive",
        title: "Erro ao aprovar pagamento",
        description: error.message || "Não foi possível aprovar o pagamento"
      });
    }
  };

  const handleRejectPayment = (paymentId: string, reason: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'rejected' as const }
        : payment
    ));
    
    toast({
      variant: "destructive",
      title: "Pagamento rejeitado",
      description: reason
    });
  };

  const columns = [
    {
      key: 'profiles.name',
      label: 'Usuário',
      render: (_: any, row: any) => row.profiles?.name || 'N/A'
    },
    {
      key: 'amount_cents',
      label: 'Valor',
      render: (value: number) => `R$ ${(value / 100).toFixed(2)}`
    },
    {
      key: 'provider',
      label: 'Provedor',
      render: (value: string) => (
        <Badge variant={value === 'stripe' ? 'default' : 'secondary'}>
          {value === 'stripe' ? 'Stripe' : 'Manual'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variants = {
          pending: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
          approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
          rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
        };
        
        const config = variants[value as keyof typeof variants];
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {value === 'pending' ? 'Pendente' : value === 'approved' ? 'Aprovado' : 'Rejeitado'}
          </Badge>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: any) => (
        <Button
          variant="outline"
          size="sm"
          disabled={row.status !== 'pending'}
          onClick={() => {
            setSelectedPayment(row);
            setDialogOpen(true);
          }}
          title={row.status !== 'pending' ? 'Apenas pagamentos pendentes podem ser processados' : 'Processar pagamento'}
        >
          {row.status === 'pending' ? 'Aprovar' : 'Processado'}
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pagamentos</h3>
        <div className="text-sm text-muted-foreground">
          Total: {payments.length} pagamentos
        </div>
      </div>

      <AdminTable
        data={payments}
        columns={columns}
        searchPlaceholder="Buscar por usuário ou valor..."
      />

      <ApprovePaymentDialog
        payment={selectedPayment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onApprove={handleApprovePayment}
        onReject={handleRejectPayment}
      />
    </div>
  );
};