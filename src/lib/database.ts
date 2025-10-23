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

initDatabase();

// Função para os utilizadores
export const userQueries = {
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
        return stmt.all();
    },
    
    getById: (id: string) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },
    
    create: (user: { id: string; username: string; name: string; type: 'gestor' | 'programador'; department: string }) => {
        const stmt = db.prepare(`
        INSERT INTO users (id, username, name, type, department)
        VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(user.id, user.username, user.name, user.type, user.department);
    },
    
    update: (id: string, user: Partial<{ username: string; name: string; type: 'gestor' | 'programador'; department: string }>) => {
        const fields = Object.keys(user).map(key => `${key} = ?`).join(', ');
        const values = Object.values(user);
        const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
        return stmt.run(...values, id);
    },
    
    delete: (id: string) => {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }
};

// Função para os tipos de tarefas
export const taskTypeQueries = {
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM task_types ORDER BY created_at DESC');
        return stmt.all();
    },

    getById: (id: string) => {
        const stmt = db.prepare('SELECT * FROM task_types WHERE id = ?');
        return stmt.get(id);
    },

    create: (taskType: { id: string, name: string, description: string}) => {
        const stmt = db.prepare(`
            INSERT INTO users (id, name, description)
            VALUES (?,?,?)
            `);
            return stmt.run(taskType.id, taskType.name, taskType.description );
    },
    
    update: (id: string, taskType: Partial<{ name: string, description: string}>) => {
        const fields = Object.keys(taskType).map(key => `${key} = ?`).join(', ');
        const values = Object.values(taskType);
        const stmt = db.prepare(`UPDATE task_types SET ${fields} WHERE id = ?`);
        return stmt.run(...values, id)
    },

    delete: (id: string) => {
        const stmt = db.prepare('DELETE FROM task_types WHERE id = ?');
        return stmt.run(id);
    }
};

// Função para tarefas
export const taskQueries = {
    getAll: () => {
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_user_name, tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type = tt.id
            WHERE t.id = ? 
            `);
            return stmt.all();
    },

    getById: (id: string) => {
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_user_name, tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type = tt.id
            WHERE t.id = ?
            
            `);
            return stmt.all(id);
    },

    getByStatus: (status: 'todo' | 'inprogress' | 'done') => {
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_user_name, tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type = tt.id
            WHERE t.status = ?
            ORDER BY t.\`order\` ASC, t.created_at DESC
            `);
        return stmt.all(status);
    },

    create: (task: {
        id: string,
        title: string, 
        description?: string, 
        status?: 'todo' | 'inprogress' | 'done', 
        order?: number, 
        storyPoints?: number, 
        assignedTo?: string, 
        taskTypeId?: string
    }) => {
        const stmt = db.prepare(`
            INSERT INTO tasks (id, title, description, status, \`order\`, story_points, assigned_to, task_type_id)
            VALUES(?,?,?,?,?,?,?,?)
            `);
            return stmt.run(
                task.id,
                task.title,
                task.description || null,
                task.status || 'todo',
                task.order || 0,
                task.storyPoints || null,
                task.assignedTo || null,
                task.taskTypeId || null
            );
    },

    update: (id: string, task: Partial<{
        title: string,
        description: string;
        status: 'todo' | 'doing' | 'done';
        order: number;
        storyPoints: number;
        assignedTo: string;
        taskTypeId: string;
    }>) => {
        const fields = Object.keys(task).map(key => {
            if (key === 'storyPoints') return 'story_points = ?';
            if (key === 'assignedTo') return 'assigned_to = ?';
            if (key === 'taskTypeId') return 'task_type_id = ?';
            if (key === 'order') return '`order` = ?';
            return `${key} = ?`;
        }).join(', ');

        const values = Object.values(task);
        const stmt = db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
        return stmt.run(...values, id);
    },

    delete: (id: string) => {
        const stmt = db.prepare(`DELETE FROM task WHERE id = ?`)
        return stmt.run(id);
    },

    updateOrder: (tasks: { id: string; order: number; status: 'todo' | 'doing' | 'done' }[]) => {
        const stmt = db.prepare('UPDATE tasks SET `order` = ?, status = ? WHERE id = ?');
        const updateMany = db.transaction((tasks) => {
        for (const task of tasks) {
            stmt.run(task.order, task.status, task.id);
        }
        });
        return updateMany(tasks);
  }

}

export default db;
