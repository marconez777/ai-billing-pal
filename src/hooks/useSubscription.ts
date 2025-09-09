import { useState, useEffect } from 'react';
import { Subscription } from '@/lib/types';
import { isSubscriptionActive, isInTrial, getDaysUntilExpiration } from '@/lib/subscription';

export const useSubscription = (userId?: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Mock subscription - always active for development
    const mockSubscription: Subscription = {
      id: 'mock-subscription-id',
      user_id: userId,
      plan_id: 'basic',
      status: 'active',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      trial_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
      created_at: new Date().toISOString()
    };

    setSubscription(mockSubscription);
    setLoading(false);
  }, [userId]);

  return {
    subscription,
    loading,
    isActive: isSubscriptionActive(subscription),
    isInTrial: isInTrial(subscription),
    daysUntilExpiration: getDaysUntilExpiration(subscription)
  };
};