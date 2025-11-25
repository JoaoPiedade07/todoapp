# 📋 TodoApp - Sistema de Gestão de Tarefas com Kanban

Uma aplicação web moderna de gestão de tarefas com interface Kanban, sistema de predição de tempo baseado em IA, e gestão de utilizadores com diferentes níveis de permissão.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)

## 🎯 Descrição

TodoApp é uma aplicação full-stack desenvolvida para gestão de projetos e tarefas, com foco em equipas de desenvolvimento. A aplicação oferece uma interface Kanban intuitiva, sistema de autenticação, gestão de utilizadores (gestores e programadores), e um algoritmo inteligente de predição de tempo baseado em dados históricos.

## ✨ Funcionalidades Principais

### 🔐 Autenticação e Gestão de Utilizadores
- Sistema de registo e login seguro com JWT
- Dois tipos de utilizadores: **Gestores** e **Programadores**
- Gestão completa de utilizadores (CRUD) para gestores
- Perfis de utilizador com departamento e nível de experiência
- Hierarquia de gestão (gestores podem atribuir programadores)

### 📊 Kanban Board
- Interface visual com três colunas: **A Fazer**, **Em Progresso**, **Concluído**
- Drag & Drop para mover tarefas entre colunas
- Visualização detalhada de cada tarefa
- Estatísticas em tempo real (total, por status)
- Ordenação automática de tarefas

### 📝 Gestão de Tarefas
- Criação de tarefas com múltiplos campos:
  - Título e descrição
  - Story Points (1, 2, 3, 5, 8, 13)
  - Tipo de tarefa (Desenvolvimento, Design, Testes, etc.)
  - Atribuição a programadores
  - Prioridade/Ordem
- Edição e eliminação de tarefas (apenas gestores)
- Histórico de datas (criação, atribuição, conclusão)

### 🤖 Algoritmo de Predição de Tempo
- **Predição inteligente** baseada em dados históricos
- Cálculo automático de horas estimadas ao criar tarefas
- Fatores considerados:
  - Story Points da tarefa
  - Histórico do programador atribuído
  - Tipo de tarefa
  - Complexidade baseada em SP
- Visualização de:
  - Horas estimadas
  - Intervalo de confiança (min-max)
  - Nível de confiança (0-100%)
  - Razão horas/Story Point
- Predição em tempo real ao criar tarefas

### 🎨 Interface e UX
- Design moderno com Tailwind CSS
- Interface responsiva
- Modais para criação e visualização de tarefas
- Feedback visual em tempo real
- Indicadores de status coloridos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária

### Backend
- **Express.js 5** - Framework Node.js
- **SQLite (better-sqlite3)** - Base de dados
- **JWT (jsonwebtoken)** - Autenticação
- **bcryptjs** - Hash de passwords
- **CORS** - Configuração de CORS

### Ferramentas
- **TypeScript** - Linguagem principal
- **ts-node** - Execução de TypeScript
- **ESLint** - Linting

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clonar o repositório**
```bash
git clone <seu-repositorio>
cd todoapp
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente**
Crie um ficheiro `.env` na raiz do projeto:
```env
PORT=3001
JWT_SECRET=sua_chave_secreta_aqui
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Inicializar a base de dados**
A base de dados SQLite será criada automaticamente na primeira execução.

5. **Iniciar o servidor backend**
```bash
npm run server
```

6. **Iniciar o frontend** (em outro terminal)
```bash
npm run dev
```

7. **Aceder à aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🚀 Como Usar

### Primeiro Acesso

1. **Registar um utilizador gestor**
   - Aceda a `/register`
   - Preencha os dados e selecione tipo "Gestor"
   - Faça login em `/login`

2. **Criar programadores**
   - Como gestor, aceda a `/users`
   - Crie utilizadores do tipo "Programador"
   - Atribua-os ao gestor se necessário

3. **Criar tarefas**
   - Aceda ao Kanban (`/kanban`)
   - Clique em "Criar Tarefa"
   - Preencha os dados e observe a predição em tempo real
   - Atribua a um programador

4. **Gerir tarefas**
   - Arraste tarefas entre colunas no Kanban
   - Clique numa tarefa para ver detalhes
   - Edite ou elimine tarefas (apenas gestores)

## 📁 Estrutura do Projeto

```
todoapp/
├── src/
│   ├── app/                 # Páginas Next.js
│   │   ├── kanban/         # Página Kanban
│   │   ├── login/          # Página de login
│   │   ├── register/       # Página de registo
│   │   ├── users/          # Gestão de utilizadores
│   │   └── task-types/     # Gestão de tipos de tarefa
│   ├── components/         # Componentes React
│   │   ├── kanban/        # Componentes do Kanban
│   │   ├── forms/         # Formulários
│   │   ├── layout/        # Layout (Header, Sidebar)
│   │   └── ui/            # Componentes UI base
│   ├── lib/               # Lógica do backend
│   │   ├── database.ts    # Queries e algoritmo de predição
│   │   ├── auth.ts       # Autenticação
│   │   ├── middleware.ts # Middleware Express
│   │   ├── taskRoute.ts  # Rotas de tarefas
│   │   └── userRoute.ts  # Rotas de utilizadores
│   ├── types/            # Definições TypeScript
│   └── constants/        # Constantes e enums
├── scripts/              # Scripts utilitários
│   └── testPrediction.ts # Teste do algoritmo
├── start.ts              # Servidor Express
├── database.sqlite3      # Base de dados SQLite
└── package.json
```

## 🔬 Algoritmo de Predição

O algoritmo de predição utiliza:
- **Dados históricos** de tarefas concluídas
- **Média de horas por Story Point** por programador
- **Fator de complexidade** baseado em SP:
  - 1-2 SP: 0.8x (mais rápido)
  - 3-5 SP: 1.0x (normal)
  - 6-8 SP: 1.3x (mais complexo)
  - 9+ SP: 1.6x (muito complexo)
- **Nível de confiança** baseado em:
  - Tamanho da amostra histórica
  - Desvio padrão dos tempos
  - Coeficiente de variação

### Testar o Algoritmo

Execute o script de teste:
```bash
npx ts-node --project tsconfig.server.json scripts/testPrediction.ts
```

## 🗺️ Roadmap - Funcionalidades Pendentes

### Pessoa A - "Relatórios & Exportação"

- [ ] **Lista de tarefas concluídas do gestor**
  - Visualização de todas as tarefas concluídas
  - Filtros por data, programador, tipo
  - Ordenação por data de conclusão

- [ ] **Lista de tarefas em curso ordenadas**
  - Lista de tarefas "Em Progresso"
  - Ordenação por prioridade/ordem
  - Visualização por programador

- [ ] **Exportação para CSV**
  - Exportar tarefas para ficheiro CSV
  - Incluir todos os campos relevantes
  - Filtros de exportação

- [ ] **Cálculos de tempo e atrasos**
  - Comparação entre tempo estimado vs real
  - Identificação de atrasos
  - Estatísticas de precisão das predições

- [ ] **Funcionalidades de análise estatística**
  - Dashboard com métricas
  - Gráficos de produtividade
  - Análise de velocidade da equipa
  - Relatórios de performance

### Pessoa B - "Polimento & Validações Finais"

- [ ] **Validações de integridade de dados**
  - Validação de campos obrigatórios
  - Verificação de relações entre tabelas
  - Prevenção de dados inconsistentes

- [ ] **Proteções contra erros**
  - Tratamento de erros robusto
  - Mensagens de erro amigáveis
  - Validação de inputs no frontend e backend
  - Prevenção de SQL injection

- [ ] **Responsividade e UX final**
  - Testes em diferentes dispositivos
  - Melhorias de acessibilidade
  - Animações e transições suaves
  - Feedback visual aprimorado

- [ ] **Testes de usabilidade**
  - Testes com utilizadores reais
  - Identificação de pontos de fricção
  - Melhorias baseadas em feedback

- [ ] **Documentação do código**
  - Comentários JSDoc
  - Documentação de funções complexas
  - Guia de contribuição
  - Documentação da API

## 🔒 Segurança

- Autenticação JWT
- Passwords hasheadas com bcrypt
- Validação de permissões por rota
- Proteção CORS configurada
- Sanitização de inputs

## 📝 API Endpoints

### Autenticação
- `POST /auth/register` - Registar utilizador
- `POST /auth/login` - Login

### Utilizadores
- `GET /users` - Listar utilizadores (autenticado)
- `GET /users/programmers` - Listar programadores
- `GET /users/managers` - Listar gestores
- `GET /users/:id` - Obter utilizador
- `PUT /users/:id` - Atualizar utilizador
- `DELETE /users/:id` - Eliminar utilizador

### Tarefas
- `GET /tasks` - Listar tarefas (autenticado)
- `GET /tasks/:id` - Obter tarefa
- `POST /tasks` - Criar tarefa (apenas gestores)
- `PATCH /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Eliminar tarefa (apenas gestores)
- `GET /tasks/predict` - Obter predição de tempo

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para fins académicos.

## 👨‍💻 Autor

João Piedade & Marcelo Ramos

Desenvolvido como parte do projeto de Laboratório de Dados II.

---

**Nota:** Este projeto está em desenvolvimento ativo. Algumas funcionalidades podem estar incompletas ou sujeitas a alterações.
