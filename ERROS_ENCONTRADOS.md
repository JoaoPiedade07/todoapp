# 🔍 Relatório de Erros e Problemas Encontrados

Este documento lista todos os erros, problemas e melhorias identificados na aplicação TodoApp.

## 🚨 Erros Críticos

### 1. **Erro SQL no Algoritmo de Predição**
**Localização:** `src/lib/database.ts` - `calculateTeamVelocity` e `calculatePointsToHoursRatio`

**Problema:**
```sql
-- Linha 506: GROUP BY 1 não funciona com funções agregadas
query += ' GROUP BY 1';  -- ❌ ERRADO
```

**Impacto:** As queries falham com erro: `aggregate functions are not allowed in the GROUP BY clause`

**Solução:** Remover `GROUP BY 1` quando não há agrupamento por coluna específica:
```typescript
// Remover completamente quando não há userId
if (!userId) {
    // Não usar GROUP BY quando não há agrupamento necessário
}
```

---

### 2. **Ordem Incorreta das Rotas Express**
**Localização:** `src/lib/userRoute.ts`

**Problema:**
A rota `/:id` está ANTES de `/programmers`, fazendo com que "programmers" seja interpretado como um ID.

**Solução:** ✅ **JÁ CORRIGIDO** - As rotas específicas devem vir antes das dinâmicas.

---

## ⚠️ Problemas de Validação

### 3. **parseInt Sem Validação de NaN**
**Localizações:**
- `src/lib/taskRoute.ts:61` e `236`
- `src/components/kanban/CreateTaskModal.tsx:181`
- `src/components/kanban/EditTaskModal.tsx:112`

**Problema:**
```typescript
parseInt(formData.story_points)  // Pode retornar NaN
```

**Solução:**
```typescript
const storyPoints = parseInt(formData.story_points);
if (isNaN(storyPoints) || storyPoints <= 0) {
    throw new Error('Story Points inválido');
}
```

---

### 4. **Falta Validação de Tipos de Entrada**
**Localização:** `src/lib/taskRoute.ts`

**Problema:** Aceita qualquer valor em `story_points` sem validar se é um número válido.

**Solução:** Adicionar validação:
```typescript
if (taskData.story_points && (isNaN(parseInt(taskData.story_points)) || parseInt(taskData.story_points) <= 0)) {
    return res.status(400).json({ error: 'Story Points deve ser um número positivo' });
}
```

---

## 🛡️ Problemas de Segurança

### 5. **Uso Excessivo de `any`**
**Impacto:** Perda de type safety, erros em runtime não detectados em compile-time.

**Localizações com muitos `any`:**
- `src/app/kanban/page.tsx` - `user: any`, `availableUsers: any[]`
- `src/components/kanban/CreateTaskModal.tsx` - `prediction: any`
- `src/lib/taskRoute.ts` - `req: any` em todas as rotas
- Muitos outros arquivos

**Solução:** Criar interfaces TypeScript adequadas:
```typescript
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        type: 'gestor' | 'programador';
        email: string;
        // ... outros campos
    };
}
```

---

### 6. **Falta de Sanitização de Inputs**
**Localização:** Todos os endpoints que recebem dados do utilizador

**Problema:** Dados do utilizador são inseridos diretamente na base de dados sem sanitização (apesar de usar prepared statements, que ajuda, mas não é suficiente).

**Solução:** Adicionar validação e sanitização:
```typescript
import validator from 'validator';

const sanitizeInput = (input: string) => {
    return validator.escape(input.trim());
};
```

---

### 7. **Tokens JWT Sem Expiração Verificada**
**Localização:** `src/lib/middleware.ts`

**Problema:** Token pode não ter expiração configurada ou não está sendo verificada.

**Solução:** Verificar no middleware se o token expirou.

---

## 🐛 Bugs de Lógica

### 8. **Typo no Status: "inprogess" em vez de "inprogress"**
**Localização:** `src/lib/taskRoute.ts:30`

**Problema:**
```typescript
if (status === 'inprogess') { // Typo
    status = 'inprogress';
}
```

**Solução:** Corrigir no frontend para usar sempre 'inprogress' ou 'doing'.

---

### 9. **Validação de Ordem de Tarefas Pode Falhar**
**Localização:** `src/lib/database.ts:350-371`

**Problema:** A validação usa `assigned_to` mas pode ser `null`.

**Solução:**
```typescript
if (!task || !task.assigned_to) {
    return true; // Se não há atribuição, permite mover
}
```

---

### 10. **Race Condition no CreateTaskModal**
**Localização:** `src/components/kanban/CreateTaskModal.tsx:113-156`

**Problema:** O `useEffect` para buscar predição pode fazer múltiplas chamadas antes do debounce.

**Solução:** ✅ Já tem debounce de 500ms, mas pode melhorar cancelando requisições anteriores.

---

## 🔧 Problemas de Performance

### 11. **Múltiplas Queries no Loop**
**Localização:** `src/lib/database.ts:487`

**Problema:**
```typescript
tasks.map(t => {
    const row = getInfoStmt.get(t.id); // Query dentro de loop
});
```

**Solução:** Otimizar com uma única query:
```typescript
const ids = tasks.map(t => t.id);
const stmt = db.prepare(`SELECT assigned_to FROM tasks WHERE id IN (${ids.map(() => '?').join(',')})`);
```

---

### 12. **Console.logs em Produção**
**Localização:** Todo o código

**Problema:** Muitos `console.log` que devem ser removidos ou substituídos por um logger adequado.

**Solução:** Criar um sistema de logging:
```typescript
const logger = {
    info: (msg: string) => process.env.NODE_ENV === 'development' && console.log(msg),
    error: (msg: string) => console.error(msg),
};
```

---

## 🎨 Problemas de UX

### 13. **Falta de Feedback Visual em Erros**
**Localização:** Vários componentes

**Problema:** Alguns erros apenas fazem `console.error` sem mostrar ao utilizador.

**Solução:** Adicionar toasts ou mensagens de erro visíveis.

---

### 14. **Validação no Frontend e Backend Inconsistente**
**Localização:** Formulários vs. Rotas

**Problema:** Validações no frontend podem não corresponder às do backend.

**Solução:** Criar um esquema de validação compartilhado (ex: Zod, Yup).

---

## 📋 Problemas de Código

### 15. **Código Duplicado**
**Localização:** 
- Conversão de status aparece em múltiplos lugares
- Validação de gestor repetida

**Solução:** Extrair para funções utilitárias:
```typescript
// utils/status.ts
export const normalizeStatus = (status: string): 'todo' | 'inprogress' | 'done' => {
    if (status === 'inprogess' || status === 'inprogress' || status === 'doing') {
        return 'inprogress';
    }
    return status as 'todo' | 'inprogress' | 'done';
};
```

---

### 16. **Falta de Tratamento de Erros Assíncronos**
**Localização:** Componentes React com async/await

**Problema:** Alguns `catch` blocks apenas logam sem tratamento adequado.

**Solução:** Implementar tratamento de erros global.

---

## 🔄 Problemas de Estado

### 17. **Estado Não Limpo ao Fechar Modal**
**Localização:** `src/components/kanban/CreateTaskModal.tsx`

**Problema:** Alguns estados podem não ser limpos corretamente.

**Solução:** ✅ Já implementado em `handleClose`, mas verificar todos os modais.

---

## 📊 Problemas de Base de Dados

### 18. **Falta de Índices em Algumas Queries**
**Localização:** `src/lib/database.ts`

**Problema:** Queries complexas podem ser lentas sem índices adequados.

**Solução:** Adicionar índices:
```sql
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
```

---

### 19. **Transações Não Utilizadas Onde Seriam Úteis**
**Localização:** Operações que atualizam múltiplas tabelas

**Problema:** Algumas operações deveriam ser atómicas.

**Solução:** Usar transações para operações relacionadas.

---

## ✅ Recomendações de Melhoria

### 20. **Adicionar Testes**
- Testes unitários para funções críticas
- Testes de integração para rotas API
- Testes E2E para fluxos principais

### 21. **Documentação**
- Documentar funções complexas
- Adicionar JSDoc comments
- Documentar decisões arquiteturais

### 22. **Monitorização**
- Adicionar logging estruturado
- Implementar error tracking (Sentry, etc.)
- Métricas de performance

---

## 📝 Resumo por Prioridade

### 🔴 Crítico (Resolver Imediatamente)
1. Erro SQL no algoritmo de predição
2. Validação de parseInt (NaN)
3. Ordem das rotas Express (✅ já corrigido)

### 🟡 Importante (Resolver em Breve)
4. Uso excessivo de `any`
5. Sanitização de inputs
6. Validação de tipos de entrada
7. Bugs de lógica (typo, validações)

### 🟢 Melhorias (Fazer Quando Possível)
8. Performance (queries, logs)
9. UX (feedback visual)
10. Testes e documentação

---

**Última Atualização:** 2024

