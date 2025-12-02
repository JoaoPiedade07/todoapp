// Migration script to export SQLite data and prepare for PostgreSQL
// Run this before migrating: npm run migrate

import Database from "better-sqlite3";
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database.sqlite3');
const db = new Database(dbPath);

interface TableData {
  name: string;
  columns: string[];
  rows: any[];
}

async function exportSQLiteData(): Promise<TableData[]> {
  const tables = ['users', 'task_types', 'tasks'];
  const exported: TableData[] = [];

  for (const tableName of tables) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
    const columnNames = columns.map(col => col.name);
    
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    exported.push({
      name: tableName,
      columns: columnNames,
      rows: rows as any[]
    });
  }

  return exported;
}

function generatePostgreSQLInsertSQL(data: TableData[]): string {
  let sql = '-- PostgreSQL Migration Script\n';
  sql += '-- Generated from SQLite database\n\n';
  sql += 'BEGIN;\n\n';

  for (const table of data) {
    if (table.rows.length === 0) continue;

    sql += `-- Insert data into ${table.name}\n`;
    sql += `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES\n`;

    const values = table.rows.map((row, idx) => {
      const rowValues = table.columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (value instanceof Date) return `'${value.toISOString()}'`;
        return value;
      });
      return `(${rowValues.join(', ')})${idx < table.rows.length - 1 ? ',' : ''}`;
    });

    sql += values.join('\n') + ';\n\n';
  }

  sql += 'COMMIT;\n';
  return sql;
}

async function main() {
  console.log('📦 Exporting SQLite data...');
  const data = exportSQLiteData();
  
  console.log('📝 Generating PostgreSQL migration script...');
  const sql = generatePostgreSQLInsertSQL(data);
  
  const outputPath = path.join(process.cwd(), 'migration-data.sql');
  fs.writeFileSync(outputPath, sql);
  
  console.log(`Migration script created: ${outputPath}`);
  console.log('Next steps:');
  console.log('1. Create your PostgreSQL database');
  console.log('2. Run the schema creation (from database.postgres.ts.example)');
  console.log('3. Run this migration script: psql -d your_database -f migration-data.sql');
  
  db.close();
}

main().catch(console.error);

