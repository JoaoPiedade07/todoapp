// Script para testar conexão com Supabase
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('Conexão bem-sucedida!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erro de conexão:', err.message);
    console.error('Código:', err.code);
    if (err.code === 'ENOTFOUND') {
      console.error('\nO hostname não pode ser resolvido.');
      console.error('Verifique:');
      console.error('1. Se o projeto Supabase está ativo');
      console.error('2. Se a URL está correta');
      console.error('3. Tente usar a connection string com pooler (porta 6543)');
    }
    process.exit(1);
  });
