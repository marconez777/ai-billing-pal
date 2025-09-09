import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/pnl';

const DashboardPage = () => {
  // Mock data for the dashboard
  const mockData = {
    companyPnL: {
      income: 25000,
      expenses: 18000,
      net: 7000
    },
    personalPnL: {
      income: 8000,
      expenses: 6500,
      net: 1500
    },
    cashFlow: {
      total: 45000,
      accounts: [
        { name: 'Conta Corrente PJ', balance: 25000 },
        { name: 'Conta Poupança', balance: 15000 },
        { name: 'Cartão Nubank', balance: -5000 },
        { name: 'PayPal', balance: 10000 }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus resultados financeiros
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company P&L */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L da Empresa</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(mockData.companyPnL.net)}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receitas:</span>
                  <span className="text-green-600">
                    {formatCurrency(mockData.companyPnL.income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Despesas:</span>
                  <span className="text-red-600">
                    {formatCurrency(mockData.companyPnL.expenses)}
                  </span>
                </div>
              </div>
              <Badge variant={mockData.companyPnL.net > 0 ? 'default' : 'destructive'}>
                {mockData.companyPnL.net > 0 ? 'Lucro' : 'Prejuízo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Personal P&L */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Pessoal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(mockData.personalPnL.net)}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receitas:</span>
                  <span className="text-green-600">
                    {formatCurrency(mockData.personalPnL.income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Despesas:</span>
                  <span className="text-red-600">
                    {formatCurrency(mockData.personalPnL.expenses)}
                  </span>
                </div>
              </div>
              <Badge variant={mockData.personalPnL.net > 0 ? 'default' : 'destructive'}>
                {mockData.personalPnL.net > 0 ? 'Superávit' : 'Déficit'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa Consolidado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {formatCurrency(mockData.cashFlow.total)}
              </div>
              <div className="text-xs space-y-1">
                {mockData.cashFlow.accounts.map((account, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground truncate mr-2">
                      {account.name}:
                    </span>
                    <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(Math.abs(account.balance))}
                    </span>
                  </div>
                ))}
              </div>
              <Badge variant="outline">
                {mockData.cashFlow.accounts.length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas movimentações e importações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <TrendingDown className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Importe seus extratos para começar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;