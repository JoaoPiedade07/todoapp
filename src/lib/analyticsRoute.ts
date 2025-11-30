import express from 'express';
import { authenticateToken } from './middleware';
import { analyticsQueries } from './database';

const router = express.Router();

// GET /analytics/statistics - Estatísticas gerais do gestor
router.get('/statistics', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ error: 'Apenas gestores podem acessar estatísticas' });
    }

    const { days } = req.query;
    const daysParam = days ? parseInt(days as string) : 30;

    const statistics = await analyticsQueries.getManagerStatistics(req.user.id, daysParam);
    
    res.json({
      success: true,
      data: statistics,
      period_days: daysParam
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
  }
});

// GET /analytics/productivity - Produtividade por programador
router.get('/productivity', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ error: 'Apenas gestores podem acessar produtividade' });
    }

    const { days } = req.query;
    const daysParam = days ? parseInt(days as string) : 30;

    const productivity = await analyticsQueries.getProductivityByProgrammer(req.user.id, daysParam);
    
    res.json({
      success: true,
      data: productivity,
      period_days: daysParam
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtividade:', error);
    res.status(500).json({ error: 'Erro ao buscar produtividade', details: error.message });
  }
});

// GET /analytics/task-types - Estatísticas por tipo de tarefa
router.get('/task-types', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ error: 'Apenas gestores podem acessar estatísticas por tipo' });
    }

    const { days } = req.query;
    const daysParam = days ? parseInt(days as string) : 30;

    const statistics = await analyticsQueries.getStatisticsByTaskType(req.user.id, daysParam);
    
    res.json({
      success: true,
      data: statistics,
      period_days: daysParam
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas por tipo:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas por tipo', details: error.message });
  }
});

// GET /analytics/trends - Tendências ao longo do tempo
router.get('/trends', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ error: 'Apenas gestores podem acessar tendências' });
    }

    const { days } = req.query;
    const daysParam = days ? parseInt(days as string) : 30;

    const trends = await analyticsQueries.getTaskTrends(req.user.id, daysParam);
    
    res.json({
      success: true,
      data: trends,
      period_days: daysParam
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar tendências:', error);
    res.status(500).json({ error: 'Erro ao buscar tendências', details: error.message });
  }
});

// GET /analytics/estimation-accuracy - Precisão das estimativas
router.get('/estimation-accuracy', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.type !== 'gestor') {
      return res.status(403).json({ error: 'Apenas gestores podem acessar precisão de estimativas' });
    }

    const { days } = req.query;
    const daysParam = days ? parseInt(days as string) : 30;

    const accuracy = await analyticsQueries.getEstimationAccuracy(req.user.id, daysParam);
    
    res.json({
      success: true,
      data: accuracy,
      period_days: daysParam
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar precisão de estimativas:', error);
    res.status(500).json({ error: 'Erro ao buscar precisão de estimativas', details: error.message });
  }
});

export default router;

