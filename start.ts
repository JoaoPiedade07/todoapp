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

// Configurar middleware e rotas ANTES de inicializar servidor
server.use(cors({
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://10.0.97.104:3000',
      'http://192.168.1.202:3000'
    ];
    
    // Permitir requisições sem origem (ex: Postman, mobile apps, server-side)
    if (!origin) {
      console.log('✅ CORS: Permitindo requisição sem origem');
      return callback(null, true);
    }
    
    console.log('🔍 CORS: Verificando origem:', origin);
    
    // Verificar se a origem está na lista
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origem permitida (lista)');
      return callback(null, true);
    }
    
    // Permitir qualquer domínio do Vercel (incluindo subdomínios e projetos)
    // Exemplos: https://todoapp-ybkz-49uo8wqcg-joaopiedade07s-projects.vercel.app
    //          https://*.vercel.app, https://*.vercel.com
    if (origin && (origin.includes('.vercel.app') || origin.includes('.vercel.com') || origin.includes('vercel.app') || origin.includes('vercel.com'))) {
      console.log('✅ CORS: Origem permitida (Vercel):', origin);
      return callback(null, true);
    }
    
    // Permitir qualquer IP na rede local 192.168.x.x na porta 3000
    if (/^http:\/\/192\.168\.\d+\.\d+:3000$/.test(origin)) {
      console.log('✅ CORS: Origem permitida (rede local 192.168)');
      return callback(null, true);
    }
    
    // Permitir qualquer IP na rede local 10.x.x.x na porta 3000
    if (/^http:\/\/10\.\d+\.\d+\.\d+:3000$/.test(origin)) {
      console.log('✅ CORS: Origem permitida (rede local 10.x)');
      return callback(null, true);
    }
    
    console.log('❌ CORS: Origem bloqueada:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Logging middleware - sempre ativo para debug
server.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`  Origin: ${req.headers.origin || 'none'}`);
  // Não logar body completo em produção (pode conter dados sensíveis)
  if (process.env.NODE_ENV === 'development' && req.body) {
    const bodyCopy = { ...req.body };
    if (bodyCopy.password) bodyCopy.password = '***';
    console.log(`  Body:`, JSON.stringify(bodyCopy, null, 2));
  }
  next();
});

server.use(express.json());

server.use('/auth', authRoutes);
server.use('/users', userRoute);
server.use('/tasks', taskRoute);
server.use('/task-type', taskTypeRoute);
server.use('/programmer', programmerRoutes);
server.use('/analytics', analyticsRoute);

// Health check endpoint (útil para Railway/Vercel verificar se o servidor está rodando)
server.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Test endpoint para verificar se as rotas estão acessíveis
server.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend está funcionando!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'none',
    routes: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      managers: 'GET /auth/managers',
      health: 'GET /health'
    }
  });
});

server.get('/protected', authenticateToken, (req: any, res) => {
  res.json({ 
    message: 'Esta é uma rota protegida',
    user: req.user 
  });
});

// Catch-all para rotas não encontradas (útil para debug)
server.use((req, res) => {
  console.error(`❌ Rota não encontrada: ${req.method} ${req.url}`);
  console.error(`  Origin: ${req.headers.origin || 'none'}`);
  console.error(`  Headers:`, JSON.stringify(req.headers, null, 2));
  res.status(404).json({ 
    error: 'Rota não encontrada',
    method: req.method,
    path: req.url,
    availableRoutes: {
      auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/managers', 'GET /auth/me'],
      users: ['GET /users', 'GET /users/managers', 'GET /users/:id'],
      health: ['GET /health']
    }
  });
});

console.log('✅ Middleware e rotas configuradas');

// Log auth routes
console.log('Rotas em authRoute:');
try {
  authRoutes.stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
      console.log(`  ${methods} /auth${layer.route.path}`);
    } else if (layer.name === 'router') {
      // Handle nested routers
      console.log(`  Router: /auth${layer.regexp}`);
    }
  });
  console.log('✅ Rotas de autenticação carregadas:');
  console.log('  - POST /auth/register');
  console.log('  - POST /auth/login');
  console.log('  - GET /auth/managers');
  console.log('  - GET /auth/me');
  console.log('  - POST /auth/change-password');
} catch (error) {
  console.error('Erro ao logar rotas de auth:', error);
}

// Log user routes
console.log('Rotas em userRoute:');
userRoute.stack.forEach((layer: any) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
    console.log(`  ${methods} /users${layer.route.path}`);
  }
});

// Função para inicializar servidor de forma assíncrona
async function startServer() {
  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERRO: DATABASE_URL não está configurada!');
      console.error('Configure a variável de ambiente DATABASE_URL no Railway');
      process.exit(1);
    }

    console.log('🔄 Inicializando base de dados...');
    console.log(`📊 DATABASE_URL configurada: ${process.env.DATABASE_URL ? 'Sim' : 'Não'}`);
    
    // Adicionar timeout para inicialização (30 segundos)
    const initTimeout = setTimeout(() => {
      console.error('❌ Timeout ao inicializar base de dados (30s)');
      process.exit(1);
    }, 30000);

    await initDatabase();
    clearTimeout(initTimeout);
    
    console.log('✅ Base de dados inicializada com sucesso');
    
    // Iniciar servidor apenas após a base de dados estar pronta
    const httpServer = server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
      console.log(`📡 Pronto para receber requisições!`);
      console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
    });

    // Tratamento de erros do servidor HTTP
    httpServer.on('error', (error: any) => {
      console.error('❌ Erro no servidor:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso`);
      }
      process.exit(1);
    });

  } catch (error: any) {
    console.error('❌ Erro ao inicializar base de dados:', error);
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    if (error.code) {
      console.error('Código de erro:', error.code);
    }
    process.exit(1);
  }
}

// Iniciar o servidor (depois de configurar tudo)
console.log('🚀 Iniciando servidor...');
startServer();
