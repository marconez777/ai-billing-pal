# Performance Notes & Strategies

## 5 Práticas Obrigatórias para Performance

### 1. Virtualização de Listas
- **Implementação**: `DataGridVirtualized.tsx` com react-window
- **Quando usar**: Listas > 100 itens
- **Impacto**: Renderiza apenas itens visíveis, economiza memória
- **Métricas**: Teste com 10k+ transações deve manter 60fps

### 2. Evitar Re-render Global
```typescript
// ❌ Evitar - causa re-render de toda a árvore
const [globalState, setGlobalState] = useState();

// ✅ Melhor - estado local e memoização
const MemoizedTransactionRow = memo(({ transaction }) => {
  return <TransactionRow transaction={transaction} />;
});
```

### 3. Memoização de Filtros Complexos
```typescript
// Filtros custosos devem ser memoizados
const filteredTransactions = useMemo(() => {
  return transactions.filter(t => 
    applyComplexBusinessLogic(t, filters)
  );
}, [transactions, filters]);
```

### 4. Paginação Server-Side (Futura)
- **Implementação planejada**: Para conjuntos > 1k registros
- **Estratégia**: Cursor-based pagination com `created_at`
- **Cache**: React Query para resultados de páginas
- **Prefetch**: Próxima página em background

### 5. Materialized Views para Dashboards
```sql
-- Para volumes > 100k lançamentos
CREATE MATERIALIZED VIEW monthly_pnl AS
SELECT 
  user_id,
  date_trunc('month', date) as month,
  sum(amount) FILTER (WHERE counts_in_company_result = true AND amount > 0) as company_income,
  sum(abs(amount)) FILTER (WHERE counts_in_company_result = true AND amount < 0) as company_expenses
FROM transactions 
GROUP BY user_id, date_trunc('month', date);

-- Refresh estratégico
REFRESH MATERIALIZED VIEW monthly_pnl; -- Diário às 03:00
```

## Estratégia de Refresh Híbrida

### On-Demand (Tempo Real)
- Após import/triagem de staging → refresh views do usuário
- Após edição/criação de transação → refresh views afetadas
- Scope: Apenas views do usuário específico

### Cron Diário (03:00 AM)
- Refresh completo de todas as materialized views
- Limpeza de dados temporários (staging > 30 dias)
- Agregações históricas para dashboards admin

### Métricas de Performance Alvo
- **Dashboard load**: < 500ms (com matviews)
- **Staging triagem**: < 100ms por transação
- **Bulk operations**: 1000 transações < 2s
- **Reports export**: 10k registros < 5s

## Monitoring & Alertas
- Query duration > 1s → log para otimização
- Memory usage > 80% → alerta de virtualização
- DB connections > 50 → investigar N+1 queries