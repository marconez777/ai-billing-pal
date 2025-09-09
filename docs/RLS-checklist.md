# RLS Security Checklist

## Testes Obrigatórios de Segurança

### 1. Testes Cross-User
- [ ] SELECT: Usuário A não pode ver dados do usuário B
- [ ] INSERT: Usuário A não pode inserir dados para usuário B
- [ ] UPDATE: Usuário A não pode alterar dados do usuário B  
- [ ] DELETE: Usuário A não pode excluir dados do usuário B

### 2. Testes Cross-Entity
- [ ] Verificar isolamento entre entidades diferentes do mesmo usuário
- [ ] Testar políticas que consideram `entity_id` além de `user_id`
- [ ] Validar regras de acesso para entidades compartilhadas

### 3. Default Denial
- [ ] Tabelas sem RLS devem ser explicitamente públicas
- [ ] Novas tabelas têm RLS habilitado por padrão
- [ ] Políticas padrão negam acesso até configuração explícita

### 4. Políticas Padrão para Novas Tabelas
```sql
-- Template para novas tabelas
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON nome_tabela 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON nome_tabela 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON nome_tabela 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own" ON nome_tabela 
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Casos de Teste Críticos
- [ ] Usuário sem autenticação (null auth.uid())
- [ ] Usuário com JWT expirado
- [ ] Tentativas de SQL injection via políticas
- [ ] Performance com grande volume de dados por usuário