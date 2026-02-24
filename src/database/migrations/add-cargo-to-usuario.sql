-- Migração: Adicionar campo 'cargo' à tabela Usuario
-- Execute este script no banco de dados para atualizar a estrutura existente.

-- Adiciona o campo cargo (se ainda não existir)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS cargo VARCHAR(10) NOT NULL DEFAULT 'usuario';

-- Adiciona constraint CHECK para valores válidos
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_cargo_check;
ALTER TABLE usuario ADD CONSTRAINT usuario_cargo_check CHECK (cargo IN ('usuario', 'admin'));

-- Verifica o resultado
SELECT id_usuario, nome, email, cargo FROM usuario LIMIT 10;
