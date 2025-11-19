import { authenticateToken } from './middleware';
import { taskQueries } from './database';
import express from 'express';

const router = express.Router();

// ✅ POST / - Criar task (CORREÇÃO: remove '/tasks')
router.post('/', authenticateToken, (req: any, res) => {
  try {
    // Verificar se o utilizador é gestor
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ 
        error: 'Apenas gestores podem criar tarefas' 
      });
    }

    const taskData = req.body;
    
    // ✅ LOGS DETALHADOS PARA DEBUG
    console.log('📥 Dados recebidos para criar task:');
    console.log('🔍 Body completo:', JSON.stringify(taskData, null, 2));
    console.log('📝 Title:', taskData.title);
    console.log('📝 Title type:', typeof taskData.title);
    console.log('📝 Title value:', taskData.title);
    console.log('👤 User que está a criar:', req.user);

    // ✅ VALIDAÇÃO EXTRA
    if (!taskData.title || taskData.title.trim() === '') {
      console.error('❌ ERRO CRÍTICO: Title está vazio!');
      return res.status(400).json({ error: 'Title é obrigatório' });
    }

    const result = taskQueries.create(taskData);
    
    console.log('✅ Task criada com sucesso no banco de dados');
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// ✅ GET / - Buscar todas as tasks (CORREÇÃO: remove '/tasks')
router.get('/', authenticateToken, (req: any, res) => {
  try {
    const tasks = taskQueries.getAll();
    res.json(tasks);
  } catch (error) {
    console.error('❌ Erro ao buscar tasks:', error);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
});

// ✅ PATCH /:id - Atualizar task (CORREÇÃO: remove '/tasks')
router.patch('/:id', authenticateToken, (req: any, res) => {
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

// ✅ GET /:id - Buscar task por ID (CORREÇÃO: remove '/tasks')
router.get('/:id', authenticateToken, (req: any, res) => {
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

// ✅ DELETE /:id - Eliminar task (CORREÇÃO: remove '/tasks')
router.delete('/:id', authenticateToken, (req: any, res) => {
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