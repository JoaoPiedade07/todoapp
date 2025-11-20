import Database from "better-sqlite3";
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database.sqlite3');
export const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Função para logging
function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? ' - ' + JSON.stringify(data) : ''}\n`; 

    console.log(logMessage);

    // Log para ficheiro
    const logPath = path.join(process.cwd(), 'database.log');
    fs.appendFileSync(logPath, logMessage);
}

// Criar tabelas se não existirem
export function initDatabase() {
    // Tabela de utilizadores
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
    `);
    
    // Tabela de tipos de tarefas
    db.exec(`
        CREATE TABLE IF NOT EXISTS task_types (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de tarefas
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
          assigned_at DATETIME,
          created_by TEXT REFERENCES users(id),
          completed_at DATETIME,
          estimated_hours DECIMAL(10,2),
          actual_hours DECIMAL(10,2),
          confidence_level DECIMAL(3,2),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE SET NULL
        )
    `);
    
    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_assigned_status_order
        ON tasks(assigned_to, status, \`order\`)
    `);
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
        taskTypeId?: string,
        createdBy: string
    }) => {
        console.log('📥 Dados recebidos na database create:', task);

        let finalAssignedTo = task.assignedTo;
        if(!finalAssignedTo) {
            console.log('🔄 Auto-atribuindo tarefa ao criador:', task.createdBy);
            finalAssignedTo = task.createdBy;
        }

        let estimatedHours = null;
        let confidenceLevel = null;

        if (task.storyPoints && task.storyPoints > 0) {
            const prediction = predictionQueries.predictTaskTime(
                task.storyPoints, 
                task.assignedTo, 
                task.taskTypeId
            );
            estimatedHours = prediction.estimated_hours;
            confidenceLevel = prediction.confidence_level;
        }

        const resolvedStatus = task.status || 'todo';
        let resolvedOrder = typeof task.order === 'number' ? task.order : 0;

        const shouldSetAssignedAt = task.assignedTo && resolvedStatus === 'inprogress';

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
            INSERT INTO tasks (id, title, description, status, \`order\`, story_points, assigned_to, task_type_id, created_by, assigned_at, estimated_hours, confidence_level)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
        `);
        
        const result = stmt.run(
            task.id,
            task.title,
            task.description || null,
            resolvedStatus,
            resolvedOrder,
            task.storyPoints || null,
            task.assignedTo || null,
            task.taskTypeId || null,
            task.createdBy,
            shouldSetAssignedAt ? new Date().toISOString() : null,
            estimatedHours,
            confidenceLevel
        );

        console.log('Task criada. Criador:', task.createdBy, 'Responsável:', finalAssignedTo);

        console.log('✅ Task criada com sucesso no banco de dados');
        return result;
    },

    updateStatus: (id: string, status: 'todo' | 'inprogress' | 'done', assignedTo?: string) => {
        let query = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP`;
        const params: any[] = [status];

        if(status === 'inprogress' && assignedTo) {
            query += `, assigned_to = ?, assigned_at = datetime('now')`;
            params.push(assignedTo);
        }
        else if(status === 'done') {
            query += `, completed_at = datetime('now')`;
        }
        else if(status === 'todo') {
            query += `, assigned_at = NULL, completed_at = NULL`;
        }

        query += ` WHERE id = ?`;
        params.push(id);

        const stmt = db.prepare(query);
        return stmt.run(...params);
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
        const currentTask = taskQueries.getById(id) as any;

        let additionalUpdates = '';
        const params: any[] = [];

        const fields = Object.keys(task).map(key => {
            if (key === 'status' && task.status) {
                if(task.status === 'inprogress' && task.assignedTo && !currentTask.assigned_at ) {
                    additionalUpdates += `, assigned_at = datetime('now')`;
                }
                else if(task.status === 'done' && !currentTask.completed_at ) {
                    additionalUpdates += `, completed_at = datetime('now')`;
                }
                else if(task.status === 'todo' ) {
                    additionalUpdates += `, assigned_at = NULL, completed_at = NULL`;
                }
            }

            if (key === 'assignedTo' && task.assignedTo && task.status === 'inprogress' && !currentTask.assigned_at) {
                additionalUpdates += `, assigned_at = datetime('now')`;
            }

            if (key === 'storyPoints') return 'story_points = ?';
            if (key === 'assignedTo') return 'assigned_to = ?';
            if (key === 'taskTypeId') return 'task_type_id = ?';
            if (key === 'order') return '`order` = ?';
            return `${key} = ?`;
        }).join(', ');

        const values = Object.values(task);
        const stmt = db.prepare(`UPDATE tasks SET ${fields}${additionalUpdates}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
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
};

export const timeCalculationQueries = {
    getTimeSinceAssignment: (taskId: string) => {
        const stmt = db.prepare(`
            SELECT
                assigned_at,
                completed_at,
                CASE
                    WHEN assigned_at IS NULL THEN 'Nao atribuido'
                    WHEN completed_at IS NOT NULL THEN 
                        'Concluido em ' || ROUND((JULIANDAY(completed_at) - JULIANDAY(assigned_at)) * 24 * 60) || ' minutos'
                    ELSE
                        'Em andamento há ' || ROUND((JULIANDAY(datetime('now')) - JULIANDAY(assigned_at)) * 24 * 60) || ' minutos'
                END as time_info
            FROM tasks
            WHERE id = ?
        `);
        return stmt.get(taskId);
    },
};

// Funções auxiliares para predictionQueries
const calculateComplexityFactor = (storyPoints: number): number => {
    if (storyPoints <= 2) return 0.8;
    if (storyPoints <= 5) return 1.0;
    if (storyPoints <= 8) return 1.3;
    return 1.6;
};

const calculateConfidenceLevel = (sampleSize: number, stdDev: number, avgHours: number): number => {
    let confidence = 0.5;
    
    if (sampleSize >= 20) confidence += 0.3;
    else if (sampleSize >= 10) confidence += 0.2;
    else if (sampleSize >= 5) confidence += 0.1;
    
    const coefficientOfVariation = stdDev / avgHours;
    if (coefficientOfVariation < 0.3) confidence += 0.2;
    else if (coefficientOfVariation < 0.6) confidence += 0.1;
    else confidence -= 0.1;
    
    return Math.min(Math.max(confidence, 0.1), 0.95);
};

const generatePredictionMessage = (confidence: number, sampleSize: number): string => {
    if (confidence >= 0.8) return 'Previsão de alta confiança';
    if (confidence >= 0.6) return 'Previsão com boa confiança';
    if (confidence >= 0.4) return 'Previsão com confiança moderada';
    return 'Previsão com baixa confiança - use com cautela';
};

const calculateSprintDays = (totalHours: number): number => {
    const hoursPerDay = 6;
    const sprintDays = Math.ceil(totalHours / hoursPerDay);
    return Math.max(sprintDays, 1);
};

export const predictionQueries = {
    calculateTeamVelocity: (userId?: string, weeks: number = 8) => {
        let query = `
            SELECT 
                ${userId ? 'u.id as user_id, u.name as user_name,' : ''}
                COUNT(t.id) as completed_tasks,
                SUM(t.story_points) as total_story_points,
                ROUND(SUM(t.story_points) * 1.0 / ?, 2) as velocity_per_week,
                ROUND(AVG((JULIANDAY(t.completed_at) - JULIANDAY(t.assigned_at)) * 24), 2) as avg_hours_per_task,
                ROUND(AVG(t.story_points), 2) as avg_story_points
            FROM tasks t
            ${userId ? 'JOIN users u ON t.assigned_to = u.id' : ''}
            WHERE t.completed_at IS NOT NULL
            AND t.assigned_at IS NOT NULL
            AND t.story_points IS NOT NULL
            AND t.story_points > 0
            AND t.completed_at >= datetime('now', '-' || ? || ' days')
        `;

        const params: any[] = [weeks, weeks * 7];

        if(userId) {
            query += ` AND t.assigned_to = ? GROUP BY u.id, u.name`;
            params.push(userId);
        } else {
            query += ' GROUP BY 1';
        }

        const stmt = db.prepare(query);
        return userId ? stmt.get(...params) : stmt.all(...params);
    }, 

    calculatePointsToHoursRatio: (userId?: string) => {
        let query = `
            SELECT 
                ${userId ? 'u.id as user_id, u.name as user_name,' : ''}
                COUNT(t.id) as sample_size,
                ROUND(AVG(t.story_points), 2) as avg_story_points,
                ROUND(AVG((JULIANDAY(t.completed_at) - JULIANDAY(t.assigned_at)) * 24), 2) as avg_hours,
                ROUND(AVG((JULIANDAY(t.completed_at) - JULIANDAY(t.assigned_at)) * 24) / AVG(t.story_points), 2) as hours_per_point
            FROM tasks t
            ${userId ? 'JOIN users u ON t.assigned_to = u.id' : ''}
            WHERE t.completed_at IS NOT NULL 
            AND t.assigned_at IS NOT NULL
            AND t.story_points IS NOT NULL
            AND t.story_points > 0
            AND (JULIANDAY(t.completed_at) - JULIANDAY(t.assigned_at)) > 0
        `;
        
        if (userId) {
            query += ' AND t.assigned_to = ? GROUP BY u.id, u.name';
            const stmt = db.prepare(query);
            return stmt.get(userId);
        } else {
            query += ' GROUP BY 1';
            const stmt = db.prepare(query);
            return stmt.all();
        }
    },

    predictTaskTime: (storyPoints: number, userId?: string, taskTypeId?: string) => {
        // Primeiro, buscar a média e outros dados básicos
        let baseQuery = `
            SELECT 
                ROUND(AVG((JULIANDAY(completed_at) - JULIANDAY(assigned_at)) * 24), 2) as avg_hours,
                ROUND(AVG(story_points), 2) as avg_points,
                COUNT(*) as sample_size
            FROM tasks 
            WHERE completed_at IS NOT NULL 
            AND assigned_at IS NOT NULL
            AND story_points IS NOT NULL
            AND story_points > 0
        `;
        
        const params: any[] = [];

        if(userId) {
            baseQuery += ' AND assigned_to = ?';
            params.push(userId);
        }

        if (taskTypeId) {
            baseQuery += ' AND task_type_id = ?';
            params.push(taskTypeId);
        }

        const stmt = db.prepare(baseQuery);
        const basicData = stmt.get(...params) as {
            avg_hours: number;
            avg_points: number;
            sample_size: number;
        } | undefined;

        if (!basicData || basicData.sample_size < 3) {
            const defaultHoursPerPoint = 4;
            return {
                estimated_hours: storyPoints * defaultHoursPerPoint,
                confidence_level: 0.3,
                message: 'Estimativa baseada em padrão da indústria (dados insuficientes)'
            };
        }

        // Calcular desvio padrão manualmente (SQLite não tem STDEV)
        let stdDevQuery = `
            SELECT 
                ROUND(SQRT(AVG(POWER((JULIANDAY(completed_at) - JULIANDAY(assigned_at)) * 24 - ?, 2))), 2) as std_dev_hours
            FROM tasks 
            WHERE completed_at IS NOT NULL 
            AND assigned_at IS NOT NULL
            AND story_points IS NOT NULL
            AND story_points > 0
        `;
        
        const stdDevParams: any[] = [basicData.avg_hours];

        if(userId) {
            stdDevQuery += ' AND assigned_to = ?';
            stdDevParams.push(userId);
        }

        if (taskTypeId) {
            stdDevQuery += ' AND task_type_id = ?';
            stdDevParams.push(taskTypeId);
        }

        const stdDevStmt = db.prepare(stdDevQuery);
        const stdDevResult = stdDevStmt.get(...stdDevParams) as {
            std_dev_hours: number;
        } | undefined;

        const historicalData = {
            ...basicData,
            std_dev_hours: stdDevResult?.std_dev_hours || 0
        };

        const hourPerPoint = historicalData.avg_hours / historicalData.avg_points;
        let estimatedHours = storyPoints * hourPerPoint;
        const complexityFactor = calculateComplexityFactor(storyPoints);
        estimatedHours *= complexityFactor;
        
        const confidence = calculateConfidenceLevel(
            historicalData.sample_size, 
            historicalData.std_dev_hours, 
            historicalData.avg_hours
        );
        
        const marginOfError = historicalData.std_dev_hours * (2 / Math.sqrt(historicalData.sample_size));

        return {
            estimated_hours: Math.round(estimatedHours * 100) / 100,
            confidence_level: Math.round(confidence * 100) / 100,
            min_hours: Math.round((estimatedHours - marginOfError) * 100) / 100,
            max_hours: Math.round((estimatedHours + marginOfError) * 100) / 100,
            hours_per_point: Math.round(hourPerPoint * 100) / 100,
            sample_size: historicalData.sample_size,
            message: generatePredictionMessage(confidence, historicalData.sample_size)
        };
    },

    predictMultipleTasks: (tasks: Array<{storyPoints: number, userId?: string, taskTypeId?: string}>) => {
        const predictions = tasks.map(task => 
            predictionQueries.predictTaskTime(task.storyPoints, task.userId, task.taskTypeId)
        );

        const totalEstimated = predictions.reduce((sum, pred) => sum + pred.estimated_hours, 0);
        const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence_level, 0) / predictions.length;
        
        return {
            total_estimated_hours: Math.round(totalEstimated * 100) / 100,
            average_confidence: Math.round(avgConfidence * 100) / 100,
            task_count: tasks.length,
            total_story_points: tasks.reduce((sum, task) => sum + task.storyPoints, 0),
            predictions: predictions,
            suggested_sprint_days: calculateSprintDays(totalEstimated)
        };
    },

    updatePredictionModel: (taskId: string) => {
        const taskStmt = db.prepare(`
            SELECT 
                story_points,
                assigned_to,
                task_type_id,
                (JULIANDAY(completed_at) - JULIANDAY(assigned_at)) * 24 as actual_hours
            FROM tasks 
            WHERE id = ? AND completed_at IS NOT NULL AND assigned_at IS NOT NULL
        `);
        
        const task = taskStmt.get(taskId) as {
            story_points: number;
            assigned_to: string;
            task_type_id: string;
            actual_hours: number;
        };

        if (!task) return null;

        const updateStmt = db.prepare(`
            UPDATE tasks SET actual_hours = ? WHERE id = ?
        `);
        updateStmt.run(task.actual_hours, taskId);

        return {
            task_id: taskId,
            story_points: task.story_points,
            actual_hours: Math.round(task.actual_hours * 100) / 100,
            efficiency: task.story_points > 0 ? Math.round((task.story_points / task.actual_hours) * 100) / 100 : 0
        };
    },

    analyzePredictionAccuracy: (userId?: string) => {
        let query = `
            SELECT 
                COUNT(*) as total_tasks,
                AVG(estimated_hours) as avg_estimated,
                AVG(actual_hours) as avg_actual,
                ROUND(AVG(ABS(actual_hours - estimated_hours)), 2) as avg_absolute_error,
                ROUND(AVG(ABS(actual_hours - estimated_hours) / actual_hours * 100), 2) as avg_percentage_error
            FROM tasks
            WHERE completed_at IS NOT NULL 
            AND estimated_hours IS NOT NULL 
            AND actual_hours IS NOT NULL
            AND actual_hours > 0
        `;

        const params: any[] = [];
        
        if (userId) {
            query += ' AND assigned_to = ?';
            params.push(userId);
        }

        const stmt = db.prepare(query);
        return stmt.get(...params);
    }
};

export default db;