import { Pool, QueryResult } from 'pg';
import path from 'path';
import fs from 'fs';

if (!process.env.DATABASE_URL) {
  console.error('\nERROR: DATABASE_URL environment variable is not set!');
  console.error('\nTo fix this:');
  console.error('1. Create a .env file in the project root');
  console.error('2. Add: DATABASE_URL=postgresql://user:password@host:5432/database');
  console.error('3. For a free database, go to https://supabase.com');
  console.error('\nSee QUICK_START.md for detailed instructions\n');
  process.exit(1);
}

// Helper para parsear DATABASE_URL e extrair componentes
function parseDatabaseUrl(url: string): { host?: string; port?: number; database?: string; user?: string; password?: string; ssl?: any } | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Remover colchetes se IPv6 estiver entre colchetes
    let cleanHostname = hostname;
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      cleanHostname = hostname.slice(1, -1);
      console.error('⚠️ AVISO: DATABASE_URL contém endereço IPv6 entre colchetes!');
      console.error('⚠️ Use o hostname DNS do Supabase em vez de endereço IP.');
      console.error('⚠️ Exemplo correto: postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres');
      console.error('⚠️ No Supabase Dashboard → Settings → Database → Connection String, use "URI" ou "Session mode"');
      console.error('⚠️ Tentando usar hostname DNS do Supabase...');
    }
    
    // Verificar se ainda é IPv6 (sem colchetes)
    const isIPv6 = cleanHostname.includes(':') && cleanHostname.split(':').length > 2 && !cleanHostname.includes('.');
    if (isIPv6) {
      console.error('⚠️ ERRO: Hostname ainda é IPv6 após remover colchetes!');
      console.error('⚠️ Por favor, atualize DATABASE_URL no Railway para usar hostname DNS do Supabase.');
      throw new Error('DATABASE_URL contém endereço IPv6. Use o hostname DNS do Supabase (ex: db.xxx.supabase.co)');
    }
    
    // O pooler do Supabase sempre requer SSL
    const requiresSSL = cleanHostname.includes('pooler.supabase.com') || 
                        cleanHostname.includes('.supabase.co') ||
                        process.env.NODE_ENV === 'production';
    
    return {
      host: cleanHostname,
      port: parseInt(urlObj.port || '5432', 10),
      database: urlObj.pathname.slice(1), // Remove leading /
      user: urlObj.username,
      password: urlObj.password, // URL já decodifica %40 para @ automaticamente
      ssl: requiresSSL ? { rejectUnauthorized: false } : false,
    };
  } catch (e) {
    return null;
  }
}

// Parsear DATABASE_URL
const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL || '');

// Log de debug (sem mostrar senha completa)
if (process.env.DATABASE_URL) {
  const urlForLog = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log('🔍 DATABASE_URL configurada:', urlForLog);
  if (dbConfig) {
    console.log('✅ Parse da URL bem-sucedido:');
    console.log('   Host:', dbConfig.host);
    console.log('   Port:', dbConfig.port);
    console.log('   Database:', dbConfig.database);
    console.log('   User:', dbConfig.user);
    console.log('   Password length:', dbConfig.password ? dbConfig.password.length : 0);
    console.log('   Password starts with:', dbConfig.password ? dbConfig.password.substring(0, 3) + '...' : 'N/A');
    console.log('   SSL:', dbConfig.ssl ? 'habilitado' : 'desabilitado');
  } else {
    console.log('⚠️ Não foi possível fazer parse da URL, usando connectionString diretamente');
  }
} else {
  console.error('❌ DATABASE_URL não está configurada!');
}

// Inicializa PostgreSQL
// Se conseguirmos parsear, usar configuração explícita (melhor para IPv4)
// Caso contrário, usar connectionString (fallback)
const pool = dbConfig 
  ? new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl,
      // Forçar IPv4 através da família de endereços
      // O Node.js dns.lookup usa IPv4 por padrão quando especificamos um hostname DNS
    })
  : new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: (process.env.DATABASE_URL?.includes('pooler.supabase.com') || 
            process.env.DATABASE_URL?.includes('.supabase.co') ||
            process.env.NODE_ENV === 'production') 
            ? { rejectUnauthorized: false } 
            : false,
    });

//Erros
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper function to execute queries and return all rows
export async function query(text: string, params?: any[]): Promise<any[]> {
  const result: QueryResult = await pool.query(text, params);
  return result.rows;
}

// Helper function for single row queries
export async function queryOne(text: string, params?: any[]): Promise<any> {
  const result: QueryResult = await pool.query(text, params);
  return result.rows[0];
}

// Helper function for execute (no return, for INSERT/UPDATE/DELETE)
export async function execute(text: string, params?: any[]): Promise<QueryResult> {
  try {
    const result = await pool.query(text, params);
    
    // Log para debug (mostrar operação e linhas afetadas)
    if (process.env.NODE_ENV === 'development') {
      const operation = text.trim().substring(0, 20).toUpperCase();
      const queryPreview = text.trim().substring(0, 100);
      console.log(`[DB] ${operation}... - Linhas afetadas: ${result.rowCount || 0}`);
      
      // Se nenhuma linha foi afetada em UPDATE/DELETE, pode indicar problema
      if ((text.trim().toUpperCase().startsWith('UPDATE') || 
           text.trim().toUpperCase().startsWith('DELETE')) && 
          result.rowCount === 0) {
        console.warn(`[DB] ⚠️ ATENÇÃO: Nenhuma linha foi afetada pela query:`, queryPreview);
      }
    }
    
    return result;
  } catch (error: any) {
    // Log detalhado de erros
    console.error('[DB] ❌ ERRO ao executar query:');
    console.error('[DB] Query:', text.substring(0, 200));
    console.error('[DB] Params:', params);
    console.error('[DB] Erro:', error.message);
    console.error('[DB] Código:', error.code);
    throw error; // Re-throw para que o caller possa tratar
  }
}

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
export async function initDatabase() {
    try {
        // Test connection first
        await pool.query('SELECT NOW()');
        console.log('Connected to PostgreSQL database');
    } catch (error: any) {
        console.error('\nFailed to connect to PostgreSQL database!');
        console.error('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\nThis usually means:');
            console.error('   - PostgreSQL is not running (if using local database)');
            console.error('   - DATABASE_URL is incorrect');
            console.error('   - Database server is not accessible\n');
            console.error('See QUICK_START.md for setup instructions\n');
        }
        throw error;
    }
    
    try {
        // Tabela de utilizadores
        await execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          type VARCHAR(50) CHECK(type IN ('gestor', 'programador')) NOT NULL,
          department VARCHAR(255) NOT NULL,
          manager_id VARCHAR(255),
          experience_level VARCHAR(50) DEFAULT 'junior',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    // Add experience_level column if it doesn't exist
    try {
        await execute(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'experience_level'
                ) THEN
                    ALTER TABLE users ADD COLUMN experience_level VARCHAR(50) DEFAULT 'junior';
                END IF;
            END $$;
        `);
        console.log('Coluna experience_level verificada');
    } catch (error: any) {
        console.log('Coluna experience_level já existe ou erro:', error.message);
    }
    
    // Tabela de tipos de tarefas
    await execute(`
        CREATE TABLE IF NOT EXISTS task_types (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de tarefas
    await execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) CHECK(status IN ('todo', 'inprogress', 'done')) NOT NULL DEFAULT 'todo',
          "order" INTEGER NOT NULL DEFAULT 0,
          story_points INTEGER,
          assigned_to VARCHAR(255),
          task_type_id VARCHAR(255),
          assigned_at TIMESTAMP,
          created_by VARCHAR(255) REFERENCES users(id),
          completed_at TIMESTAMP,
          estimated_hours DECIMAL(10,2),
          actual_hours DECIMAL(10,2),
          confidence_level DECIMAL(3,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE SET NULL
        )
    `);
    
    await execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_assigned_status_order
        ON tasks(assigned_to, status, "order")
    `);
    
        console.log('Database schema initialized successfully');
    } catch (error: any) {
        console.error('Error initializing database schema:', error.message);
        throw error;
    }
}

// Initialize database on module load (but make it async-safe)
let initPromise: Promise<void> | null = null;
export function ensureDatabaseInitialized(): Promise<void> {
    if (!initPromise) {
        initPromise = initDatabase();
    }
    return initPromise;
}

// Função para os utilizadores
export const userQueries = {
    getAll: async () => {
        return await query('SELECT * FROM users ORDER BY created_at DESC');
    },
    
    getById: async (id: string) => {
        return await queryOne('SELECT * FROM users WHERE id = $1', [id]);
    },

    getProgrammers: async () => {
        return await query("SELECT * FROM users WHERE type = 'programador' ORDER BY name");
    },

    getManagers: async () => {
        return await query("SELECT * FROM users WHERE type = 'gestor' ORDER BY name");
    },

    getByManagerId: async (managerId: string) => {
        return await query("SELECT * FROM users WHERE manager_id = $1 ORDER BY name", [managerId]);
    },
    
    create: async (user: {
        id: string;
        username: string;
        name: string;
        email: string;
        password_hash: string;
        type: string;
        department: string;
        manager_id?: string;
        experience_level?: string;
    }) => {
        const result = await execute(`
            INSERT INTO users (id, username, name, email, password_hash, type, department, manager_id, experience_level)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            user.id,
            user.username,
            user.name,
            user.email,
            user.password_hash,
            user.type,
            user.department,
            user.manager_id || null,
            user.experience_level || 'junior'
        ]);
        
        if (result.rowCount !== 1) {
            console.error(`⚠️ ATENÇÃO: INSERT retornou rowCount=${result.rowCount} (esperado: 1) para user ${user.id}`);
        } else {
            console.log(`✅ Utilizador criado: ${user.username} (ID: ${user.id})`);
        }
    },
    
    update: async (id: string, user: Partial<{
        username: string;
        name: string;
        email: string;
        type: string;
        department: string;
        manager_id: string;
        experience_level: string;
    }>) => {
        const fields = Object.keys(user).map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = Object.values(user);
        const result = await execute(
            `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
            [...values, id]
        );
        
        if (result.rowCount === 0) {
            console.warn(`⚠️ ATENÇÃO: UPDATE não afetou nenhuma linha para user ${id} - pode não existir`);
        } else {
            console.log(`✅ Utilizador atualizado: ${id} (${result.rowCount} linha(s) afetada(s))`);
        }
    },
    
    delete: async (id: string) => {
        await execute('DELETE FROM users WHERE id = $1', [id]);
    }
};

// Função para os tipos de tarefas
export const taskTypeQueries = {
    getAll: async () => {
        return await query('SELECT * FROM task_types ORDER BY created_at DESC');
    },

    getById: async (id: string) => {
        return await queryOne('SELECT * FROM task_types WHERE id = $1', [id]);
    },

    create: async (taskType: { id: string, name: string, description: string}) => {
        const result = await execute(`
            INSERT INTO task_types (id, name, description)
            VALUES ($1, $2, $3)
        `, [taskType.id, taskType.name, taskType.description]);
        
        if (result.rowCount !== 1) {
            console.error(`⚠️ ATENÇÃO: INSERT retornou rowCount=${result.rowCount} (esperado: 1) para task_type ${taskType.id}`);
        } else {
            console.log(`✅ Tipo de tarefa criado: ${taskType.name} (ID: ${taskType.id})`);
        }
    },
    
    update: async (id: string, taskType: Partial<{ name: string, description: string}>) => {
        const fields = Object.keys(taskType).map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = Object.values(taskType);
        await execute(
            `UPDATE task_types SET ${fields} WHERE id = $${values.length + 1}`,
            [...values, id]
        );
    },

    delete: async (id: string) => {
        await execute('DELETE FROM task_types WHERE id = $1', [id]);
    }
};

// Função para tarefas
export const taskQueries = {
    getAll: async () => {
        return await query(`
            SELECT 
                t.id, t.title, t.description, t.status, t."order", 
                t.story_points, t.assigned_to, t.task_type_id, t.created_by,
                t.assigned_at, t.completed_at, t.created_at, t.updated_at,
                t.estimated_hours, t.actual_hours, t.confidence_level,
                u.name as assigned_user_name,
                tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
            ORDER BY t."order" ASC, t.created_at DESC
        `);
    },

    getDoingTasksCount: async (assignedTo: string): Promise<number> => {
        const result = await queryOne(`
          SELECT COUNT(*)::int as count 
          FROM tasks 
          WHERE assigned_to = $1 AND status = 'inprogress'
        `, [assignedTo]);
        return result?.count || 0;
    },

    canAssignToDoing: async (assignedTo: string): Promise<boolean> => {
        const doingCount = await taskQueries.getDoingTasksCount(assignedTo);
        return doingCount < 2; // Máximo 2 tarefas em Doing
    },

    getById: async (id: string) => {
        return await queryOne(`
            SELECT 
                t.id, t.title, t.description, t.status, t."order", 
                t.story_points, t.assigned_to, t.task_type_id, t.created_by,
                t.assigned_at, t.completed_at, t.created_at, t.updated_at,
                t.estimated_hours, t.actual_hours, t.confidence_level,
                u.name as assigned_user_name,
                tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
            WHERE t.id = $1
        `, [id]);
    },

    getByStatus: async (status: 'todo' | 'inprogress' | 'done') => {
        return await query(`
            SELECT 
                t.id, t.title, t.description, t.status, t."order", 
                t.story_points, t.assigned_to, t.task_type_id, t.created_by,
                t.assigned_at, t.completed_at, t.created_at, t.updated_at,
                t.estimated_hours, t.actual_hours, t.confidence_level,
                u.name as assigned_user_name,
                tt.name as task_type_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
            WHERE t.status = $1
            ORDER BY t."order" ASC, t.created_at DESC
        `, [status]);
    },

    create: async (task: {
        id: string;
        title: string;
        description?: string;
        status?: 'todo' | 'inprogress' | 'done';
        order?: number;
        storyPoints?: number;
        assignedTo?: string;
        taskTypeId?: string;
        createdBy: string;
    }) => {
        console.log('Dados recebidos na database create:', task);

        if (task.status === 'inprogress' && task.assignedTo) {
            const canAssign = await taskQueries.canAssignToDoing(task.assignedTo);
            if (!canAssign) {
                throw new Error('O programador já tem o máximo de 2 tarefas em progresso');
            }
        }

        let finalAssignedTo = task.assignedTo;
        if(!finalAssignedTo) {
            console.log('Auto-atribuindo tarefa ao criador:', task.createdBy);
            finalAssignedTo = task.createdBy;
        }

        let estimatedHours = null;
        let confidenceLevel = null;

        if (task.storyPoints && task.storyPoints > 0) {
            const prediction = await predictionQueries.predictTaskTime(
                task.storyPoints, 
                task.assignedTo, 
                task.taskTypeId
            );
            estimatedHours = prediction.estimated_hours;
            confidenceLevel = prediction.confidence_level;
        }

        const resolvedStatus = task.status || 'todo';
        let resolvedOrder = 0;

        const shouldSetAssignedAt = task.assignedTo && resolvedStatus === 'inprogress';

        // Sempre calcular o próximo order disponível para evitar conflitos com a constraint única
        if (finalAssignedTo) {
            const row = await queryOne(`
                SELECT COALESCE(MAX("order"), -1)::int as "maxOrder"
                FROM tasks
                WHERE assigned_to = $1 AND status = $2
            `, [finalAssignedTo, resolvedStatus]);
            const maxOrder = row?.maxOrder ?? -1;
            resolvedOrder = maxOrder + 1;
            
            // Se um order foi fornecido explicitamente, verificar se já existe
            // Se existir, usar o próximo disponível em vez do fornecido
            if (typeof task.order === 'number' && task.order >= 0) {
                const existingOrder = await queryOne(`
                    SELECT id FROM tasks
                    WHERE assigned_to = $1 AND status = $2 AND "order" = $3
                `, [finalAssignedTo, resolvedStatus, task.order]);
                
                if (existingOrder) {
                    // Order já existe, usar o próximo disponível
                    console.log(`⚠️ Order ${task.order} já existe para assigned_to=${finalAssignedTo}, status=${resolvedStatus}. Usando próximo disponível: ${resolvedOrder}`);
                } else if (task.order <= maxOrder) {
                    // Order fornecido é menor ou igual ao máximo, usar o próximo disponível
                    console.log(`⚠️ Order ${task.order} pode causar conflito. Usando próximo disponível: ${resolvedOrder}`);
                } else {
                    // Order fornecido é maior que o máximo, pode usar
                    resolvedOrder = task.order;
                }
            }
        } else {
            // Se não há assigned_to, usar order 0 ou o fornecido
            resolvedOrder = typeof task.order === 'number' ? task.order : 0;
        }

        const insertResult = await execute(`
            INSERT INTO tasks (id, title, description, status, "order", story_points, assigned_to, task_type_id, created_by, assigned_at, estimated_hours, confidence_level)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
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
        ]);

        // Verificar se a inserção foi bem-sucedida
        if (insertResult.rowCount !== 1) {
            console.error(`⚠️ ATENÇÃO: INSERT retornou rowCount=${insertResult.rowCount} (esperado: 1) para task ${task.id}`);
        }

        console.log('✅ Task criada. ID:', task.id, 'Criador:', task.createdBy, 'Responsável:', finalAssignedTo);
        console.log(`✅ Task persistida na base de dados (rowCount: ${insertResult.rowCount})`);
    },

    validateExecutionOrder: async (taskId: string, newStatus: 'todo' | 'inprogress' | 'done'): Promise<boolean> => {
        // Só aplicar validação de ordem quando mover para "inprogress"
        if (newStatus === 'inprogress') {
            const task = await taskQueries.getById(taskId) as any;
            if (!task) return true;
      
            const result = await queryOne(`
                SELECT COUNT(*)::int as count 
                FROM tasks 
                WHERE status = 'todo' 
                AND "order" < (SELECT "order" FROM tasks WHERE id = $1)
                AND assigned_to = $2
            `, [taskId, task.assigned_to]);
            
            if (result?.count > 0) {
                throw new Error('Existem tarefas com ordem superior que precisam ser concluídas primeiro');
            }
        }
            
        return true;
    },

    getCompletedTasksByProgrammer: async (programmerId: string) => {
        return await query(`
          SELECT 
              t.id, t.title, t.description, t.status, t."order", 
              t.story_points, t.assigned_to, t.task_type_id, t.created_by,
              t.assigned_at, t.completed_at, t.created_at, t.updated_at,
              t.estimated_hours, t.actual_hours, t.confidence_level,
              u.name as assigned_user_name,
              tt.name as task_type_name
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN task_types tt ON t.task_type_id = tt.id
          WHERE t.assigned_to = $1 AND t.status = 'done'
          ORDER BY t.completed_at DESC
        `, [programmerId]);
    },

    // Lista de tarefas concluídas do gestor (todos os programadores que ele gerencia)
    getCompletedTasksByManager: async (managerId: string) => {
        return await query(`
          SELECT 
              t.id, t.title, t.description, t.status, t."order", 
              t.story_points, t.assigned_to, t.task_type_id, t.created_by,
              t.assigned_at, t.completed_at, t.created_at, t.updated_at,
              t.estimated_hours, t.actual_hours, t.confidence_level,
              u.name as assigned_user_name, u.id as assigned_user_id,
              tt.name as task_type_name
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN task_types tt ON t.task_type_id = tt.id
          WHERE t.status = 'done'
          AND u.manager_id = $1
          ORDER BY t.completed_at DESC, u.name ASC
        `, [managerId]);
    },

    // Lista de tarefas em curso ordenadas
    getInProgressTasksOrdered: async (managerId?: string) => {
        if (managerId) {
            // Tarefas em curso dos programadores do gestor, ordenadas
            return await query(`
              SELECT 
                  t.id, t.title, t.description, t.status, t."order", 
                  t.story_points, t.assigned_to, t.task_type_id, t.created_by,
                  t.assigned_at, t.completed_at, t.created_at, t.updated_at,
                  t.estimated_hours, t.actual_hours, t.confidence_level,
                  u.name as assigned_user_name, u.id as assigned_user_id,
                  tt.name as task_type_name
              FROM tasks t
              LEFT JOIN users u ON t.assigned_to = u.id
              LEFT JOIN task_types tt ON t.task_type_id = tt.id
              WHERE t.status = 'inprogress'
              AND u.manager_id = $1
              ORDER BY u.name ASC, t."order" ASC, t.assigned_at ASC
            `, [managerId]);
        } else {
            // Todas as tarefas em curso ordenadas
            return await query(`
              SELECT 
                  t.id, t.title, t.description, t.status, t."order", 
                  t.story_points, t.assigned_to, t.task_type_id, t.created_by,
                  t.assigned_at, t.completed_at, t.created_at, t.updated_at,
                  t.estimated_hours, t.actual_hours, t.confidence_level,
                  u.name as assigned_user_name, u.id as assigned_user_id,
                  tt.name as task_type_name
              FROM tasks t
              LEFT JOIN users u ON t.assigned_to = u.id
              LEFT JOIN task_types tt ON t.task_type_id = tt.id
              WHERE t.status = 'inprogress'
              ORDER BY u.name ASC, t."order" ASC, t.assigned_at ASC
            `);
        }
    },
  
    getProgrammerStats: async (programmerId: string) => {
        return await queryOne(`
          SELECT 
            COUNT(*)::int as total_tasks,
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)::int as completed_tasks,
            SUM(CASE WHEN status = 'inprogress' THEN 1 ELSE 0 END)::int as doing_tasks,
            SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END)::int as todo_tasks,
            ROUND(AVG(story_points)::numeric, 2) as avg_story_points,
            ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as avg_completion_hours
          FROM tasks 
          WHERE assigned_to = $1
        `, [programmerId]);
    },

    updateStatus: async (id: string, status: 'todo' | 'inprogress' | 'done', assignedTo?: string) => {
        await taskQueries.validateExecutionOrder(id, status);
    
        if (status === 'inprogress' && assignedTo) {
            const canAssign = await taskQueries.canAssignToDoing(assignedTo);
            if (!canAssign) {
                throw new Error('O programador já tem o máximo de 2 tarefas em progresso');
            }
        }
    
        let queryText = `UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP`;
        const params: any[] = [status];
        let paramIndex = 2;
    
        if(status === 'inprogress' && assignedTo) {
            queryText += `, assigned_to = $${paramIndex}, assigned_at = NOW()`;
            params.push(assignedTo);
            paramIndex++;
        }
        else if(status === 'done') {
            queryText += `, completed_at = NOW()`;
        }
        else if(status === 'todo') {
            queryText += `, assigned_at = NULL, completed_at = NULL`;
        }
    
        queryText += ` WHERE id = $${paramIndex}`;
        params.push(id);
    
        await execute(queryText, params);
    },

    update: async (id: string, task: Partial<{
        title: string,
        description: string;
        status: 'todo' | 'inprogress' | 'done';
        order: number;
        storyPoints: number;
        assignedTo: string;
        taskTypeId: string;
    }>) => {
        const currentTask = await taskQueries.getById(id) as any;

        let additionalUpdates = '';
        const params: any[] = [];
        let paramIndex = 1;

        // Normalizar valores null e strings vazias para foreign keys
        const normalizedTask: any = { ...task };
        if (normalizedTask.assignedTo === '' || normalizedTask.assignedTo === undefined) {
            normalizedTask.assignedTo = null;
        }
        if (normalizedTask.taskTypeId === '' || normalizedTask.taskTypeId === undefined) {
            normalizedTask.taskTypeId = null;
        }
        if (normalizedTask.description === '') {
            normalizedTask.description = null;
        }

        const fields = Object.keys(normalizedTask).map(key => {
            if (key === 'status' && normalizedTask.status) {
                if(normalizedTask.status === 'inprogress' && normalizedTask.assignedTo && !currentTask?.assigned_at ) {
                    additionalUpdates += `, assigned_at = NOW()`;
                }
                else if(normalizedTask.status === 'done' && !currentTask?.completed_at ) {
                    additionalUpdates += `, completed_at = NOW()`;
                }
                else if(normalizedTask.status === 'todo' ) {
                    additionalUpdates += `, assigned_at = NULL, completed_at = NULL`;
                }
            }

            if (key === 'assignedTo' && normalizedTask.assignedTo && normalizedTask.status === 'inprogress' && !currentTask?.assigned_at) {
                additionalUpdates += `, assigned_at = NOW()`;
            }

            if (key === 'storyPoints') return `story_points = $${paramIndex++}`;
            if (key === 'assignedTo') return `assigned_to = $${paramIndex++}`;
            if (key === 'taskTypeId') return `task_type_id = $${paramIndex++}`;
            if (key === 'order') return `"order" = $${paramIndex++}`;
            return `${key} = $${paramIndex++}`;
        }).join(', ');

        const values = Object.values(normalizedTask);
        const result = await execute(
            `UPDATE tasks SET ${fields}${additionalUpdates}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
            [...values, id]
        );
        
        if (result.rowCount === 0) {
            console.warn(`⚠️ ATENÇÃO: UPDATE não afetou nenhuma linha para task ${id} - pode não existir`);
        } else {
            console.log(`✅ Task atualizada: ${id} (${result.rowCount} linha(s) afetada(s))`);
        }
    },

    delete: async (id: string) => {
        await execute(`DELETE FROM tasks WHERE id = $1`, [id]);
    },

    updateOrder: async (tasks: { id: string; order: number; status: 'todo' | 'inprogress' | 'done' }[]) => {
        // Get assigned_to for each task
        const taskIds = tasks.map(t => t.id);
        const assignees = await query(`
            SELECT id, assigned_to FROM tasks WHERE id = ANY($1::varchar[])
        `, [taskIds]);

        const assigneeMap = new Map(assignees.map((a: any) => [a.id, a.assigned_to]));

        type Item = { id: string; order: number; status: 'todo' | 'inprogress' | 'done'; assigned_to: string | null };
        const withAssignee: Item[] = tasks.map(t => ({
            ...t,
            assigned_to: assigneeMap.get(t.id) || null
        }));

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

        // Use a transaction for batch updates
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const t of normalized) {
                await client.query(
                    'UPDATE tasks SET "order" = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                    [t.order, t.status, t.id]
                );
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

export const timeCalculationQueries = {
    getTimeSinceAssignment: async (taskId: string) => {
        return await queryOne(`
            SELECT
                assigned_at,
                completed_at,
                CASE
                    WHEN assigned_at IS NULL THEN 'Nao atribuido'
                    WHEN completed_at IS NOT NULL THEN 
                        'Concluido em ' || ROUND(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 60)::int || ' minutos'
                    ELSE
                        'Em andamento há ' || ROUND(EXTRACT(EPOCH FROM (NOW() - assigned_at)) / 60)::int || ' minutos'
                END as time_info
            FROM tasks
            WHERE id = $1
        `, [taskId]);
    },

    // Calcular atrasos (tarefas que excederam o tempo estimado)
    getDelayedTasks: async (managerId?: string) => {
        if (managerId) {
            return await query(`
                SELECT 
                    t.*,
                    u.name as assigned_user_name,
                    tt.name as task_type_name,
                    t.estimated_hours,
                    EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 as hours_elapsed,
                    CASE 
                        WHEN t.estimated_hours IS NOT NULL AND t.estimated_hours > 0 THEN
                            EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 - t.estimated_hours
                        ELSE NULL
                    END as delay_hours
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN task_types tt ON t.task_type_id = tt.id
                WHERE t.status = 'inprogress'
                AND u.manager_id = $1
                AND t.estimated_hours IS NOT NULL
                AND EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 > t.estimated_hours
                ORDER BY delay_hours DESC
            `, [managerId]);
        } else {
            return await query(`
                SELECT 
                    t.*,
                    u.name as assigned_user_name,
                    tt.name as task_type_name,
                    t.estimated_hours,
                    EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 as hours_elapsed,
                    CASE 
                        WHEN t.estimated_hours IS NOT NULL AND t.estimated_hours > 0 THEN
                            EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 - t.estimated_hours
                        ELSE NULL
                    END as delay_hours
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN task_types tt ON t.task_type_id = tt.id
                WHERE t.status = 'inprogress'
                AND t.estimated_hours IS NOT NULL
                AND EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 > t.estimated_hours
                ORDER BY delay_hours DESC
            `);
        }
    },

    // Calcular tempo médio de conclusão
    getAverageCompletionTime: async (managerId?: string, days: number = 30) => {
        if (managerId) {
            return await queryOne(`
                SELECT 
                    COUNT(*)::int as total_tasks,
                    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as avg_hours,
                    ROUND(MIN(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as min_hours,
                    ROUND(MAX(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as max_hours,
                    ROUND(STDDEV(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as stddev_hours
                FROM tasks t
                JOIN users u ON t.assigned_to = u.id
                WHERE t.status = 'done'
                AND t.completed_at IS NOT NULL
                AND t.assigned_at IS NOT NULL
                AND u.manager_id = $1
                AND t.completed_at >= NOW() - INTERVAL '${days} days'
            `, [managerId]);
        } else {
            return await queryOne(`
                SELECT 
                    COUNT(*)::int as total_tasks,
                    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as avg_hours,
                    ROUND(MIN(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as min_hours,
                    ROUND(MAX(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as max_hours,
                    ROUND(STDDEV(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as stddev_hours
                FROM tasks
                WHERE status = 'done'
                AND completed_at IS NOT NULL
                AND assigned_at IS NOT NULL
                AND completed_at >= NOW() - INTERVAL '${days} days'
            `);
        }
    },
};

const calculateComplexityFactor = (storyPoints: number): number => {
    if (storyPoints <= 2) return 0.8;
    if (storyPoints <= 5) return 1.0;
    if (storyPoints <= 8) return 1.3;
    return 1.6;
};

const calculateConfidenceLevel = (sampleSize: number, stdDev: number, avgHours: number): number => {
    // Validação de entrada
    if (!stdDev || !avgHours || avgHours <= 0 || stdDev < 0 || sampleSize < 1) {
        return 0.3; // Confiança mínima para dados inválidos
    }
    
    let confidence = 0.5;
    
    // Baseado no tamanho da amostra
    if (sampleSize >= 20) confidence += 0.3;
    else if (sampleSize >= 10) confidence += 0.2;
    else if (sampleSize >= 5) confidence += 0.1;
    else confidence -= 0.1; // Amostras muito pequenas reduzem confiança
    
    // Baseado na variabilidade (coeficiente de variação)
    const coefficientOfVariation = stdDev / avgHours;
    if (coefficientOfVariation < 0.3) confidence += 0.2; // Baixa variabilidade = alta confiança
    else if (coefficientOfVariation < 0.6) confidence += 0.1; // Variabilidade moderada
    else confidence -= 0.1; // Alta variabilidade = baixa confiança
    
    // Garantir que confiança está entre 0.1 e 0.95
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
    calculateTeamVelocity: async (userId?: string, weeks: number = 8) => {
        let queryText = `
            SELECT 
                ${userId ? 'u.id as user_id, u.name as user_name,' : ''}
                COUNT(t.id)::int as completed_tasks,
                SUM(t.story_points)::int as total_story_points,
                ROUND((SUM(t.story_points)::numeric / $1), 2) as velocity_per_week,
                ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600)::numeric, 2) as avg_hours_per_task,
                ROUND(AVG(t.story_points)::numeric, 2) as avg_story_points
            FROM tasks t
            ${userId ? 'JOIN users u ON t.assigned_to = u.id' : ''}
            WHERE t.completed_at IS NOT NULL
            AND t.assigned_at IS NOT NULL
            AND t.story_points IS NOT NULL
            AND t.story_points > 0
            AND t.completed_at >= NOW() - INTERVAL '${weeks * 7} days'
        `;

        const params: any[] = [weeks];

        if(userId) {
            queryText += ` AND t.assigned_to = $2 GROUP BY u.id, u.name`;
            params.push(userId);
        }

        return userId ? await queryOne(queryText, params) : await queryOne(queryText, params);
    }, 

    calculatePointsToHoursRatio: async (userId?: string) => {
        let queryText = `
            SELECT 
                ${userId ? 'u.id as user_id, u.name as user_name,' : ''}
                COUNT(t.id)::int as sample_size,
                ROUND(AVG(t.story_points)::numeric, 2) as avg_story_points,
                ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600)::numeric, 2) as avg_hours,
                ROUND((AVG(EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600) / AVG(t.story_points))::numeric, 2) as hours_per_point
            FROM tasks t
            ${userId ? 'JOIN users u ON t.assigned_to = u.id' : ''}
            WHERE t.completed_at IS NOT NULL 
            AND t.assigned_at IS NOT NULL
            AND t.story_points IS NOT NULL
            AND t.story_points > 0
            AND (t.completed_at - t.assigned_at) > INTERVAL '0'
        `;
        
        if (userId) {
            queryText += ' AND t.assigned_to = $1 GROUP BY u.id, u.name';
            return await queryOne(queryText, [userId]);
        } else {
            return await queryOne(queryText);
        }
    },

    predictTaskTime: async (storyPoints: number, userId?: string, taskTypeId?: string) => {
        // Primeiro, buscar a média e outros dados básicos
        let baseQuery = `
            SELECT 
                ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as avg_hours,
                ROUND(AVG(story_points)::numeric, 2) as avg_points,
                COUNT(*)::int as sample_size
            FROM tasks 
            WHERE completed_at IS NOT NULL 
            AND assigned_at IS NOT NULL
            AND story_points IS NOT NULL
            AND story_points > 0
        `;
        
        const params: any[] = [];

        if(userId) {
            baseQuery += ' AND assigned_to = $1';
            params.push(userId);
        }

        if (taskTypeId) {
            baseQuery += ` AND task_type_id = $${params.length + 1}`;
            params.push(taskTypeId);
        }

        const basicData = await queryOne(baseQuery, params) as {
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

        // Calcular desvio padrão (PostgreSQL tem STDDEV)
        let stdDevQuery = `
            SELECT 
                ROUND(STDDEV(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600)::numeric, 2) as std_dev_hours
            FROM tasks 
            WHERE completed_at IS NOT NULL 
            AND assigned_at IS NOT NULL
            AND story_points IS NOT NULL
            AND story_points > 0
        `;
        
        const stdDevParams: any[] = [];

        if(userId) {
            stdDevQuery += ' AND assigned_to = $1';
            stdDevParams.push(userId);
        }

        if (taskTypeId) {
            stdDevQuery += ` AND task_type_id = $${stdDevParams.length + 1}`;
            stdDevParams.push(taskTypeId);
        }

        let stdDevResult = await queryOne(stdDevQuery, stdDevParams) as {
            std_dev_hours: number;
        } | undefined;

        // Validar dados históricos
        const stdDevHours = stdDevResult?.std_dev_hours;
        if (stdDevHours === null || stdDevHours === undefined || isNaN(stdDevHours)) {
            // Se não há desvio padrão, usar 30% da média como estimativa conservadora
            const estimatedStdDev = basicData.avg_hours * 0.3;
            stdDevResult = { std_dev_hours: estimatedStdDev };
        }

        const historicalData = {
            ...basicData,
            std_dev_hours: (stdDevResult?.std_dev_hours) || (basicData.avg_hours * 0.3) // Fallback: 30% da média
        };

        // Validar que temos dados válidos
        if (!historicalData.avg_hours || historicalData.avg_hours <= 0 || 
            !historicalData.avg_points || historicalData.avg_points <= 0) {
            const defaultHoursPerPoint = 4;
            return {
                estimated_hours: storyPoints * defaultHoursPerPoint,
                confidence_level: 0.3,
                message: 'Estimativa baseada em padrão da indústria (dados históricos inválidos)'
            };
        }

        const hourPerPoint = historicalData.avg_hours / historicalData.avg_points;
        let estimatedHours = storyPoints * hourPerPoint;
        const complexityFactor = calculateComplexityFactor(storyPoints);
        estimatedHours *= complexityFactor;
        
        const confidence = calculateConfidenceLevel(
            historicalData.sample_size, 
            historicalData.std_dev_hours, 
            historicalData.avg_hours
        );
        
        // CORRIGIDO: Usar erro padrão correto para intervalo de confiança de 95%
        // Erro padrão = stdDev / sqrt(n)
        // Para 95% de confiança, z-score ≈ 1.96 (usamos 2.0 como aproximação)
        const standardError = historicalData.std_dev_hours / Math.sqrt(historicalData.sample_size);
        const marginOfError = standardError * 2.0; // Intervalo de confiança de ~95%

        // Garantir que min_hours nunca seja negativo
        const minHours = Math.max(0, estimatedHours - marginOfError);
        const maxHours = estimatedHours + marginOfError;

        return {
            estimated_hours: Math.round(estimatedHours * 100) / 100,
            confidence_level: Math.round(confidence * 100) / 100,
            min_hours: Math.round(minHours * 100) / 100,
            max_hours: Math.round(maxHours * 100) / 100,
            hours_per_point: Math.round(hourPerPoint * 100) / 100,
            sample_size: historicalData.sample_size,
            message: generatePredictionMessage(confidence, historicalData.sample_size)
        };
    },

    predictMultipleTasks: async (tasks: Array<{storyPoints: number, userId?: string, taskTypeId?: string}>) => {
        const predictions = await Promise.all(
            tasks.map(task => 
                predictionQueries.predictTaskTime(task.storyPoints, task.userId, task.taskTypeId)
            )
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

    updatePredictionModel: async (taskId: string) => {
        const task = await queryOne(`
            SELECT 
                story_points,
                assigned_to,
                task_type_id,
                EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 3600 as actual_hours
            FROM tasks 
            WHERE id = $1 AND completed_at IS NOT NULL AND assigned_at IS NOT NULL
        `, [taskId]) as {
            story_points: number;
            assigned_to: string;
            task_type_id: string;
            actual_hours: number;
        } | undefined;

        if (!task) return null;

        await execute(`
            UPDATE tasks SET actual_hours = $1 WHERE id = $2
        `, [task.actual_hours, taskId]);

        return {
            task_id: taskId,
            story_points: task.story_points,
            actual_hours: Math.round(task.actual_hours * 100) / 100,
            efficiency: task.story_points > 0 ? Math.round((task.story_points / task.actual_hours) * 100) / 100 : 0
        };
    },

    analyzePredictionAccuracy: async (userId?: string) => {
        let queryText = `
            SELECT 
                COUNT(*)::int as total_tasks,
                ROUND(AVG(estimated_hours)::numeric, 2) as avg_estimated,
                ROUND(AVG(actual_hours)::numeric, 2) as avg_actual,
                ROUND(AVG(ABS(actual_hours - estimated_hours))::numeric, 2) as avg_absolute_error,
                ROUND(AVG(ABS(actual_hours - estimated_hours) / actual_hours * 100)::numeric, 2) as avg_percentage_error
            FROM tasks
            WHERE completed_at IS NOT NULL 
            AND estimated_hours IS NOT NULL 
            AND actual_hours IS NOT NULL
            AND actual_hours > 0
        `;

        const params: any[] = [];
        
        if (userId) {
            queryText += ' AND assigned_to = $1';
            params.push(userId);
        }

        return await queryOne(queryText, params);
    }
};

// Análise estatística
export const analyticsQueries = {
    // Estatísticas gerais do gestor
    getManagerStatistics: async (managerId: string, days: number = 30) => {
        return await queryOne(`
            SELECT 
                COUNT(DISTINCT t.id)::int as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::int as completed_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'inprogress' THEN t.id END)::int as in_progress_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'todo' THEN t.id END)::int as todo_tasks,
                COUNT(DISTINCT u.id)::int as total_programmers,
                ROUND(SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END)::numeric, 2) as completed_story_points,
                ROUND(AVG(CASE WHEN t.status = 'done' AND t.completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600 
                    ELSE NULL END)::numeric, 2) as avg_completion_hours,
                ROUND(AVG(t.story_points)::numeric, 2) as avg_story_points,
                COUNT(DISTINCT CASE WHEN t.status = 'inprogress' 
                    AND t.estimated_hours IS NOT NULL 
                    AND EXTRACT(EPOCH FROM (NOW() - t.assigned_at)) / 3600 > t.estimated_hours 
                    THEN t.id END)::int as delayed_tasks
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to = u.id
            WHERE u.manager_id = $1
            AND (t.created_at >= NOW() - INTERVAL '${days} days' OR t.created_at IS NULL)
        `, [managerId]);
    },

    // Produtividade por programador
    getProductivityByProgrammer: async (managerId: string, days: number = 30) => {
        return await query(`
            SELECT 
                u.id,
                u.name,
                u.experience_level,
                COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::int as completed_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'inprogress' THEN t.id END)::int as in_progress_tasks,
                SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END)::numeric as completed_story_points,
                ROUND(AVG(CASE WHEN t.status = 'done' AND t.completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600 
                    ELSE NULL END)::numeric, 2) as avg_completion_hours,
                ROUND(AVG(CASE WHEN t.status = 'done' THEN t.story_points ELSE NULL END)::numeric, 2) as avg_story_points_per_task
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to = u.id
            WHERE u.manager_id = $1
            AND u.type = 'programador'
            AND (t.created_at >= NOW() - INTERVAL '${days} days' OR t.created_at IS NULL)
            GROUP BY u.id, u.name, u.experience_level
            ORDER BY completed_tasks DESC, u.name ASC
        `, [managerId]);
    },

    // Estatísticas por tipo de tarefa
    getStatisticsByTaskType: async (managerId: string, days: number = 30) => {
        return await query(`
            SELECT 
                tt.id,
                tt.name as task_type_name,
                COUNT(DISTINCT t.id)::int as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::int as completed_tasks,
                ROUND(AVG(CASE WHEN t.status = 'done' AND t.completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600 
                    ELSE NULL END)::numeric, 2) as avg_completion_hours,
                ROUND(AVG(CASE WHEN t.status = 'done' THEN t.story_points ELSE NULL END)::numeric, 2) as avg_story_points
            FROM task_types tt
            LEFT JOIN tasks t ON t.task_type_id = tt.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE (u.manager_id = $1 OR t.created_by = $1)
            AND (t.created_at >= NOW() - INTERVAL '${days} days' OR t.created_at IS NULL)
            GROUP BY tt.id, tt.name
            HAVING COUNT(DISTINCT t.id) > 0
            ORDER BY total_tasks DESC
        `, [managerId]);
    },

    // Tendências ao longo do tempo
    getTaskTrends: async (managerId: string, days: number = 30) => {
        return await query(`
            SELECT 
                DATE(t.completed_at) as date,
                COUNT(*)::int as completed_count,
                SUM(t.story_points)::numeric as total_story_points,
                ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - t.assigned_at)) / 3600)::numeric, 2) as avg_hours
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            WHERE t.status = 'done'
            AND u.manager_id = $1
            AND t.completed_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(t.completed_at)
            ORDER BY date DESC
        `, [managerId]);
    },

    // Taxa de conclusão vs estimativa
    getEstimationAccuracy: async (managerId: string, days: number = 30) => {
        return await queryOne(`
            SELECT 
                COUNT(*)::int as total_tasks,
                ROUND(AVG(ABS(t.actual_hours - t.estimated_hours))::numeric, 2) as avg_absolute_error,
                ROUND(AVG(CASE WHEN t.actual_hours > 0 
                    THEN ABS(t.actual_hours - t.estimated_hours) / t.actual_hours * 100 
                    ELSE NULL END)::numeric, 2) as avg_percentage_error,
                COUNT(CASE WHEN t.actual_hours <= t.estimated_hours THEN 1 END)::int as on_time_tasks,
                COUNT(CASE WHEN t.actual_hours > t.estimated_hours THEN 1 END)::int as delayed_tasks
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            WHERE t.status = 'done'
            AND t.estimated_hours IS NOT NULL
            AND t.actual_hours IS NOT NULL
            AND u.manager_id = $1
            AND t.completed_at >= NOW() - INTERVAL '${days} days'
        `, [managerId]);
    },
};

export default pool;