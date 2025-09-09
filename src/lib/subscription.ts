import { Subscription } from './types';

// Mock subscription helpers - replace with real DB queries later
export const isSubscriptionActive = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  
  const now = new Date();
  const validUntil = new Date(subscription.valid_until);
  
  return subscription.status === 'active' && validUntil > now;
};

export const isInTrial = (subscription: Subscription | null): boolean => {
  if (!subscription || !subscription.trial_until) return false;
  
  const now = new Date();
  const trialUntil = new Date(subscription.trial_until);
  
  return trialUntil > now;
};

export const getDaysUntilExpiration = (subscription: Subscription | null): number => {
  if (!subscription) return 0;
  
  const now = new Date();
  const validUntil = new Date(subscription.valid_until);
  const diffTime = validUntil.getTime() - now.getTime();
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};