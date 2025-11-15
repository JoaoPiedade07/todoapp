import { authenticateToken } from './middleware';
import { taskQueries } from './database';
import express from 'express';

const router = express.Router();

// ✅ POST /tasks - Criar task
router.post('/tasks', authenticateToken, (req: any, res) => {
  try {
    // Verificar se o utilizador é gestor
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ 
        error: 'Apenas gestores podem criar tarefas' 
      });
    }

    const taskData = req.body;
    
    console.log('📥 Dados recebidos para criar task:', taskData);
    console.log('👤 User que está a criar:', req.user);

    const result = taskQueries.create(taskData);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// ✅ GET /tasks - Buscar todas as tasks
router.get('/tasks', authenticateToken, (req: any, res) => {
  try {
    const tasks = taskQueries.getAll();
    res.json(tasks);
  } catch (error) {
    console.error('❌ Erro ao buscar tasks:', error);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
});

// ✅ PATCH /tasks/:id - Atualizar task
router.patch('/tasks/:id', authenticateToken, (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`🔄 Atualizando task ${id}:`, updates);

    const result = taskQueries.update(id, updates);
    res.json({ success: true, message: 'Task atualizada', data: result });
  } catch (error) {
    console.error('❌ Erro ao atualizar task:', error);
    res.status(500).json({ error: 'Erro ao atualizar task' });
  }
});

// ✅ GET /tasks/:id - Buscar task por ID
router.get('/tasks/:id', authenticateToken, (req: any, res) => {
  try {
    const { id } = req.params;
    const task = taskQueries.getById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('❌ Erro ao buscar task:', error);
    res.status(500).json({ error: 'Erro ao buscar task' });
  }
});

// ✅ DELETE /tasks/:id - Eliminar task
router.delete('/tasks/:id', authenticateToken, (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o utilizador é gestor
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ 
        error: 'Apenas gestores podem eliminar tarefas' 
      });
    }

    const result = taskQueries.delete(id);
    res.json({ success: true, message: 'Task eliminada', data: result });
  } catch (error) {
    console.error('❌ Erro ao eliminar task:', error);
    res.status(500).json({ error: 'Erro ao eliminar task' });
  }
});

export default router;