import express from 'express';
import { taskQueries } from './database';
import { authenticateToken } from './middleware';

const router = express.Router();

// Lista de tarefas concluídas do programador
router.get('/completed-tasks', authenticateToken, async (req: any, res) => {
  try {
    const programmerId = req.user.id;
    
    const completedTasks = await taskQueries.getCompletedTasksByProgrammer(programmerId);
    
    res.json({
      success: true,
      data: completedTasks,
      count: completedTasks.length
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Estatísticas do programador
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const programmerId = req.user.id;
    
    const stats = await taskQueries.getProgrammerStats(programmerId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;