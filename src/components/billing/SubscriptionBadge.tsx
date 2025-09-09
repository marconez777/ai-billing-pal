import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/lib/types';
import { isSubscriptionActive, isInTrial, getDaysUntilExpiration } from '@/lib/subscription';

interface SubscriptionBadgeProps {
  subscription: Subscription | null;
}

export const SubscriptionBadge = ({ subscription }: SubscriptionBadgeProps) => {
  if (!subscription) {
    return <Badge variant="destructive">Sem Assinatura</Badge>;
  }

  const active = isSubscriptionActive(subscription);
  const trial = isInTrial(subscription);
  const daysUntilExpiration = getDaysUntilExpiration(subscription);

  if (trial) {
    return (
      <Badge variant="secondary">
        Trial - {daysUntilExpiration} dias restantes
      </Badge>
    );
  }

  if (!active) {
    return <Badge variant="destructive">Expirada</Badge>;
  }

  if (daysUntilExpiration <= 7) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  }

  return <Badge variant="default">Ativa</Badge>;
};