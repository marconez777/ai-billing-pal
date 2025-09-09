import { useState } from 'react';
import { AdminTable } from './AdminTable';
import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/lib/types';
import { SubscriptionBadge } from '@/components/billing/SubscriptionBadge';

// Mock data for development
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    user_id: '1',
    plan_id: 'basic',
    status: 'active',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    trial_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    user_id: '2',
    plan_id: 'professional',
    status: 'expired',
    valid_until: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-02T14:30:00Z'
  }
];

export const SubscriptionsTab = () => {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  const columns = [
    {
      key: 'user_id',
      label: 'Usuário ID'
    },
    {
      key: 'plan_id',
      label: 'Plano',
      render: (value: string) => (
        <Badge variant="outline">
          {value === 'basic' ? 'Básico' : value === 'professional' ? 'Profissional' : 'Empresarial'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: Subscription) => (
        <SubscriptionBadge subscription={row} />
      )
    },
    {
      key: 'valid_until',
      label: 'Válida até',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'created_at',
      label: 'Criada em',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Assinaturas</h3>
        <div className="text-sm text-muted-foreground">
          Total: {subscriptions.length} assinaturas
        </div>
      </div>

      <AdminTable
        data={subscriptions}
        columns={columns}
        searchPlaceholder="Buscar por usuário ou plano..."
      />
    </div>
  );
};