# Como Corrigir a URL do Supabase

## Problema Identificado

A URL atual usa: `db.ceexmutdzhrkeuheotys.supabase.co:5432`

Este formato pode estar incorreto ou o projeto pode estar pausado.

## Solução: Obter a URL Correta

### Opção 1: Connection String com Pooler (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/ceexmutdzhrkeuheotys/settings/database
2. Role até **"Connection string"**
3. Selecione **"URI"** mode
4. Escolha **"Connection Pooling"** (Session mode)
5. Copie a string que deve parecer com:
   ```
   postgresql://postgres.ceexmutdzhrkeuheotys:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

### Opção 2: Direct Connection (Alternativa)

Se o pooler não funcionar, tente:
```
postgresql://postgres.ceexmutdzhrkeuheotys:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Diferenças Importantes:

- **Pooler**: Porta **6543** (mais confiável, recomendado)
- **Direct**: Porta **5432** (pode ter limitações)

### Verificar se o Projeto Está Ativo:

1. Vá para: https://supabase.com/dashboard
2. Verifique se o projeto aparece na lista
3. Se estiver com status "Paused", clique em "Restore"

### Atualizar o .env:

Substitua a linha DATABASE_URL pela nova string copiada do dashboard.

### Testar:

```bash
node test-connection.js
```
