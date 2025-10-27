import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './src/lib/database';
import authRoutes from './src/lib/authRoute';
import { authenticateToken } from './src/lib/middleware';
import userRoute from './src/lib/userRoute';

dotenv.config();

const server = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

initDatabase();

server.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.0.97.104:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
server.use(express.json());

server.use('/auth', authRoutes);
server.use('/users', userRoute);

// Rota protegida de exemplo
server.get('/protected', authenticateToken, (req: any, res) => {
  res.json({ 
    message: 'Esta é uma rota protegida',
    user: req.user 
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL Local: http://localhost:${PORT}`);
  console.log(`URL Rede: http://10.0.97.104:${PORT}`);
});