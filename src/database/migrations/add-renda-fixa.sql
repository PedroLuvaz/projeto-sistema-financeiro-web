-- Migration: adicionar suporte a renda fixa
-- Execute no banco Neon

ALTER TABLE renda
  ADD COLUMN IF NOT EXISTS fixa BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dia_vencimento INTEGER;

-- Índice para buscar todas as rendas fixas de um usuário
CREATE INDEX IF NOT EXISTS idx_renda_fixa ON renda (id_usuario, fixa);
