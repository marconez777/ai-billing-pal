import { useState } from 'react';
import { AdminTable } from './AdminTable';
import { ApprovePaymentDialog } from './ApprovePaymentDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/lib/types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for development
const mockPayments: Payment[] = [
  {
    id: '1',
    user_id: '1',
    subscription_id: '1',
    amount: 99.90,
    provider: 'manual',
    status: 'pending',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    user_id: '2',
    subscription_id: '2',
    amount: 199.90,
    provider: 'stripe',
    status: 'approved',
    created_at: '2024-01-02T14:30:00Z'
  }
];

export const PaymentsTab = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleApprovePayment = (paymentId: string, data: { extendDays: number; notes?: string }) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'approved' as const }
        : payment
    ));
    
    toast({
      title: "Pagamento aprovado",
      description: `Assinatura estendida por ${data.extendDays} dias`
    });
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
      key: 'user_id',
      label: 'Usuário ID'
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (value: number) => `R$ ${value.toFixed(2)}`
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
      render: (_: any, row: Payment) => (
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
          {row.status === 'pending' ? 'Processar' : 'Processado'}
        </Button>
      )
    }
  ];

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