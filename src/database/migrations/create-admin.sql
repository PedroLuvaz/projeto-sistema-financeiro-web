-- Script completo: Migração + criação da conta admin
-- Execute no banco de dados PostgreSQL (financeiro_web)

-- PASSO 1: Adicionar campo cargo à tabela usuario
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS cargo VARCHAR(10) NOT NULL DEFAULT 'usuario';
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_cargo_check;
ALTER TABLE usuario ADD CONSTRAINT usuario_cargo_check CHECK (cargo IN ('usuario', 'admin'));

-- PASSO 2: Criar conta admin
-- Senha: Admin@123 (hash bcrypt com 10 rounds)
INSERT INTO usuario (id_usuario, nome, email, senha, cargo, data_criacao)
VALUES (
  uuid_generate_v4(),
  'Administrador',
  'admin@financeapp.com',
  '$2a$10$rJqAaS5nEGPLtFMEuDl7j.1eQ4U9UDg6y7XJ7n9mZ.vVsHtL5k3Oy',
  'admin',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET cargo = 'admin';

-- Verifica
SELECT id_usuario, nome, email, cargo, data_criacao FROM usuario WHERE cargo = 'admin';
