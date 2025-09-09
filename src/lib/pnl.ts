import { Transaction } from './types';

export const formatPnLContribution = (
  transaction: Transaction, 
  scope: 'company' | 'personal'
): number => {
  const scopeFlag = scope === 'company' 
    ? transaction.counts_in_company_result 
    : transaction.counts_in_personal_result;

  // Transfers generally don't contribute to P&L, except for personal scope in specific cases
  if (transaction.kind === 'transfer') {
    return (scope === 'personal' && transaction.counts_in_personal_result) 
      ? transaction.amount 
      : 0;
  }

  // For other transaction types, check the appropriate scope flag
  return scopeFlag ? transaction.amount : 0;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const calculatePnLTotals = (
  transactions: Transaction[], 
  scope: 'company' | 'personal'
) => {
  let income = 0;
  let expenses = 0;

  transactions.forEach(t => {
    const contribution = formatPnLContribution(t, scope);
    
    if (contribution > 0) {
      income += contribution;
    } else if (contribution < 0) {
      expenses += Math.abs(contribution);
    }
  });

  return {
    income,
    expenses,
    net: income - expenses
  };
};