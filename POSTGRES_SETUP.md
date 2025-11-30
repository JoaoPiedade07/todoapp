# Configuração Rápida do PostgreSQL

## Opção 1: Supabase (Recomendado - Gratuito)

1. Acesse https://supabase.com
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - Project Name: todoapp (ou qualquer nome)
   - Database Password: (escolha uma senha forte)
   - Region: escolha a mais próxima
5. Aguarde o projeto ser criado (~2 minutos)
6. Vá em Settings > Database
7. Role para baixo até "Connection string"
8. Selecione "URI" mode
9. Copie a string (parece com: postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx-x.pooler.supabase.com:6543/postgres)
10. Cole no arquivo .env substituindo DATABASE_URL

## Opção 2: Neon (Gratuito)

1. Acesse https://neon.tech
2. Crie uma conta gratuita
3. Clique em "Create Project"
4. Escolha um nome e região
5. Após criar, copie a "Connection string"
6. Cole no arquivo .env

## Opção 3: Instalar PostgreSQL Localmente (macOS)

```bash
# Usando Homebrew
brew install postgresql@15
brew services start postgresql@15

# Criar banco de dados
createdb todoapp

# Atualizar .env com:
# DATABASE_URL=postgresql://$(whoami)@localhost:5432/todoapp
```

## Depois de configurar:

1. Edite o arquivo `.env` com a string de conexão
2. Execute: `npm run server`
