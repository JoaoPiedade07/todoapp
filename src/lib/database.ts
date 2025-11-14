import Database from "better-sqlite3";
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database.sqlite3');
export const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

//Função para loggin
function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? ' - ' + JSON.stringify(data) : ''}\n`; 

    console.log(logMessage);

    // Log para ficheiro
    const logPath = path.join(process.cwd(), 'database.log');
    fs.appendFileSync(logPath, logMessage);
}

//Criar tabelas se não existirem
export function initDatabase() {
    //Tabela de utilizadores
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          type TEXT CHECK(type IN ('gestor', 'programador')) NOT NULL,
          department TEXT NOT NULL,
          manager_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `)
    
    //Tabela de tipos de tarefas
    db.exec(`
        CREATE TABLE IF NOT EXISTS task_types (
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
          status TEXT CHECK(status IN ('todo', 'inprogress', 'done')) NOT NULL DEFAULT 'todo',
          \`order\` INTEGER NOT NULL DEFAULT 0,
          story_points INTEGER,
          assigned_to TEXT,
          task_type_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE SET NULL
        )
    `)
    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_assigned_status_order
        ON tasks(assigned_to, status, \`order\`)
    `)
    db.exec(`
        assigned_at DATETIME,
        completed_at DATETIME,
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

    getProgrammers: () => {
        const stmt = db.prepare("SELECT * FROM users WHERE type = 'programador' ORDER BY name");
        return stmt.all();
    },

    getManagers: () => {
        const stmt = db.prepare("SELECT * FROM users WHERE type = 'gestor' ORDER BY name");
        return stmt.all();
    },

    getByManagerId: (managerId: string) => {
        const stmt = db.prepare("SELECT * FROM users WHERE manager_id = ? ORDER BY name");
        return stmt.all(managerId);
    },
    
    create: (user: { id: string; username: string; name: string; email: string; password_hash: string; type: 'gestor' | 'programador'; department: string; manager_id?: string }) => {
        const stmt = db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash, type, department, manager_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(user.id, user.username, user.name, user.email, user.password_hash, user.type, user.department, user.manager_id || null);
    },
    
    update: (id: string, user: Partial<{ username: string; name: string; email: string; type: 'gestor' | 'programador'; department: string; manager_id?: string }>) => {
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
            INSERT INTO task_types (id, name, description)
            VALUES (?,?,?)
        `);
        return stmt.run(taskType.id, taskType.name, taskType.description);
    },
    
    update: (id: string, taskType: Partial<{ name: string, description: string}>) => {
        const fields = Object.keys(taskType).map(key => `${key} = ?`).join(', ');
        const values = Object.values(taskType);
        const stmt = db.prepare(`UPDATE task_types SET ${fields} WHERE id = ?`);
        return stmt.run(...values, id);
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
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
            ORDER BY t.\`order\` ASC, t.created_at DESC
        `);
        return stmt.all();
    },

    getById: (id: string) => {
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_user_name, tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
            WHERE t.id = ?
        `);
        return stmt.get(id);
    },

    getByStatus: (status: 'todo' | 'inprogress' | 'done') => {
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_user_name, tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
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
        const resolvedStatus = task.status || 'todo';
        let resolvedOrder = typeof task.order === 'number' ? task.order : 0;

        const assignedAt = task.assignedTo && resolvedStatus === 'inprogress' ? "datetime('now')" : "NULL";
        if(task)

        if (task.assignedTo) {
            const getMaxStmt = db.prepare(`
                SELECT COALESCE(MAX(\`order\`), -1) as maxOrder
                FROM tasks
                WHERE assigned_to = ? AND status = ?
            `);
            const row = getMaxStmt.get(task.assignedTo, resolvedStatus) as { maxOrder: number };
            const nextOrder = (row?.maxOrder ?? -1) + 1;
            if (typeof task.order !== 'number') {
                resolvedOrder = nextOrder;
            }
        }

        const stmt = db.prepare(`
            INSERT INTO tasks (id, title, description, status, \`order\`, story_points, assigned_to, task_type_id)
            VALUES(?,?,?,?,?,?,?,?)
        `);
        return stmt.run(
            task.id,
            task.title,
            task.description || null,
            resolvedStatus,
            resolvedOrder,
            task.storyPoints || null,
            task.assignedTo || null,
            task.taskTypeId || null
        );
    },

    update: (id: string, task: Partial<{
        title: string,
        description: string;
        status: 'todo' | 'inprogress' | 'done';
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
        const stmt = db.prepare(`DELETE FROM tasks WHERE id = ?`);
        return stmt.run(id);
    },

    updateOrder: (tasks: { id: string; order: number; status: 'todo' | 'inprogress' | 'done' }[]) => {
        const getInfoStmt = db.prepare('SELECT assigned_to FROM tasks WHERE id = ?');

        type Item = { id: string; order: number; status: 'todo' | 'inprogress' | 'done'; assigned_to: string | null };
        const withAssignee: Item[] = tasks.map(t => {
            const row = getInfoStmt.get(t.id) as { assigned_to: string | null } | undefined;
            return { ...t, assigned_to: row ? row.assigned_to : null };
        });

        const groups = new Map<string, Item[]>();
        for (const t of withAssignee) {
            const key = `${t.assigned_to ?? 'UNASSIGNED'}::${t.status}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(t);
        }

        const normalized: { id: string; order: number; status: 'todo' | 'inprogress' | 'done' }[] = [];
        groups.forEach((list) => {
            list.sort((a: Item, b: Item) => a.order - b.order);
            list.forEach((t: Item, idx: number) => normalized.push({ id: t.id, order: idx, status: t.status }));
        });

        const stmt = db.prepare('UPDATE tasks SET `order` = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const tx = db.transaction((arr: { id: string; order: number; status: 'todo' | 'inprogress' | 'done' }[]) => {
            for (const t of arr) stmt.run(t.order, t.status, t.id);
        });

        return tx(normalized);
    }
}

export const timeCalculationQueries = {
    getTimeSinceAssignment: (taskId: string) => {
        const stmt = db.prepare(`
            SELECT
                assigned_at,
                completed_at,
                CASE
                    WHEN assinged_at IS NULL THEN 'Nao atribuido'
                    WHEN completed_at IS NOT NULL THEN 
                        'Concluido em ' || ROUND((JULIANDAY(completed_at) - JULIANDAY(assigned_at)) * 24 * 60 * 2) || 'minutos'
                    ELSE
                        'Em andamento há ' || ROUND((JULIANDAY(now) - JULIANDAY(assigned_at)) * 24 * 60 * 2) || 'minutos'
                    END as time_info
                    FROM tasks
                    WHERE id = ?
            `);
            return stmt.get(taskId);
    },


}

export default db;