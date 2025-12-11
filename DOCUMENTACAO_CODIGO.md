# 📚 Documentação Técnica do Código - TodoApp

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Base de Dados](#base-de-dados)
5. [Backend API](#backend-api)
6. [Frontend](#frontend)
7. [Algoritmo de Predição](#algoritmo-de-predição)
8. [Tipos TypeScript](#tipos-typescript)
9. [Fluxos Principais](#fluxos-principais)
10. [Configuração e Deploy](#configuração-e-deploy)

---

## Visão Geral

TodoApp é uma aplicação **full-stack** que utiliza:
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Backend**: Express.js 5 + TypeScript
- **Base de Dados**: PostgreSQL (Supabase) / SQLite (desenvolvimento)
- **Autenticação**: JWT (JSON Web Tokens)
- **Estilização**: Tailwind CSS

### Padrões Utilizados

- **REST API** para comunicação frontend-backend
- **Middleware pattern** para autenticação e validação
- **Repository pattern** para acesso à base de dados
- **Component-based architecture** no frontend
- **Server-side rendering (SSR)** e **Client-side rendering (CSR)** com Next.js

---

## Arquitetura

```
┌─────────────────┐
│   Frontend      │  Next.js 16 (React 19)
│   (localhost:3000) │  └─ App Router
│                  │  └─ Server Components
│                  │  └─ Client Components
└────────┬─────────┘
         │ HTTP/REST
         │ JWT Authentication
         ▼
┌─────────────────┐
│   Backend       │  Express.js 5
│   (localhost:3001) │  └─ REST API
│                  │  └─ Middleware
│                  │  └─ Route Handlers
└────────┬─────────┘
         │ SQL Queries
         │ (pg library)
         ▼
┌─────────────────┐
│   PostgreSQL    │  Supabase
│   Database      │  └─ Connection Pool
│                  │  └─ Transactions
└─────────────────┘
```

### Camadas da Aplicação

1. **Presentation Layer** (Frontend)
   - Componentes React
   - Páginas Next.js
   - Formulários e UI

2. **Application Layer** (Backend)
   - Rotas Express
   - Lógica de negócio
   - Validações

3. **Data Layer** (Database)
   - Queries SQL
   - Modelos de dados
   - Transações

---

## Estrutura de Pastas

### 📁 Estrutura Completa

```
todoapp/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Layout raiz
│   │   ├── page.tsx                 # Página inicial
│   │   ├── login/                   # Página de login
│   │   │   └── page.tsx
│   │   ├── register/                # Página de registo
│   │   │   └── page.tsx
│   │   ├── kanban/                  # Kanban Board
│   │   │   └── page.tsx
│   │   ├── users/                   # Gestão de utilizadores
│   │   │   └── page.tsx
│   │   ├── task-types/              # Tipos de tarefa
│   │   │   └── page.tsx
│   │   ├── completed-tasks/         # Tarefas concluídas
│   │   │   └── page.tsx
│   │   ├── reports/                 # Relatórios
│   │   │   └── page.tsx
│   │   ├── error.tsx                # Página de erro
│   │   └── globals.css              # Estilos globais
│   │
│   ├── components/                   # Componentes React
│   │   ├── forms/                   # Formulários
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── kanban/                  # Componentes Kanban
│   │   │   ├── KanbanBoard.tsx      # Container principal
│   │   │   ├── Column.tsx           # Coluna (TODO/DOING/DONE)
│   │   │   ├── TaskCard.tsx         # Card de tarefa
│   │   │   ├── TaskDetails.tsx      # Detalhes da tarefa
│   │   │   ├── CreateTaskModal.tsx  # Modal criar tarefa
│   │   │   ├── EditTaskModal.tsx    # Modal editar tarefa
│   │   │   └── ProgrammerCompletedTasks.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── MainLayout.tsx       # Layout principal
│   │   │   ├── Header.tsx           # Cabeçalho
│   │   │   └── Sidebar.tsx          # Menu lateral
│   │   ├── ui/                      # Componentes UI base
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── popup.tsx
│   │   ├── ErrorBoundary.tsx        # Error boundary
│   │   └── LoadingSpinner.tsx       # Loading component
│   │
│   ├── lib/                          # Backend / Lógica
│   │   ├── database.ts              # ⭐ Queries DB + Algoritmo predição
│   │   ├── auth.ts                  # Lógica de autenticação
│   │   ├── authRoute.ts             # Rotas de autenticação
│   │   ├── middleware.ts            # Middleware Express
│   │   ├── userRoute.ts             # Rotas de utilizadores
│   │   ├── taskRoute.ts             # Rotas de tarefas
│   │   ├── taskTypeRoute.ts         # Rotas tipos de tarefa
│   │   ├── programmerRoutes.ts      # Rotas programadores
│   │   ├── analyticsRoute.ts        # Rotas analytics
│   │   ├── validators.ts            # Validações
│   │   ├── user.ts                  # Modelo User
│   │   ├── userUtils.ts             # Utilitários users
│   │   └── api.ts                   # Configuração API cliente
│   │
│   ├── types/                        # Definições TypeScript
│   │   └── index.ts                 # Interfaces principais
│   │
│   ├── constants/                    # Constantes
│   │   └── enums.ts                 # Enums (UserType, TaskStatus, etc.)
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── scripts/                          # Scripts utilitários
│   ├── migrate-to-postgres.ts       # Migração SQLite → PostgreSQL
│   └── testPrediction.ts            # Teste algoritmo predição
│
├── public/                           # Ficheiros estáticos
│
├── start.ts                          # ⭐ Servidor Express (entry point)
├── database.ts                       # (antigo, não usado)
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # Config TypeScript (Frontend)
├── tsconfig.server.json              # Config TypeScript (Backend)
├── next.config.js                    # Config Next.js
├── tailwind.config.ts                # Config Tailwind
├── railway.json                      # Config Railway deployment
└── Procfile                          # Config Heroku/Railway

```

---

## Base de Dados

### 📊 Schema

#### Tabela: `users`
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  type VARCHAR(50) CHECK(type IN ('gestor', 'programador')) NOT NULL,
  department VARCHAR(255) NOT NULL,
  manager_id VARCHAR(255),
  experience_level VARCHAR(50) DEFAULT 'junior',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Campos importantes:**
- `type`: 'gestor' ou 'programador'
- `manager_id`: Referência a outro user (hierarquia)
- `experience_level`: 'junior', 'intermedio', 'senior'

#### Tabela: `task_types`
```sql
CREATE TABLE task_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `tasks`
```sql
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK(status IN ('todo', 'inprogress', 'done')) NOT NULL DEFAULT 'todo',
  "order" INTEGER NOT NULL DEFAULT 0,
  story_points INTEGER,
  assigned_to VARCHAR(255),
  task_type_id VARCHAR(255),
  assigned_at TIMESTAMP,
  created_by VARCHAR(255) REFERENCES users(id),
  completed_at TIMESTAMP,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  confidence_level DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE SET NULL
);
```

**Índices:**
```sql
CREATE UNIQUE INDEX idx_tasks_assigned_status_order
ON tasks(assigned_to, status, "order");
```

Este índice garante que não há duplicados de `(assigned_to, status, order)` - usado para ordenação única de tarefas.

### 🔍 Queries Principais

**Localização**: `src/lib/database.ts`

#### `userQueries`
```typescript
userQueries = {
  getAll(): Promise<User[]>
  getById(id: string): Promise<User>
  getProgrammers(): Promise<User[]>
  getManagers(): Promise<User[]>
  getByManagerId(managerId: string): Promise<User[]>
  create(user: UserData): Promise<void>
  update(id: string, updates: Partial<User>): Promise<void>
  delete(id: string): Promise<void>
}
```

#### `taskQueries`
```typescript
taskQueries = {
  getAll(): Promise<Task[]>
  getById(id: string): Promise<Task>
  getByStatus(status: TaskStatus): Promise<Task[]>
  create(task: TaskData): Promise<void>
  update(id: string, updates: Partial<Task>): Promise<void>
  updateStatus(id: string, status: TaskStatus, assignedTo?: string): Promise<void>
  updateOrder(tasks: Array<{id, order, status}>): Promise<void>
  delete(id: string): Promise<void>
  getCompletedTasksByProgrammer(programmerId: string): Promise<Task[]>
  getCompletedTasksByManager(managerId: string): Promise<Task[]>
  getInProgressTasksOrdered(managerId?: string): Promise<Task[]>
  getProgrammerStats(programmerId: string): Promise<Stats>
  canAssignToDoing(assignedTo: string): Promise<boolean>
  validateExecutionOrder(taskId: string, newStatus: TaskStatus): Promise<boolean>
}
```

#### `predictionQueries`
```typescript
predictionQueries = {
  calculateTeamVelocity(userId?: string, weeks?: number): Promise<Velocity>
  calculatePointsToHoursRatio(userId?: string): Promise<Ratio>
  predictTaskTime(storyPoints: number, userId?: string, taskTypeId?: string): Promise<Prediction>
  predictMultipleTasks(tasks: Array<{storyPoints, userId?, taskTypeId?}>): Promise<MultiplePredictions>
  updatePredictionModel(taskId: string): Promise<UpdateResult>
  analyzePredictionAccuracy(userId?: string): Promise<Accuracy>
}
```

#### `analyticsQueries`
```typescript
analyticsQueries = {
  getManagerStatistics(managerId: string, days?: number): Promise<Statistics>
  getProductivityByProgrammer(managerId: string, days?: number): Promise<Productivity[]>
  getStatisticsByTaskType(managerId: string, days?: number): Promise<TypeStats[]>
  getTaskTrends(managerId: string, days?: number): Promise<Trends[]>
  getEstimationAccuracy(managerId: string, days?: number): Promise<Accuracy>
}
```

### 🔄 Conexão à Base de Dados

**Ficheiro**: `src/lib/database.ts`

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Para Supabase
});
```

**Helpers:**
- `query(text, params?)`: Retorna todas as linhas
- `queryOne(text, params?)`: Retorna primeira linha
- `execute(text, params?)`: Executa query (INSERT/UPDATE/DELETE)

---

## Backend API

### 🚀 Servidor Express

**Ficheiro**: `start.ts`

**Fluxo de inicialização:**
1. Carrega variáveis de ambiente (`dotenv`)
2. Configura middleware (CORS, JSON parsing, logging)
3. Registra rotas
4. Inicializa base de dados
5. Inicia servidor HTTP

### 🔐 Autenticação

**Ficheiro**: `src/lib/auth.ts`

**Funções:**
- `hashPassword(password: string): Promise<string>`
- `comparePassword(password: string, hash: string): Promise<boolean>`
- `generateToken(user: User): string`
- `verifyToken(token: string): UserPayload`

**JWT Payload:**
```typescript
{
  id: string,
  username: string,
  type: 'gestor' | 'programador'
}
```

### 🛡️ Middleware

**Ficheiro**: `src/lib/middleware.ts`

```typescript
authenticateToken(req, res, next): void
```

**Funcionalidade:**
- Extrai token do header `Authorization: Bearer <token>`
- Verifica e valida token JWT
- Injeta `req.user` com dados do utilizador
- Retorna 401 se inválido

### 📍 Rotas

#### Autenticação (`/auth`)
**Ficheiro**: `src/lib/authRoute.ts`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registar novo utilizador | ❌ |
| POST | `/auth/login` | Login e obter token | ❌ |
| GET | `/auth/managers` | Listar gestores (público) | ❌ |
| GET | `/auth/me` | Obter utilizador atual | ✅ |

#### Utilizadores (`/users`)
**Ficheiro**: `src/lib/userRoute.ts`

| Método | Endpoint | Descrição | Auth | Permissões |
|--------|----------|-----------|------|------------|
| GET | `/users` | Listar todos | ✅ | Todos |
| GET | `/users/managers` | Listar gestores | ❌ | Público |
| GET | `/users/programmers` | Listar programadores | ✅ | Todos |
| GET | `/users/:id` | Obter utilizador | ✅ | Todos |
| PUT | `/users/:id` | Atualizar utilizador | ✅ | Todos |
| PATCH | `/users/:id` | Atualização parcial | ✅ | Todos |
| DELETE | `/users/:id` | Eliminar utilizador | ✅ | Todos |

#### Tarefas (`/tasks`)
**Ficheiro**: `src/lib/taskRoute.ts`

| Método | Endpoint | Descrição | Auth | Permissões |
|--------|----------|-----------|------|------------|
| GET | `/tasks` | Listar todas | ✅ | Todos |
| GET | `/tasks/:id` | Obter tarefa | ✅ | Todos |
| POST | `/tasks` | Criar tarefa | ✅ | **Apenas Gestores** |
| PUT | `/tasks/:id` | Atualizar tarefa | ✅ | Todos |
| PATCH | `/tasks/:id` | Atualizar status/campos | ✅ | Todos |
| DELETE | `/tasks/:id` | Eliminar tarefa | ✅ | **Apenas Gestores** |
| GET | `/tasks/predict` | Predição de tempo | ✅ | Todos |
| GET | `/tasks/completed/:programmerId` | Tarefas concluídas | ✅ | **Apenas Gestores** |
| GET | `/tasks/manager/completed` | Tarefas concluídas gestor | ✅ | **Apenas Gestores** |
| GET | `/tasks/in-progress/ordered` | Tarefas em curso | ✅ | Todos |
| GET | `/tasks/delayed` | Tarefas atrasadas | ✅ | Todos |
| GET | `/tasks/time/average` | Tempo médio | ✅ | Todos |
| GET | `/tasks/export/csv` | Exportar CSV | ✅ | **Apenas Gestores** |

#### Analytics (`/analytics`)
**Ficheiro**: `src/lib/analyticsRoute.ts`

| Método | Endpoint | Descrição | Auth | Permissões |
|--------|----------|-----------|------|------------|
| GET | `/analytics/statistics` | Estatísticas gerais | ✅ | **Apenas Gestores** |
| GET | `/analytics/productivity` | Produtividade por programador | ✅ | **Apenas Gestores** |
| GET | `/analytics/task-types` | Estatísticas por tipo | ✅ | **Apenas Gestores** |
| GET | `/analytics/trends` | Tendências temporais | ✅ | **Apenas Gestores** |
| GET | `/analytics/estimation-accuracy` | Precisão estimativas | ✅ | **Apenas Gestores** |

### ✅ Validações

**Ficheiro**: `src/lib/validators.ts`

**Funções:**
- `validateUserData(data): ValidationResult`
- `validateTaskData(data): ValidationResult`
- `validateStoryPoints(points): ValidationResult`
- `validateOrder(order): ValidationResult`
- `sanitizeString(str): string`

---

## Frontend

### 📱 Páginas Next.js

#### `/login` e `/register`
- Páginas de autenticação
- Formulários com validação
- Redirecionamento após login/registo

#### `/kanban`
**Ficheiro**: `src/app/kanban/page.tsx`

**Funcionalidades:**
- Carrega tarefas da API
- Renderiza KanbanBoard
- Gerencia modais (criar, editar, detalhes)
- Handlers para drag & drop

**Estado:**
```typescript
{
  user: User,
  tasks: Task[],
  selectedTask: Task | null,
  showTaskDetails: boolean,
  showCreateModal: boolean,
  showEditModal: boolean,
  availableUsers: User[]
}
```

#### `/users`
- Lista de utilizadores
- CRUD de utilizadores (apenas gestores)
- Filtros e pesquisa

#### `/reports`
- Dashboard com estatísticas
- Gráficos de produtividade
- Relatórios por programador/tipo

### 🧩 Componentes

#### `KanbanBoard`
**Ficheiro**: `src/components/kanban/KanbanBoard.tsx`

**Props:**
```typescript
{
  tasks: Task[],
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void,
  onViewDetails: (task: Task) => void,
  onEditTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void,
  userType: UserType,
  currentUser: User
}
```

**Funcionalidade:**
- Agrupa tarefas por status (TODO/DOING/DONE)
- Renderiza 3 colunas
- Passa callbacks para interações

#### `TaskCard`
**Ficheiro**: `src/components/kanban/TaskCard.tsx`

**Features:**
- Drag & Drop
- Botões editar/eliminar (apenas gestores)
- Exibe: título, descrição, story points, responsável
- Status colorido

#### `CreateTaskModal` e `EditTaskModal`
**Ficheiros**: `src/components/kanban/CreateTaskModal.tsx`, `EditTaskModal.tsx`

**Funcionalidades:**
- Formulário completo de tarefa
- Validação em tempo real
- Predição automática de tempo
- Upload para API

#### `MainLayout`
**Ficheiro**: `src/components/layout/MainLayout.tsx`

**Estrutura:**
- Header com logout
- Sidebar com navegação
- Conteúdo principal (children)

### 🔄 Estado e Fluxo de Dados

```
User Action (Frontend)
    ↓
API Call (fetch)
    ↓
Express Route Handler
    ↓
Validation + Business Logic
    ↓
Database Query
    ↓
Response JSON
    ↓
State Update (React)
    ↓
UI Re-render
```

---

## Algoritmo de Predição

### 📊 Localização
**Ficheiro**: `src/lib/database.ts` → `predictionQueries`

### 🧮 Função Principal

```typescript
predictTaskTime(
  storyPoints: number,
  userId?: string,
  taskTypeId?: string
): Promise<Prediction>
```

### 🔬 Processo de Cálculo

#### 1. **Coleta de Dados Históricos**
```sql
SELECT 
  AVG(horas) as avg_hours,
  AVG(story_points) as avg_points,
  COUNT(*) as sample_size,
  STDDEV(horas) as std_dev_hours
FROM tasks
WHERE completed_at IS NOT NULL
  AND assigned_at IS NOT NULL
  AND story_points > 0
  AND assigned_to = $userId (opcional)
  AND task_type_id = $taskTypeId (opcional)
```

#### 2. **Cálculo de Horas por Story Point**
```typescript
hourPerPoint = avg_hours / avg_points
estimatedHours = storyPoints * hourPerPoint
```

#### 3. **Aplicação de Fator de Complexidade**
```typescript
function calculateComplexityFactor(storyPoints: number): number {
  if (storyPoints <= 2) return 0.8;  // Mais rápido
  if (storyPoints <= 5) return 1.0;  // Normal
  if (storyPoints <= 8) return 1.3;  // Mais complexo
  return 1.6;  // Muito complexo
}

estimatedHours *= complexityFactor;
```

#### 4. **Cálculo de Nível de Confiança**
```typescript
function calculateConfidenceLevel(
  sampleSize: number,
  stdDev: number,
  avgHours: number
): number {
  let confidence = 0.5;  // Base
  
  // Baseado no tamanho da amostra
  if (sampleSize >= 20) confidence += 0.3;
  else if (sampleSize >= 10) confidence += 0.2;
  else if (sampleSize >= 5) confidence += 0.1;
  else confidence -= 0.1;
  
  // Baseado na variabilidade (coeficiente de variação)
  const coefficientOfVariation = stdDev / avgHours;
  if (coefficientOfVariation < 0.3) confidence += 0.2;
  else if (coefficientOfVariation < 0.6) confidence += 0.1;
  else confidence -= 0.1;
  
  return Math.min(Math.max(confidence, 0.1), 0.95);
}
```

#### 5. **Cálculo de Margem de Erro**
```typescript
// Erro padrão para intervalo de confiança de 95%
const standardError = stdDev / Math.sqrt(sampleSize);
const marginOfError = standardError * 2.0;  // z-score ≈ 2.0 (95%)

min_hours = estimatedHours - marginOfError
max_hours = estimatedHours + marginOfError
```

### 📈 Retorno

```typescript
{
  estimated_hours: number,      // Horas estimadas
  confidence_level: number,      // 0-1 (ex: 0.85 = 85%)
  min_hours: number,            // Limite inferior
  max_hours: number,            // Limite superior
  hours_per_point: number,      // Razão horas/SP
  sample_size: number,          // Tamanho da amostra
  message: string               // Mensagem descritiva
}
```

### 🎯 Casos Especiais

- **Dados insuficientes (< 3 amostras)**: Usa padrão da indústria (4h/SP)
- **Sem histórico do programador**: Usa histórico geral
- **Sem histórico do tipo**: Usa histórico geral

---

## Tipos TypeScript

### 📝 Interfaces Principais

**Ficheiro**: `src/types/index.ts`

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  type: UserType;  // 'MANAGER' | 'PROGRAMMER'
  department: Department;
  experience_level?: NivelExperiencia;
  manager_id?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;  // 'TODO' | 'DOING' | 'DONE'
  order: number;
  story_points?: number;
  assigned_to?: string;
  task_type_id?: string;
  created_by?: string;
  
  // Datas
  created_at?: string;
  updated_at?: string;
  assigned_at?: string;
  completed_at?: string;
  
  // Display (JOIN)
  assigned_user_name?: string;
  task_type_name?: string;
  
  // Predição
  estimated_hours?: number;
  confidence_level?: number;
  min_hours?: number;
  max_hours?: number;
}

interface TaskType {
  id: string;
  name: string;
  description?: string;
}
```

**Ficheiro**: `src/constants/enums.ts`

```typescript
enum UserType {
  MANAGER = 'MANAGER',
  PROGRAMMER = 'PROGRAMMER'
}

enum TaskStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE'
}

enum Department {
  IT = 'IT',
  DESIGN = 'DESIGN',
  MARKETING = 'MARKETING'
}

enum NivelExperiencia {
  JUNIOR = 'junior',
  INTERMEDIO = 'intermedio',
  SENIOR = 'senior'
}
```

---

## Fluxos Principais

### 🔐 Fluxo de Autenticação

```
1. User acessa /login
2. Preenche formulário
3. POST /auth/login
4. Backend valida credenciais
5. Gera JWT token
6. Frontend armazena token (localStorage)
7. Redireciona para /kanban
8. Token enviado em todas as requisições (header Authorization)
```

### 📝 Fluxo de Criação de Tarefa

```
1. Gestor clica "Criar Tarefa"
2. Modal CreateTaskModal abre
3. Preenche dados (título, descrição, story points)
4. Ao inserir story points:
   → GET /tasks/predict?story_points=X&user_id=Y
   → Algoritmo calcula predição
   → Mostra estimativa em tempo real
5. Submete formulário
6. POST /tasks (com token)
7. Backend valida dados
8. Calcula order automaticamente
9. Insere na base de dados
10. Retorna tarefa criada
11. Frontend atualiza lista
12. Modal fecha
```

### 🔄 Fluxo de Movimentação de Tarefa (Drag & Drop)

```
1. Programador/Gestor arrasta tarefa
2. Solta em nova coluna
3. onTaskMove chamado
4. PATCH /tasks/:id { status: 'DOING' }
5. Backend:
   - Valida permissões
   - Recalcula order (se assigned_to/status mudou)
   - Atualiza assigned_at (se status = inprogress)
   - Atualiza completed_at (se status = done)
6. Retorna tarefa atualizada
7. Frontend atualiza estado local
8. UI re-renderiza
```

### 👥 Fluxo de Gestão de Utilizadores

```
1. Gestor acessa /users
2. GET /users (lista todos)
3. Mostra tabela de utilizadores
4. Criação:
   - Clica "Novo Utilizador"
   - Preenche formulário
   - POST /users
   - Backend hash password
   - Insere na base de dados
5. Edição:
   - Clica "Editar"
   - PUT /users/:id
6. Eliminação:
   - Clica "Eliminar"
   - DELETE /users/:id
```

---

## Configuração e Deploy

### ⚙️ Variáveis de Ambiente

**Ficheiro**: `.env` (criar baseado em `env.example.txt`)

```env
# Base de Dados
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# Servidor
PORT=3001
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.todoapp.com
```

### 🚀 Scripts NPM

```json
{
  "dev": "next dev",              // Frontend desenvolvimento
  "build": "next build",          // Build produção
  "start": "next start",          // Iniciar Next.js produção
  "server": "ts-node --project tsconfig.server.json start.ts",  // Backend
  "lint": "next lint"
}
```

### 🌐 Deploy

#### Railway (Backend)

**Ficheiro**: `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm run server",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Configuração:**
1. Conectar repositório Git
2. Adicionar variável `DATABASE_URL` (Supabase)
3. Adicionar `JWT_SECRET`
4. Deploy automático

#### Vercel (Frontend)

1. Conectar repositório
2. Build command: `npm run build`
3. Output directory: `.next`
4. Variável: `NEXT_PUBLIC_API_URL` (URL do Railway)

### 📦 Estrutura de Build

```
Produção:
├── Backend (Railway)
│   ├── start.ts compilado
│   ├── src/ compilado
│   └── node_modules/
│
└── Frontend (Vercel)
    ├── .next/ (build Next.js)
    ├── public/
    └── node_modules/
```

---

## 🐛 Debugging

### Logs Backend

- **Console logs** estruturados com prefixos:
  - `[DB]` - Operações de base de dados
  - `✅` - Sucesso
  - `❌` - Erro
  - `⚠️` - Aviso

### Erros Comuns

1. **Constraint única violada**: Order não recalculado ao mudar assigned_to/status
2. **Token inválido**: Verificar JWT_SECRET e expiração
3. **CORS**: Verificar origins permitidas em `start.ts`
4. **Base de dados**: Verificar DATABASE_URL e conectividade

---

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
**Autores**: João Piedade & Marcelo Ramos
