import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Esta é a função de setup que o Vitest vai executar
export default async function setup() {
  // Carrega o .env.test
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

  const schema = randomUUID();
  const databaseUrl = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?schema=${schema}`;
  
  process.env.DATABASE_URL = databaseUrl;

  // Roda as migrações
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: 'inherit',
  });
  console.log('✅ Ambiente de testes configurado e migrado.');

  // Retorna a função de teardown, como o Vitest espera
  return async function teardown() {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    // Apaga tudo que foi criado no schema deste teste
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await client.end();
    console.log('🔥 Ambiente de testes limpo.');
  };
}