import { useAuth } from '@/hooks/useAuth';
import { useSubscription, hasActiveSubscription } from '@/hooks/useSubscription';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription(user?.id);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && subscription && !hasActiveSubscription(subscription)) {
      toast({
        variant: "destructive",
        title: "Assinatura inativa",
        description: "Você precisa de uma assinatura ativa para acessar esta funcionalidade"
      });
    }
  }, [subscription, loading, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasActiveSubscription(subscription)) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
};