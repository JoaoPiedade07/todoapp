import express from 'express';
import { userQueries } from '../lib/database';
import { authenticateToken } from './middleware';

const router = express.Router();


// Obter todos os utilizadores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await userQueries.getAll();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
})

// Obter todos os gestores
router.get('/managers', authenticateToken, async (req, res) => {
  try {
    const managers = await userQueries.getManagers();
    res.json(managers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os programadores
router.get('/programmers', authenticateToken, async (req, res) => {
  try {
    const programmers = await userQueries.getProgrammers();
    res.json(programmers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obter programadores de um gestor específico
router.get('/by-manager/:managerId', authenticateToken, async (req, res) => {
  try {
    const { managerId } = req.params;
    const users = await userQueries.getByManagerId(managerId);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userQueries.getById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ [DELETE] Eliminando utilizador:', id);

    // Verificar se o utilizador existe
    const user = await userQueries.getById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    await userQueries.delete(id);
    
    console.log('✅ Utilizador eliminado com sucesso:', id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador eliminado com sucesso'
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

    // Filtrar apenas os campos que existem e são permitidos
    // No userRouteComplete.ts, nas rotas PUT e PATCH, atualize:
    const allowedFields = ['username', 'email', 'name', 'type', 'department', 'manager_id', 'experience_level'];;
    const filteredUpdates: any = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    console.log('📝 Campos filtrados para update:', filteredUpdates);

    await userQueries.update(id, filteredUpdates);
    const updatedUser = await userQueries.getById(id);
    
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

    // Filtrar apenas os campos que existem e são permitidos
    const allowedFields = ['username', 'email', 'name', 'type', 'department', 'manager_id'];
    const filteredUpdates: any = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    console.log('📝 Campos filtrados para update:', filteredUpdates);

    await userQueries.update(id, filteredUpdates);
    const updatedUser = await userQueries.getById(id);
    
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

export default router;