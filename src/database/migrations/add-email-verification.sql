-- Migração: Verificação de e-mail e reset de senha
-- Execute no banco PostgreSQL (financeiro_web)

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS codigo_verificacao VARCHAR(6);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS codigo_expiracao TIMESTAMP;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT false;

-- Usuários existentes já são considerados verificados
UPDATE usuario SET email_verificado = true WHERE email_verificado = false;

SELECT id_usuario, nome, email, email_verificado FROM usuario LIMIT 5;
