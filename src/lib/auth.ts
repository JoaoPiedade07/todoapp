import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User, CreateUserData } from '../lib/user';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto';
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
        algorithm: 'HS256' // Especifica o algoritmo explicitamente
      } as jwt.SignOptions // Cast para resolver o erro de tipos
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

    const existingUserByEmail = UserModel.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email já está em uso');
    }

    const existingUserByUsername = UserModel.findByUsername(userData.username);
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
      const manager = UserModel.findById(userData.manager_id);
      if (!manager) {
        throw new Error('Gestor responsável não encontrado');
      }
      if (manager.type !== 'gestor') {
        throw new Error('O gestor responsável deve ser do tipo gestor');
      }
    }

    if(userData.type === 'gestor') {
      userData.manager_id = null;
    }

    const passwordHash = await this.hashPassword(userData.password);
    const user = UserModel.create({
      ...userData,
      password: passwordHash
    });

    const token = this.generateToken(user.id);

    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = UserModel.findByEmail(email);
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
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    UserModel.updatePassword(userId, newPasswordHash);
  }
}