// Auth & Profile types
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Billing types
export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  valid_until: string;
  trial_until?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  provider: 'manual' | 'stripe';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Finance types
export interface Entity {
  id: string;
  user_id: string;
  name: string;
  type: 'person' | 'company' | 'couple';
}

export interface Account {
  id: string;
  user_id: string;
  entity_id: string;
  name: string;
  type: 'bank' | 'card' | 'wallet';
  close_day?: number;
  due_day?: number;
}

export interface StagingTransaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  date: string;
  suggested_category?: string;
  confidence?: number;
  lock_owner?: string;
  locked_at?: string;
  version?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  entity_id: string;
  description: string;
  amount: number;
  date: string;
  kind: 'income' | 'expense' | 'transfer' | 'adjustment';
  economic_nature?: 'operational' | 'salary' | 'owner_draw' | 'internal_move' | 'refund' | 'investment' | 'fee' | 'interest' | 'fine' | 'iof' | 'discount';
  transfer_group_id?: string;
  counts_in_company_result: boolean;
  counts_in_personal_result: boolean;
  parent_id?: string;
  installment_number?: number;
  installment_total?: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  account_id: string;
  close_date: string;
  due_date: string;
  amount: number;
  paid_amount?: number;
  payer_account_id?: string;
  status: 'open' | 'paid' | 'overdue';
}

export interface LocalRule {
  id: string;
  user_id: string;
  name: string;
  match_type: 'contains' | 'equals' | 'starts_with' | 'regex';
  pattern: string;
  scope: 'global' | 'account' | 'entity';
  scope_id?: string;
  priority: number;
  suggested_category: string;
  active: boolean;
}