import { authenticateToken } from './middleware';
import { taskQueries } from './database';
import express from 'express';

const router = express.Router()

router.post('/tasks', authenticateToken, (req: any, res) => {
  try {
    // Verificar se o utilizador é gestor
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ 
        error: 'Apenas gestores podem criar tarefas' 
      });
    }

    const taskData = req.body;
    const result = taskQueries.create(taskData);
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});