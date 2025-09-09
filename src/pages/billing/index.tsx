import { PlanCard } from '@/components/billing/PlanCard';
import { SubscriptionBadge } from '@/components/billing/SubscriptionBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Plan } from '@/lib/types';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';

const BillingPage = () => {
  const { user } = useAuth();
  const { subscription, isActive, isInTrial, daysUntilExpiration } = useSubscription(user?.id);

  // Mock plans data
  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 99.90,
      features: [
        'Até 1.000 transações/mês',
        'Importação de extratos CSV',
        'Relatórios básicos P&L',
        'Suporte por email',
        '2 entidades',
        '5 contas bancárias'
      ]
    },
    {
      id: 'professional',
      name: 'Profissional',
      price: 199.90,
      features: [
        'Até 5.000 transações/mês',
        'Importação CSV + OFX',
        'Relatórios avançados',
        'Categorização com IA',
        'Suporte prioritário',
        'Entidades ilimitadas',
        'Contas ilimitadas',
        'Regras de categorização',
        'Transações recorrentes'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 399.90,
      features: [
        'Transações ilimitadas',
        'Todos os recursos Profissional',
        'API de integração',
        'Relatórios personalizados',
        'Suporte 24/7',
        'Gerente de conta dedicado',
        'Backups automáticos',
        'Auditoria completa'
      ]
    }
  ];

  const currentPlan = plans.find(p => p.id === subscription?.plan_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e assinatura do FaturAI
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Plano Atual</h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan?.name || 'Nenhum plano ativo'}
              </p>
            </div>
            <SubscriptionBadge subscription={subscription} />
          </div>

          {subscription && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Válida até</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(subscription.valid_until).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Renovação</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {daysUntilExpiration > 0 ? `${daysUntilExpiration} dias` : 'Expirada'}
                </p>
              </div>
            </div>
          )}

          {isInTrial && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Você está no período de trial
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Aproveite todos os recursos gratuitamente por mais {daysUntilExpiration} dias.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button disabled>
              Renovar Assinatura (Em breve)
            </Button>
            <Button variant="outline" disabled>
              Alterar Forma de Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Planos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === subscription?.plan_id}
              disabled={true}
              onSelect={() => {
                console.log('Plan selection will be implemented with Stripe integration');
              }}
            />
          ))}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Últimos pagamentos da sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>Nenhum pagamento registrado</p>
            <p className="text-sm">O histórico aparecerá aqui após o primeiro pagamento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;