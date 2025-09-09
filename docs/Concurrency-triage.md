# Concurrency Control - Triagem de Staging

## Problema
Múltiplos usuários ou sessões editando as mesmas transações de staging simultaneamente podem causar:
- Conflitos de categorização
- Perda de alterações
- Inconsistências na triagem

## Duas Estratégias Implementadas

### 1. Lock Otimista (Version-Based)
**Quando usar**: Operações rápidas, baixa probabilidade de conflito

#### Implementação
```sql
-- Adicionar campos à tabela staging_transactions
ALTER TABLE staging_transactions ADD COLUMN version INTEGER DEFAULT 1;

-- Update com verificação de versão
UPDATE staging_transactions 
SET 
  suggested_category = :new_category,
  version = version + 1
WHERE id = :transaction_id 
  AND user_id = :user_id 
  AND version = :expected_version;
```

#### Fluxo de Conflito
1. **Read**: Frontend carrega transação com `version = 5`
2. **Edit**: Usuário edita categoria localmente  
3. **Save**: Frontend envia UPDATE com `expected_version = 5`
4. **Conflict**: Se outra sessão já atualizou (`version = 6`), UPDATE retorna 0 rows
5. **Resolution**: Frontend mostra modal "Dados alterados por outro usuário. Recarregar?"

### 2. Lock Explícito (Session-Based)
**Quando usar**: Operações longas, edição complexa de lotes

#### Implementação
```sql
-- Campos de lock na tabela staging_transactions
ALTER TABLE staging_transactions ADD COLUMN lock_owner TEXT;
ALTER TABLE staging_transactions ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE;

-- Função para adquirir lock
CREATE OR REPLACE FUNCTION acquire_staging_lock(
  p_user_id UUID,
  p_transaction_ids UUID[],
  p_owner_email TEXT
) RETURNS TABLE(locked_id UUID, success BOOLEAN) AS $$
BEGIN
  -- Tentar lock apenas em transações não lockeadas
  UPDATE staging_transactions 
  SET 
    lock_owner = p_owner_email,
    locked_at = now()
  WHERE id = ANY(p_transaction_ids)
    AND user_id = p_user_id
    AND (lock_owner IS NULL OR locked_at < now() - INTERVAL '30 minutes');  -- Timeout automático
    
  RETURN QUERY
  SELECT id, (lock_owner = p_owner_email) as success 
  FROM staging_transactions 
  WHERE id = ANY(p_transaction_ids);
END;
$$ LANGUAGE plpgsql;
```

#### UX de Lock Explícito
```typescript
// Component: StagingToolbarStub.tsx
const handleBulkEdit = async () => {
  const { lockedIds, conflicts } = await acquireLock(selectedIds, userEmail);
  
  if (conflicts.length > 0) {
    showConflictDialog({
      message: `${conflicts.length} transações estão sendo editadas por outros usuários`,
      conflicts: conflicts.map(id => ({ 
        id, 
        lockedBy: transactions.find(t => t.id === id)?.lock_owner 
      }))
    });
  }
  
  // Continuar apenas com transações lockeadas com sucesso
  setEditableTransactions(lockedIds);
};
```

## Timeout e Limpeza Automática

### Session Timeout (30 minutos)
```sql
-- Cron job para limpeza de locks expirados
CREATE OR REPLACE FUNCTION cleanup_expired_locks() 
RETURNS void AS $$
BEGIN
  UPDATE staging_transactions 
  SET lock_owner = NULL, locked_at = NULL
  WHERE locked_at < now() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Executar a cada 5 minutos
SELECT cron.schedule('cleanup-locks', '*/5 * * * *', 'SELECT cleanup_expired_locks();');
```

### Browser Tab Close
```typescript
// Frontend: Liberar locks ao fechar aba
window.addEventListener('beforeunload', async () => {
  if (currentLocks.length > 0) {
    await releaseLocks(currentLocks);
  }
});

// Heartbeat para manter lock ativo
setInterval(async () => {
  if (currentLocks.length > 0) {
    await extendLocks(currentLocks);
  }
}, 2 * 60 * 1000); // A cada 2 minutos
```

## UI Indicators

### Visual Feedback
```typescript
// StagingRow component
const StagingRow = ({ transaction }) => {
  const isLocked = transaction.lock_owner && transaction.lock_owner !== userEmail;
  const isLockedByMe = transaction.lock_owner === userEmail;
  
  return (
    <div className={cn(
      "staging-row",
      isLocked && "opacity-50 pointer-events-none",
      isLockedByMe && "border-l-4 border-primary"
    )}>
      {isLocked && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Em edição por <strong>{transaction.lock_owner}</strong> 
            desde {formatDistance(new Date(transaction.locked_at), new Date())}
          </AlertDescription>
        </Alert>
      )}
      {/* Rest of row content */}
    </div>
  );
};
```

## Escolha da Estratégia

### Lock Otimista: Use Para
- ✅ Edição individual de transações
- ✅ Categorização rápida (1-2 segundos)
- ✅ Baixo volume de usuários simultâneos

### Lock Explícito: Use Para  
- ✅ Operações em lote (bulk approve/reject)
- ✅ Edição complexa com validações
- ✅ Sessões de triagem longas (>5 minutos)
- ✅ Múltiplos usuários na mesma importação

## Monitoramento
- **Métrica**: Taxa de conflitos < 5%
- **Alert**: Locks > 30 min sem atividade
- **Dashboard**: Número de locks ativos por usuário
- **Log**: Todos os conflitos para análise de padrões