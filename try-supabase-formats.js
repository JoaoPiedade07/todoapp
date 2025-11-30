// Script para tentar diferentes formatos de URL do Supabase
const { Pool } = require('pg');
require('dotenv').config();

const PROJECT_REF = 'ceexmutdzhrkeuheotys';
const PASSWORD = 'Joaofutebol07@'; // Decodificado do %40

const formats = [
  // Formato com pooler (recomendado)
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Formato direto
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  
  // Formato alternativo
  `postgresql://postgres:${encodeURIComponent(PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
];

async function testConnection(url, name) {
  console.log(`\n🔍 Testando: ${name}`);
  console.log(`   URL: ${url.replace(PASSWORD, '***')}`);
  
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await pool.query('SELECT NOW()');
    console.log(`   ✅ SUCESSO! Esta URL funciona!`);
    console.log(`\n📋 Adicione ao .env:\nDATABASE_URL=${url}\n`);
    await pool.end();
    return true;
  } catch (err) {
    console.log(`   ❌ Falhou: ${err.code || err.message}`);
    await pool.end();
    return false;
  }
}

async function main() {
  console.log('🔍 Testando diferentes formatos de URL do Supabase...\n');
  
  for (let i = 0; i < formats.length; i++) {
    const success = await testConnection(formats[i], `Formato ${i + 1}`);
    if (success) {
      console.log('\n✅ Encontrada uma URL que funciona!');
      process.exit(0);
    }
  }
  
  console.log('\n❌ Nenhum formato funcionou.');
  console.log('\n💡 Possíveis causas:');
  console.log('   1. O projeto Supabase está pausado');
  console.log('   2. A senha está incorreta');
  console.log('   3. O projeto foi deletado');
  console.log('\n📋 Acesse: https://supabase.com/dashboard');
  console.log('   E obtenha a connection string correta em Settings > Database');
  process.exit(1);
}

main();
