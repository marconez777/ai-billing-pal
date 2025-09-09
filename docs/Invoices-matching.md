# Invoice Payment Matching - Heurística de Conciliação

## Objetivo
Identificar automaticamente qual conta foi usada para pagar uma fatura de cartão, preenchendo o campo `payer_account_id`.

## Algoritmo de Matching (3 Passos)

### 1. Busca por Janela Temporal + Valor
```sql
-- Buscar saídas no período de vencimento ±3 dias
SELECT t.* FROM transactions t
WHERE t.user_id = :user_id 
  AND t.account_id != :invoice_account_id  -- Não pode ser o próprio cartão
  AND t.amount < 0  -- Saída de dinheiro
  AND t.date BETWEEN (:due_date - INTERVAL '3 days') AND (:due_date + INTERVAL '3 days')
  AND abs(t.amount) BETWEEN (:invoice_amount - 1.00) AND (:invoice_amount + 1.00)  -- Tolerância ±R$1
ORDER BY abs(abs(t.amount) - :invoice_amount) ASC  -- Menor diferença primeiro
```

### 2. Priorização por Histórico
Se múltiplas transações encontradas, priorizar por:
1. **Conta mais usada**: Conta que mais pagou faturas deste cartão específico
2. **Exatidão do valor**: Diferença menor entre valor da transação e valor da fatura  
3. **Proximidade da data**: Mais próximo da data de vencimento

```sql  
-- Ranking de contas por uso histórico para este cartão
WITH account_usage AS (
  SELECT 
    i.payer_account_id,
    count(*) as usage_count
  FROM invoices i 
  WHERE i.user_id = :user_id 
    AND i.account_id = :invoice_account_id 
    AND i.payer_account_id IS NOT NULL
  GROUP BY i.payer_account_id
)
SELECT t.*, au.usage_count
FROM candidate_transactions t
LEFT JOIN account_usage au ON au.payer_account_id = t.account_id
ORDER BY au.usage_count DESC NULLS LAST, 
         abs(abs(t.amount) - :invoice_amount) ASC,
         abs(extract(epoch from (t.date - :due_date))) ASC
```

### 3. Cenários de Resolução

#### Cenário A: Match Único com Alta Confiança
- 1 transação encontrada com diferença ≤ R$0,50
- **Ação**: Auto-assign `payer_account_id`
- **Log**: "Auto-matched: perfect amount match"

#### Cenário B: Múltiplos Matches, Conta Preferencial Clara  
- 2+ transações encontradas, mas uma é da conta mais usada (>50% histórico)
- **Ação**: Auto-assign para conta preferencial
- **Log**: "Auto-matched: preferred account with X% usage history"

#### Cenário C: Ambiguidade - Intervenção Manual
- Múltiplos matches sem preferência clara
- **Ação**: Deixar `payer_account_id = NULL`, flaggar para revisão manual
- **UI**: Mostrar select com candidatos ordenados por score
- **Log**: "Manual review required: N candidates found"

#### Cenário D: Nenhum Match
- Nenhuma transação na janela temporal+valor
- **Ação**: Deixar `payer_account_id = NULL`
- **Log**: "No matching payment found"

## Implementação Técnica

### Trigger Automático
```sql
CREATE OR REPLACE FUNCTION auto_match_invoice_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Executar algoritmo de matching
  -- Atualizar NEW.payer_account_id se match com alta confiança
  -- Caso contrário, deixar NULL para revisão manual
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_auto_match 
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION auto_match_invoice_payment();
```

### Interface de Revisão Manual
- **Localização**: Página `/invoices` → botão "Revisar Pagamentos"
- **Filtro**: Faturas com `payer_account_id IS NULL` AND `status != 'unpaid'`
- **UX**: Select dropdown com candidatos + score de confiança
- **Ação rápida**: "Aceitar sugestão automática" para casos óbvios

## Métricas de Sucesso
- **Taxa de auto-matching**: Meta >70% das faturas
- **Precisão**: <5% de correções manuais necessárias
- **Tempo de processamento**: <200ms por fatura

## Casos Edge Considerados
- Pagamento parcelado da fatra (valor diferente)
- Pagamento antecipado (fora da janela temporal)
- Múltiplas contas com mesmo banco (usar account.name para desambiguar)
- Transferências internas antes do pagamento (excluir do matching)