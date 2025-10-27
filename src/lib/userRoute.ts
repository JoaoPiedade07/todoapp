import express from 'express';
import { userQueries } from '../lib/database';

const router = express.Router();

// Obter todos os gestores
router.get('/managers', async (req, res) => {
  try {
    const managers = userQueries.getManagers();
    res.json(managers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os programadores
router.get('/programmers', async (req, res) => {
  try {
    const programmers = userQueries.getProgrammers();
    res.json(programmers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obter programadores de um gestor específico
router.get('/by-manager/:managerId', async (req, res) => {
  try {
    const { managerId } = req.params;
    const users = userQueries.getByManagerId(managerId);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;