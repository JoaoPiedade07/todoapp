# Como Corrigir a Conexão com Supabase

## Problema: ENOTFOUND - Hostname não encontrado

### Passo 1: Verificar o Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Verifique se o projeto está **ativo** (não pausado)
3. Se estiver pausado, clique em "Restore" para reativar

### Passo 2: Obter a Connection String Correta

1. No dashboard do Supabase, vá em **Settings > Database**
2. Role até **Connection string**
3. Selecione **URI** mode
4. **IMPORTANTE**: Use a connection string com **Connection Pooling** (porta 6543)
   - Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
5. Copie a string completa

### Passo 3: Atualizar o .env

1. Abra o arquivo `.env`
2. Substitua a linha `DATABASE_URL` pela nova string
3. **Certifique-se** de que a senha está correta (sem espaços extras)

### Passo 4: Verificar a Senha

- A senha na URL deve estar **codificada** se tiver caracteres especiais
- `@` vira `%40`
- Espaços viram `%20`
- etc.

### Exemplo de Connection String Correta:

```
DATABASE_URL=postgresql://postgres.ceexmutdzhrkeuheotys:[SENHA]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Nota**: Use a porta **6543** (pooler) em vez de **5432** (direct) para melhor confiabilidade.

### Passo 5: Testar

```bash
npm run server
```

Se ainda não funcionar:
1. Verifique se o projeto está ativo no dashboard
2. Tente criar um novo projeto no Supabase
3. Ou use uma alternativa como Neon.tech
