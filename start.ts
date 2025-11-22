import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './src/lib/database';
import authRoutes from './src/lib/authRoute';
import { authenticateToken } from './src/lib/middleware';
//import userRoute from './src/lib/userRouteComplete';
import userRoute from './src/lib/userRoute';
import taskRoute from './src/lib/taskRoute';
import taskTypeRoute from './src/lib/taskTypeRoute';

dotenv.config();

const server = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

initDatabase();

// 🔥 CORREÇÃO CORS: Adicionar PATCH nos métodos permitidos
server.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.0.97.104:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // ← ADICIONADO PATCH
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ ADICIONA ESTE MIDDLEWARE PARA DEBUG
server.use((req, res, next) => {
  console.log('🔍 Request:', req.method, req.url);
  console.log('🔍 Headers:', req.headers);
  console.log('🔍 Body:', req.body);
  next();
});

server.use(express.json());

server.use('/auth', authRoutes);
server.use('/users', userRoute);
server.use('/tasks', taskRoute);
server.use('/task-type', taskTypeRoute);

// Rota protegida de exemplo
server.get('/protected', authenticateToken, (req: any, res) => {
  res.json({ 
    message: 'Esta é uma rota protegida',
    user: req.user 
  });
});

// No start.ts, adicione isto ANTES do server.listen:
console.log('🔄 Carregando rotas...');
console.log('📁 userRoute:', Object.keys(userRoute));
console.log('🔗 Rotas em userRoute:');
userRoute.stack.forEach((layer: any) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
    console.log(`  ${methods} ${layer.route.path}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL Local: http://localhost:${PORT}`);
  console.log(`URL Rede: http://10.0.97.104:${PORT}`);
});