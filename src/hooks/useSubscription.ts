import { useState, useEffect } from 'react';
import { Subscription } from '@/lib/types';
import { isSubscriptionActive, isInTrial, getDaysUntilExpiration } from '@/lib/subscription';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = (userId?: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['active', 'trial', 'past_due'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching subscription:', error);
        }

        // Transform to match expected interface
        if (data) {
          const mappedSubscription: Subscription = {
            id: data.id,
            user_id: data.user_id,
            plan_id: data.plan_code, // Map plan_code to plan_id for compatibility
            status: data.status as 'active' | 'canceled' | 'expired',
            valid_until: data.valid_until,
            trial_until: data.trial_until,
            created_at: data.created_at
          };
          setSubscription(mappedSubscription);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const hasActiveSubscription = () => {
    if (!subscription) return false;
    return subscription.status === 'active' && 
           subscription.valid_until && 
           new Date(subscription.valid_until) >= new Date();
  };

  return {
    subscription,
    loading,
    isActive: isSubscriptionActive(subscription),
    isInTrial: isInTrial(subscription),
    daysUntilExpiration: getDaysUntilExpiration(subscription),
    hasActiveSubscription
  };
};