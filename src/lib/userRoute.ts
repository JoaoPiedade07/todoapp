import express from 'express';
import { userQueries } from '../lib/database';
import { authenticateToken } from './middleware';
import { validateUserData, sanitizeString } from './validators';

const router = express.Router();

// Rotas específicas devem vir ANTES de rotas com parâmetros dinâmicos

// Obter todos os gestores (público para registro - SEM autenticação)
router.get('/managers', async (req, res) => {
  try {
    console.log('[GET] /users/managers - Rota pública chamada');
    const managers = await userQueries.getManagers();
    console.log(`Retornando ${managers.length} gestores`);
    res.json(managers);
  } catch (error: any) {
    console.error('Erro ao buscar gestores:', error);
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os utilizadores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await userQueries.getAll();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Rota autenticada alternativa (se necessário)
router.get('/managers/authenticated', authenticateToken, async (req, res) => {
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
    
    console.log('[DELETE] Eliminando utilizador:', id);

    // Validar ID
    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'ID é obrigatório' });
    }

    // Verificar se o utilizador existe
    const user = await userQueries.getById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Proteção: não permitir eliminar o utilizador principal
    if (id === '1' || id === 'admin') {
      return res.status(403).json({ error: 'Não é permitido eliminar o utilizador principal' });
    }

    await userQueries.delete(id);
    
    console.log('Utilizador eliminado com sucesso:', id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador eliminado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao eliminar utilizador:', error);
    res.status(500).json({ 
      error: 'Erro ao eliminar utilizador', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT - Atualizar utilizador
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('[PUT] Atualizando utilizador:', { id, updates });

    // Validar ID
    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'ID é obrigatório' });
    }

    // Validar dados usando validators
    const validation = validateUserData(updates);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validation.errors
      });
    }

    // Filtrar apenas os campos que existem e são permitidos
    const allowedFields = ['username', 'email', 'name', 'type', 'department', 'manager_id', 'experience_level'];
    const filteredUpdates: any = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        // Sanitizar strings
        if (typeof updates[field] === 'string') {
          filteredUpdates[field] = sanitizeString(updates[field]);
        } else {
          filteredUpdates[field] = updates[field];
        }
      }
    });

    console.log('Campos filtrados para update:', filteredUpdates);

    // Verificar se o utilizador existe
    const existingUser = await userQueries.getById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    await userQueries.update(id, filteredUpdates);
    const updatedUser = await userQueries.getById(id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador atualizado com sucesso', 
      data: updatedUser 
    });
  } catch (error: any) {
    console.error('Erro ao atualizar utilizador:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar utilizador', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PATCH - Atualização parcial
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('[PATCH] Atualizando utilizador:', { id, updates });

    // Validar ID
    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'ID é obrigatório' });
    }

    // Verificar se o utilizador existe
    const existingUser = await userQueries.getById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Filtrar apenas os campos que existem e são permitidos
    const allowedFields = ['username', 'email', 'name', 'type', 'department', 'manager_id', 'experience_level'];
    const filteredUpdates: any = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        // Sanitizar strings
        if (typeof updates[field] === 'string') {
          filteredUpdates[field] = sanitizeString(updates[field]);
        } else {
          filteredUpdates[field] = updates[field];
        }
      }
    });

    // Validar dados atualizados
    const validation = validateUserData({ ...existingUser, ...filteredUpdates });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validation.errors
      });
    }

    console.log('Campos filtrados para update:', filteredUpdates);

    await userQueries.update(id, filteredUpdates);
    const updatedUser = await userQueries.getById(id);
    
    res.json({ 
      success: true, 
      message: 'Utilizador atualizado com sucesso', 
      data: updatedUser 
    });
  } catch (error: any) {
    console.error('Erro ao atualizar utilizador:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar utilizador', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;