import { PlanCard } from '@/components/billing/PlanCard';
import { SubscriptionBadge } from '@/components/billing/SubscriptionBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Plan } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const BillingPage = () => {
  const { user } = useAuth();
  const { subscription, isActive, isInTrial, daysUntilExpiration, loading } = useSubscription(user?.id);
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState<string | null>(null);

  // Load plans from Supabase
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;

        // Transform database plans to expected format
        const transformedPlans: Plan[] = data.map(plan => {
          const limits = plan.limits as any; // Cast JSON to any to access properties
          return {
            id: plan.code,
            name: plan.name,
            price: plan.price_cents / 100, // Convert cents to reais
            features: [
              `${limits.accounts_limit || 0} contas`,
              `${limits.entities_limit || 0} entidades`,
              `${limits.imports_per_month || 0} importações/mês`,
              `${limits.ai_categ_calls || 0} categorização IA/mês`,
              `${limits.recurrences_limit || 0} regras recorrentes`,
              `${limits.invoices_limit || 0} faturas/mês`
            ]
          };
        });

        setPlans(transformedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar planos",
          description: "Não foi possível carregar os planos disponíveis"
        });
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;

    setCreatingPayment(planId);
    try {
      // Find the plan and calculate price
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // Create payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount_cents: Math.round(plan.price * 100),
          provider: 'manual',
          status: 'pending',
          reference: `Plan-${planId}-${Date.now()}`,
          metadata: {
            plan_code: planId,
            plan_name: plan.name
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pagamento criado",
        description: "Seu pagamento foi criado e está aguardando aprovação do admin."
      });

    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        variant: "destructive", 
        title: "Erro ao criar pagamento",
        description: "Não foi possível criar o pagamento. Tente novamente."
      });
    } finally {
      setCreatingPayment(null);
    }
  };

  const currentPlan = plans.find(p => p.id === subscription?.plan_id);

  if (loading || loadingPlans) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <Button 
              onClick={() => currentPlan && handleSelectPlan(currentPlan.id)}
              disabled={creatingPayment !== null}
            >
              {creatingPayment ? 'Criando...' : 'Renovar Assinatura'}
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
              disabled={creatingPayment !== null}
              onSelect={() => handleSelectPlan(plan.id)}
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