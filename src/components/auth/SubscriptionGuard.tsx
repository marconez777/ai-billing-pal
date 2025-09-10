import { useAuth } from '@/hooks/useAuth';
import { useSubscription, hasActiveSubscription } from '@/hooks/useSubscription';
import { Navigate } from 'react-router-dom';

export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription(user?.id);

  // Espere auth e subscription carregarem, e o user existir
  if (authLoading || !user || subLoading) {
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