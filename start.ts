import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './src/lib/database';
import authRoutes from './src/lib/authRoute';
import { authenticateToken } from './src/lib/middleware';
import userRoute from './src/lib/userRoute';
import taskRoute from './src/lib/taskRoute';
import taskTypeRoute from './src/lib/taskTypeRoute';
import programmerRoutes from './src/lib/programmerRoutes';
import analyticsRoute from './src/lib/analyticsRoute';

const server = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

initDatabase().catch((error) => {
  console.error('Erro ao inicializar base de dados:', error);
  process.exit(1);
});

server.use(cors({
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://10.0.97.104:3000',
      'http://192.168.1.202:3000'
    ];
    
    // Permitir requisições sem origem (ex: Postman, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Permitir qualquer domínio do Vercel
    if (/^https:\/\/.*\.vercel\.app$/.test(origin) || 
        /^https:\/\/.*\.vercel\.com$/.test(origin)) {
      return callback(null, true);
    }
    
    // Permitir qualquer IP na rede local 192.168.x.x na porta 3000
    if (/^http:\/\/192\.168\.\d+\.\d+:3000$/.test(origin)) {
      return callback(null, true);
    }
    
    // Permitir qualquer IP na rede local 10.x.x.x na porta 3000
    if (/^http:\/\/10\.\d+\.\d+\.\d+:3000$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

server.use(express.json());

server.use('/auth', authRoutes);
server.use('/users', userRoute);
server.use('/tasks', taskRoute);
server.use('/task-type', taskTypeRoute);
server.use('/programmer', programmerRoutes);
server.use('/analytics', analyticsRoute);

server.get('/protected', authenticateToken, (req: any, res) => {
  res.json({ 
    message: 'Esta é uma rota protegida',
    user: req.user 
  });
});

console.log('Carregando rotas...');
console.log('userRoute:', Object.keys(userRoute));
console.log('Rotas em userRoute:');
userRoute.stack.forEach((layer: any) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
    console.log(`  ${methods} ${layer.route.path}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`📡 Pronto para receber requisições!`);
});