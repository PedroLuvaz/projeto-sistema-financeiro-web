/**
 * Script para criar conta admin.
 * Uso: node src/database/seeds/create-admin.mjs
 */

import bcrypt from 'bcryptjs'
import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Carrega .env manualmente (sem dependência de dotenv)
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../../../.env')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env não encontrado, usa defaults
}

const { Client } = pg

const ADMIN = {
  nome: 'Administrador',
  email: 'admin@financeapp.com',
  senha: 'Admin@123'
}

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'financeiro_web',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
})

async function main() {
  try {
    await client.connect()
    console.log('✅ Conectado ao banco de dados')

    // Garante que o campo cargo existe
    await client.query(`
      ALTER TABLE usuario ADD COLUMN IF NOT EXISTS cargo VARCHAR(10) NOT NULL DEFAULT 'usuario'
    `)
    await client.query(`
      ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_cargo_check
    `)
    await client.query(`
      ALTER TABLE usuario ADD CONSTRAINT usuario_cargo_check CHECK (cargo IN ('usuario', 'admin'))
    `)
    console.log('✅ Campo cargo garantido na tabela usuario')

    // Verifica se admin já existe
    const existing = await client.query(
      'SELECT id_usuario, email, cargo FROM usuario WHERE email = $1',
      [ADMIN.email]
    )

    if (existing.rows.length > 0) {
      const u = existing.rows[0]
      if (u.cargo === 'admin') {
        console.log(`ℹ️  Usuário ${ADMIN.email} já é admin.`)
      } else {
        await client.query(
          'UPDATE usuario SET cargo = $1 WHERE email = $2',
          ['admin', ADMIN.email]
        )
        console.log(`✅ Usuário ${ADMIN.email} promovido a admin.`)
      }
    } else {
      const senhaHash = await bcrypt.hash(ADMIN.senha, 10)
      await client.query(
        `INSERT INTO usuario (id_usuario, nome, email, senha, cargo, data_criacao)
         VALUES (gen_random_uuid(), $1, $2, $3, 'admin', NOW())`,
        [ADMIN.nome, ADMIN.email, senhaHash]
      )
      console.log(`✅ Admin criado com sucesso!`)
    }

    console.log('\n📋 Credenciais de acesso:')
    console.log(`   Email: ${ADMIN.email}`)
    console.log(`   Senha: ${ADMIN.senha}`)
    console.log('\n🔗 Acesse: http://localhost:3000/login')
  } catch (err) {
    console.error('❌ Erro:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
