import { db } from '../lib/database';
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
  experience_level?: string; // ✅ ADICIONADO
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
  experience_level?: string; // ✅ JÁ EXISTE
}

export class UserModel {
  static findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  static findById(id: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  static findByUsername(username: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | undefined;
  }

  static findByName(name: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
    return stmt.get(name) as User | undefined;
  }

  // Obter todos os programadores de um gestor especifico
  static findByManagerId(managerId: string): User[] {
    const stmt = db.prepare('SELECT * FROM users WHERE manager_id = ?');
    return stmt.all(managerId) as User[];
  }

  // Obter apenas programadores
  static findProgrammers(): User[] {
    const stmt = db.prepare("SELECT * FROM users WHERE type = 'programador' ORDER BY name");
    return stmt.all() as User[];
  }

  // Obter apenas gestores
  static findManagers(): User[] {
    const stmt = db.prepare("SELECT * FROM users WHERE type = 'gestor' ORDER BY name");
    return stmt.all() as User[];
  }

  static create(userData: CreateUserData): User {
    const { username, name, email, password, type, department, manager_id, experience_level } = userData;
    const id = Date.now().toString(); // Gerar ID único
    
    // ✅ ATUALIZADO: Incluir experience_level na query
    const stmt = db.prepare(`
      INSERT INTO users (id, username, name, email, password_hash, type, department, manager_id, experience_level) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      id, 
      username, 
      name, 
      email, 
      password, 
      type, 
      department, 
      manager_id || null,
      experience_level || 'junior' // ✅ ADICIONADO (valor padrão)
    );
    
    return this.findById(id)!;
  }

  static updatePassword(userId: string, newPasswordHash: string): void {
    const stmt = db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(newPasswordHash, userId);
  }

  // ✅ ADICIONAR: Método update para atualizar outros campos
  static update(userId: string, updates: Partial<User>): User {
    const user = this.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const allowedFields = ['username', 'name', 'email', 'type', 'department', 'manager_id', 'experience_level'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    allowedFields.forEach(field => {
      if (updates[field as keyof User] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updates[field as keyof User]);
      }
    });

    if (fieldsToUpdate.length === 0) {
      return user;
    }

    fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(userId)!;
  }

  // ✅ ADICIONAR: Método delete
  static delete(userId: string): void {
    const user = this.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
  }

  // ✅ ADICIONAR: Obter todos os usuários
  static findAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY name');
    return stmt.all() as User[];
  }
}