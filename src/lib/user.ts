import { query, queryOne, execute } from './database';
import { Department } from '@/constants/enums';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  type: 'gestor' | 'programador';
  manager_id?: string | null;
  department: Department;
  experience_level?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password: string;
  type: string;
  department: string;
  manager_id?: string;
  experience_level?: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | undefined> {
    return await queryOne('SELECT * FROM users WHERE email = $1', [email]) as User | undefined;
  }

  static async findById(id: string): Promise<User | undefined> {
    return await queryOne('SELECT * FROM users WHERE id = $1', [id]) as User | undefined;
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    return await queryOne('SELECT * FROM users WHERE username = $1', [username]) as User | undefined;
  }

  static async findByName(name: string): Promise<User | undefined> {
    return await queryOne('SELECT * FROM users WHERE name = $1', [name]) as User | undefined;
  }

  // Obter todos os programadores de um gestor especifico
  static async findByManagerId(managerId: string): Promise<User[]> {
    return await query('SELECT * FROM users WHERE manager_id = $1', [managerId]) as User[];
  }

  // Obter apenas programadores
  static async findProgrammers(): Promise<User[]> {
    return await query("SELECT * FROM users WHERE type = 'programador' ORDER BY name") as User[];
  }

  // Obter apenas gestores
  static async findManagers(): Promise<User[]> {
    return await query("SELECT * FROM users WHERE type = 'gestor' ORDER BY name") as User[];
  }

  static async create(userData: CreateUserData): Promise<User> {
    const { username, name, email, password, type, department, manager_id, experience_level } = userData;
    const id = Date.now().toString(); // Gerar ID único
    
    await execute(`
      INSERT INTO users (id, username, name, email, password_hash, type, department, manager_id, experience_level) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      id, 
      username, 
      name, 
      email, 
      password, 
      type, 
      department, 
      manager_id || null,
      experience_level || 'junior'
    ]);
    
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Erro ao criar usuário');
    }
    return user;
  }

  static async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await execute(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [newPasswordHash, userId]);
  }

  // Método update para atualizar outros campos
  static async update(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const allowedFields = ['username', 'name', 'email', 'type', 'department', 'manager_id', 'experience_level'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    allowedFields.forEach(field => {
      if (updates[field as keyof User] !== undefined) {
        fieldsToUpdate.push(`${field} = $${paramIndex}`);
        values.push(updates[field as keyof User]);
        paramIndex++;
      }
    });

    if (fieldsToUpdate.length === 0) {
      return user;
    }

    fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    await execute(`
      UPDATE users 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = $${paramIndex}
    `, values);
    
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new Error('Erro ao atualizar usuário');
    }
    return updatedUser;
  }

  // Método delete
  static async delete(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await execute('DELETE FROM users WHERE id = $1', [userId]);
  }

  // Obter todos os usuários
  static async findAll(): Promise<User[]> {
    return await query('SELECT * FROM users ORDER BY name') as User[];
  }
}
