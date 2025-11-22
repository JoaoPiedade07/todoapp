import express from 'express';
import { AuthService } from '../lib/auth';
import { authenticateToken, AuthenticatedRequest } from '../lib/middleware';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password, type, department, manager_id, experience_level } = req.body;

    if (!username || !name || !email || !password || !type || !department) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    if(type === 'programador' && !manager_id) {
      return res.status(400).json({ error: 'Programadores devem ter um gestor responsavel' });
    }

    const result = await AuthService.register({ 
      username, 
      name, 
      email, 
      password, 
      type, 
      department, 
      manager_id,
      experience_level
    });
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await AuthService.login(email, password);
    
    res.json({
      message: 'Login realizado com sucesso',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    await AuthService.changePassword(userId, currentPassword, newPassword);
    
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;