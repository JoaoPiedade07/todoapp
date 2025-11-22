import express from 'express';
import { userQueries } from '../lib/database';
import { authenticateToken } from '../lib/middleware';

const router = express.Router();

// 🔥 ROTAS COMPLETAS DO CRUD

// GET - Obter todos os utilizadores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = userQueries.getAll();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET - Obter utilizador por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = userQueries.getById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST - Criar utilizador (já existe no authRoute)
// DELETE - Eliminar utilizador
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ [DELETE] Eliminando utilizador:', id);

    // Verificar se o utilizador existe
    const user = userQueries.getById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const result = userQueries.delete(id);
    
    console.log('✅ Utilizador eliminado com sucesso:', id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador eliminado com sucesso', 
      data: result 
    });
  } catch (error: any) {
    console.error('❌ Erro ao eliminar utilizador:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT - Atualizar utilizador
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔄 [PUT] Atualizando utilizador:', { id, updates });

    const result = userQueries.update(id, updates);
    const updatedUser = userQueries.getById(id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador atualizado com sucesso', 
      data: updatedUser 
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar utilizador:', error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH - Atualização parcial
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔧 [PATCH] Atualizando utilizador:', { id, updates });

    const result = userQueries.update(id, updates);
    const updatedUser = userQueries.getById(id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador atualizado com sucesso', 
      data: updatedUser 
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar utilizador:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rotas existentes...
router.get('/managers', authenticateToken, async (req, res) => {
  try {
    const managers = userQueries.getManagers();
    res.json(managers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/programmers', authenticateToken, async (req, res) => {
  try {
    const programmers = userQueries.getProgrammers();
    res.json(programmers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/by-manager/:managerId', authenticateToken, async (req, res) => {
  try {
    const { managerId } = req.params;
    const users = userQueries.getByManagerId(managerId);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;