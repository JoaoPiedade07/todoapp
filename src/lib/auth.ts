import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User, CreateUserData } from '../lib/user';

// Validar JWT_SECRET em produção
const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) {
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ ERRO CRÍTICO: JWT_SECRET não está configurado!');
    console.error('Configure JWT_SECRET no Railway: Variables → Add Variable');
    console.error('Gere uma chave segura com: openssl rand -base64 32\n');
    process.exit(1);
  } else {
    console.warn('⚠️ AVISO: JWT_SECRET não configurado, usando valor padrão (INSEGURO para produção)');
  }
}

const JWT_SECRET = JWT_SECRET_ENV || 'seu-segredo-super-secreto-dev-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface JWTPayload {
    userId: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    const payload: JWTPayload = { userId };
    
    return jwt.sign(
      payload, 
      JWT_SECRET, 
      { 
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );
  }

  static verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  static async register(userData: CreateUserData): Promise<{ user: User; token: string }> {
    const existingUserByEmail = await UserModel.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email já está em uso');
    }

    const existingUserByUsername = await UserModel.findByUsername(userData.username);
    if (existingUserByUsername) {
      throw new Error('Username já está em uso')
    }
    
    // Validar que programador tem um gestor
    if (userData.type === 'programador' && !userData.manager_id) {
      throw new Error('Programadores devem ter um gestor responsável');
    }

    // Se for gestor, não pode ter manager_id
    if (userData.type === 'gestor' && userData.manager_id) {
      throw new Error('Gestores não podem ter gestor responsável');
    }

    // Validar que o gestor existe e é do type correto
    if (userData.type === 'programador' && userData.manager_id) {
      const manager = await UserModel.findById(userData.manager_id);
      if (!manager) {
        throw new Error('Gestor responsável não encontrado');
      }
      if (manager.type !== 'gestor') {
        throw new Error('O gestor responsável deve ser do tipo gestor');
      }
    }
    
    if(userData.type === 'gestor') {
      userData.manager_id = undefined;
    }

    const passwordHash = await this.hashPassword(userData.password);
    const user = await UserModel.create({
      ...userData,
      password: passwordHash
    });

    const token = this.generateToken(user.id);

    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await this.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    const token = this.generateToken(user.id);

    return { user: { ...user, password_hash: '' }, token };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    await UserModel.updatePassword(userId, newPasswordHash);
  }
}