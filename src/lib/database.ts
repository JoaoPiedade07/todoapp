import Database from "better-sqlite3";
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite3');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

//Criar tabelas se não existirem
export function initDatabase() {
    //Tabela de utilizadores
    db.exec(`
        CREATE TABLE IF NOT EXITS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          type TEXT CHECK(type IN ('gestor', 'programador')) NOT NULL,
          department TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `)
    
    //Tabela de tipos de tarefas
    db.exec(`
        CREATE TABLE IF NOT EXITS task_types (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `)

    //Tabela de tarefas
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status_task TEXT CHECK(status IN ('todo', 'inprogress', 'done)) NOT NULL DEFAULT 'todo'.
          \`order\` INTEGER NOT NULL DEFAULT 0,
          story_points INTEGER,
          assigned_to INTEGER,
          task_type_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE SET NULL

        )
        `)
}

export default db;
