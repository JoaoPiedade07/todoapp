import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './src/lib/database';
import authRoutes from './src/lib/authRoute';
import { authenticateToken } from './src/lib/middleware';

dotenv.config();

const server = express();
const PORT = process.env.PORT || 3001;

initDatabase();

server.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.118:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
server.use(express.json());

server.use('/auth', authRoutes);

// Rota protegida de exemplo
server.get('/protected', authenticateToken, (req: any, res) => {
  res.json({ 
    message: 'Esta é uma rota protegida',
    user: req.user 
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});