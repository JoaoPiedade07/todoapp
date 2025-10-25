import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth';
import { UserModel } from '../lib/user';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  try {
    const decoded = AuthService.verifyToken(token);
    const user = UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Remove a senha do objeto user
    const { password_hash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = AuthService.verifyToken(token);
      const user = UserModel.findById(decoded.userId);
      
      if (user) {
        const { password_hash, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    } catch (error) {
      // Token inválido, mas continua sem usuário autenticado
    }
  }

  next();
};