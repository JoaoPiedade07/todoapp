import { authenticateToken } from './middleware';
import { taskQueries, taskTypeQueries, predictionQueries, userQueries } from './database';
import express from 'express';

const router = express.Router();

// POST / - Criar task
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    // Verificar se o utilizador é gestor
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ 
        error: 'Apenas gestores podem criar tarefas' 
      });
    }

    const taskData = req.body;
    
    console.log('📥 Dados recebidos para criar task:');
    console.log('🔍 Body completo:', JSON.stringify(taskData, null, 2));
    console.log('👤 User que está a criar:', req.user);

    if (!taskData.title || taskData.title.trim() === '') {
      console.error('❌ ERRO CRÍTICO: Title está vazio!');
      return res.status(400).json({ error: 'Title é obrigatório' });
    }

    // Validação de story_points
    if (taskData.story_points) {
      const storyPoints = parseInt(taskData.story_points);
      if (isNaN(storyPoints) || storyPoints <= 0) {
        return res.status(400).json({ error: 'Story Points deve ser um número positivo' });
      }
    }

    // Validação de order
    if (taskData.order !== undefined && taskData.order !== null) {
      const order = typeof taskData.order === 'number' ? taskData.order : parseInt(taskData.order);
      if (isNaN(order) || order < 0) {
        return res.status(400).json({ error: 'Order deve ser um número não-negativo' });
      }
    }

    // Converter status do frontend para o formato do banco
    let status = taskData.status || 'todo';
    if (status === 'inprogess') { // Corrigir typo do enum
      status = 'inprogress';
    }

    // Converter task_type (nome) para task_type_id (ID)
    let taskTypeId: string | undefined = undefined;
    if (taskData.task_type && taskData.task_type.trim() !== '') {
      // Buscar o ID do tipo de tarefa pelo nome
      const taskTypes = await taskTypeQueries.getAll() as Array<{ id: string; name: string; description?: string }>;
      const taskType = taskTypes.find((tt) => tt.name === taskData.task_type);
      if (taskType) {
        taskTypeId = taskType.id;
      } else {
        // Se não existir, criar um novo tipo
        const newTaskTypeId = `task_type_${Date.now()}`;
        await taskTypeQueries.create({
          id: newTaskTypeId,
          name: taskData.task_type,
          description: `Tipo de tarefa: ${taskData.task_type}`
        });
        taskTypeId = newTaskTypeId;
      }
    }

    // Converter campos de snake_case para camelCase (formato esperado pelo database.ts)
    const taskToCreate = {
      id: taskData.id || `task_${Date.now()}`,
      title: taskData.title.trim(),
      description: taskData.description || undefined,
      status: status as 'todo' | 'inprogress' | 'done',
      order: taskData.order || 0,
      storyPoints: taskData.story_points ? parseInt(taskData.story_points) : undefined,
      assignedTo: taskData.assigned_to || undefined,
      taskTypeId: taskTypeId,
      createdBy: taskData.createdBy || req.user.id
    };

    console.log('🔄 Dados convertidos para criar task:', taskToCreate);

    await taskQueries.create(taskToCreate);
    
    // Buscar a task criada para retornar com os dados completos
    const createdTask = await taskQueries.getById(taskToCreate.id);
    
    console.log('✅ Task criada com sucesso no banco de dados');
    res.status(201).json(createdTask);
  } catch (error: any) {
    console.error('❌ Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa', details: error.message });
  }
});

// PUT /:id - Editar task completamente
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔄 Editando task:', { id, updates });

    // Converter campos se necessário
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.story_points !== undefined) updateData.storyPoints = updates.story_points;
    
    // ✅ CORREÇÃO: Converter strings vazias para null para foreign keys
    if (updates.assigned_to !== undefined) {
      updateData.assignedTo = updates.assigned_to === '' || updates.assigned_to === null ? null : updates.assigned_to;
      // Validar se o ID existe se não for null
      if (updateData.assignedTo) {
        const user = await userQueries.getById(updateData.assignedTo);
        if (!user) {
          return res.status(400).json({ error: 'Programador não encontrado' });
        }
      }
    }
    
    if (updates.task_type_id !== undefined) {
      updateData.taskTypeId = updates.task_type_id === '' || updates.task_type_id === null ? null : updates.task_type_id;
      // Validar se o ID existe se não for null
      if (updateData.taskTypeId) {
        const taskType = await taskTypeQueries.getById(updateData.taskTypeId);
        if (!taskType) {
          return res.status(400).json({ error: 'Tipo de tarefa não encontrado' });
        }
      }
    }
    
    if (updates.order !== undefined) updateData.order = updates.order;

    await taskQueries.update(id, updateData);
    const updatedTask = await taskQueries.getById(id);
    
    res.json({ 
      success: true, 
      message: 'Task atualizada com sucesso', 
      data: updatedTask 
    });
  } catch (error: any) {
    console.error('❌ Erro ao editar task:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /:id - Eliminar task
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Eliminando task:', id);

    // Verificar se a task existe
    const task = await taskQueries.getById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    await taskQueries.delete(id);
    
    res.json({ 
      success: true, 
      message: 'Task eliminada com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao eliminar task:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET / - Buscar todas as tasks
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const tasks = await taskQueries.getAll();
    res.json(tasks);
  } catch (error) {
    console.error('❌ Erro ao buscar tasks:', error);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
});

// GET /completed/:programmerId - Obter tarefas concluídas de um programador (apenas gestores)
router.get('/completed/:programmerId', authenticateToken, async (req: any, res) => {
  try {
    // Verificar se o utilizador é gestor
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ 
        error: 'Apenas gestores podem visualizar tarefas concluídas de outros utilizadores' 
      });
    }

    const { programmerId } = req.params;
    console.log('🔍 Buscando tarefas concluídas para programador:', programmerId);
    
    const completedTasks = await taskQueries.getCompletedTasksByProgrammer(programmerId);
    console.log('✅ Tarefas encontradas:', completedTasks.length);
    console.log('📋 Dados das tarefas:', JSON.stringify(completedTasks, null, 2));
    
    res.json({
      success: true,
      data: completedTasks,
      count: completedTasks.length
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar tarefas concluídas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas concluídas', details: error.message });
  }
});

// PATCH /:id - Atualizar task
router.patch('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔄 Atualizando task:', { id, updates });

    // Converter campos se necessário
    const updateData: any = {};
    if (updates.status !== undefined) {
      let status = updates.status;
      if (status === 'inprogess') {
        status = 'inprogress';
      }
      updateData.status = status;
    }
    if (updates.story_points !== undefined) updateData.storyPoints = updates.story_points;
    if (updates.assigned_to !== undefined) updateData.assignedTo = updates.assigned_to;
    if (updates.task_type_id !== undefined) updateData.taskTypeId = updates.task_type_id;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;

    console.log('📝 Dados convertidos para update:', updateData);

    await taskQueries.update(id, updateData);
    const updatedTask = await taskQueries.getById(id);
    
    console.log('✅ Task atualizada com sucesso:', updatedTask);
    
    res.json({ success: true, message: 'Task atualizada', data: updatedTask });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar task:', error);
    res.status(500).json({ error: 'Erro ao atualizar task', details: error.message });
  }
});

// GET /:id - Buscar task por ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const task = await taskQueries.getById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('❌ Erro ao buscar task:', error);
    res.status(500).json({ error: 'Erro ao buscar task' });
  }
});

// DELETE /:id - Eliminar task (duplicate route handler - keeping the one above)

// GET /predict - Obter predição de tempo para uma tarefa
router.get('/predict', authenticateToken, async (req: any, res) => {
  try {
    const { story_points, user_id, task_type_id } = req.query;
    
    if (!story_points) {
      return res.status(400).json({ error: 'story_points é obrigatório' });
    }

    const storyPoints = parseInt(story_points as string);
    if (isNaN(storyPoints) || storyPoints <= 0) {
      return res.status(400).json({ error: 'story_points deve ser um número positivo' });
    }

    const userId = user_id as string | undefined;
    const taskTypeId = task_type_id as string | undefined;

    const prediction = await predictionQueries.predictTaskTime(storyPoints, userId, taskTypeId);
    
    res.json({
      success: true,
      prediction
    });
  } catch (error: any) {
    console.error('❌ Erro ao calcular predição:', error);
    res.status(500).json({ error: 'Erro ao calcular predição', details: error.message });
  }
});

export default router;