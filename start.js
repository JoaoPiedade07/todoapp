import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotnev from 'dotenv';
import { initDatabase } from './src/lib/database.js';
import authRotes from './src/lib/authRoute.js';

dotnev.config();

const server = express();
const PORT = process.env.PORT || 3000;

initDatabase();

server.use(cors());
server.use(express.json());

server.use('/auth', authRotes);

// Middleware de autenticação (você precisa implementar isso)
function authenticateToken(req, res, next) {
  // Sua lógica de autenticação aqui
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }
  
  // Verificar o token JWT ou sua lógica de autenticação
  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { ... })
  
  // Exemplo simplificado:
  req.user = { id: '123', email: 'user@example.com' };
  next();
}

// Rota protegida de exemplo (sem anotações de tipo)
server.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Esta é uma rota protegida',
    user: req.user 
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});