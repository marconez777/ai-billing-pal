import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/pnl';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    companyPnL: { income: 0, expenses: 0, net: 0 },
    personalPnL: { income: 0, expenses: 0, net: 0 },
    cashFlow: { total: 0, accounts: [] as any[] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
        
        const [companyRes, personalRes, cashRes] = await Promise.all([
          supabase
            .from('v_pl_company_monthly')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .single(),
          supabase
            .from('v_pl_personal_monthly')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .single(),
          supabase
            .from('v_daily_cash_by_account')
            .select('*, accounts(name)')
            .eq('user_id', user.id)
            .order('day', { ascending: false })
            .limit(10) // Get recent cash positions
        ]);

        const companyPnL = companyRes.data || { income: 0, expenses: 0, net_result: 0 };
        const personalPnL = personalRes.data || { income: 0, expenses: 0, net_result: 0 };
        const cashData = cashRes.data || [];
        
        // Aggregate latest cash by account
        const accountBalances = new Map();
        cashData.forEach((item: any) => {
          if (!accountBalances.has(item.account_id)) {
            accountBalances.set(item.account_id, {
              name: item.accounts?.name || 'Unknown Account',
              balance: item.day_balance || 0
            });
          }
        });

        const accounts = Array.from(accountBalances.values());
        const totalCash = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);

        setDashboardData({
          companyPnL: {
            income: companyPnL.income || 0,
            expenses: companyPnL.expenses || 0,
            net: companyPnL.net_result || 0
          },
          personalPnL: {
            income: personalPnL.income || 0,
            expenses: personalPnL.expenses || 0,
            net: personalPnL.net_result || 0
          },
          cashFlow: {
            total: totalCash,
            accounts: accounts
          }
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Keep empty state on error
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData.companyPnL.net)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receitas:</span>
                      <span className="text-green-600">
                        {formatCurrency(dashboardData.companyPnL.income)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Despesas:</span>
                      <span className="text-red-600">
                        {formatCurrency(dashboardData.companyPnL.expenses)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={dashboardData.companyPnL.net > 0 ? 'default' : 'destructive'}>
                    {dashboardData.companyPnL.net > 0 ? 'Lucro' : 'Prejuízo'}
                  </Badge>
                </>
              )}
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
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData.personalPnL.net)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receitas:</span>
                      <span className="text-green-600">
                        {formatCurrency(dashboardData.personalPnL.income)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Despesas:</span>
                      <span className="text-red-600">
                        {formatCurrency(dashboardData.personalPnL.expenses)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={dashboardData.personalPnL.net > 0 ? 'default' : 'destructive'}>
                    {dashboardData.personalPnL.net > 0 ? 'Superávit' : 'Déficit'}
                  </Badge>
                </>
              )}
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
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboardData.cashFlow.total)}
                  </div>
                  <div className="text-xs space-y-1">
                    {dashboardData.cashFlow.accounts.length > 0 ? (
                      dashboardData.cashFlow.accounts.slice(0, 5).map((account: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground truncate mr-2">
                            {account.name}:
                          </span>
                          <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(account.balance))}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-center">
                        Nenhuma conta encontrada
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">
                    {dashboardData.cashFlow.accounts.length} contas
                  </Badge>
                </>
              )}
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