import { db } from '../lib/database';
import { Department } from '@/constants/enums';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  type: 'gestor' | 'programador';
  department: Department;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password: string;
  type: 'gestor' | 'programador';
  department: Department;
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

  static create(userData: CreateUserData): User {
    const { username, name, email, password, type, department } = userData;
    const id = Date.now().toString(); // Gerar ID único
    
    const stmt = db.prepare(`
      INSERT INTO users (id, username, name, email, password_hash, type, department) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(id, username, name, email, password, type, department);
    
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
}