require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? {
    require: true,
    rejectUnauthorized: false
  } : false
});

const createTablesSQL = `
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS Usuario (
  Id_Usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Nome VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Senha VARCHAR(255) NOT NULL,
  Data_Criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Membros da Família
CREATE TABLE IF NOT EXISTS Membro_Familia (
  Id_Membro UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Id_Usuario UUID NOT NULL,
  Nome_Membro VARCHAR(100) NOT NULL,
  Parentesco VARCHAR(50),
  CONSTRAINT fk_usuario_membro FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario) ON DELETE CASCADE
);

-- 3. Tabela de Contas e Cartões
CREATE TABLE IF NOT EXISTS Conta_Cartao (
  Id_Conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Id_Usuario UUID NOT NULL,
  Nome_Conta VARCHAR(50) NOT NULL,
  Tipo VARCHAR(20) NOT NULL,
  Titular VARCHAR(100) NOT NULL,
  Ultimos_Digitos CHAR(4),
  Cor_Hex CHAR(7) NOT NULL,
  CONSTRAINT fk_usuario_conta FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario) ON DELETE CASCADE
);

-- 4. Tabela de Rendas
CREATE TABLE IF NOT EXISTS Renda (
  Id_Renda UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Id_Usuario UUID NOT NULL,
  Descricao_Renda VARCHAR(100) NOT NULL,
  Valor_Renda DECIMAL(10,2) NOT NULL,
  Data DATE NOT NULL,
  CONSTRAINT fk_usuario_renda FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario) ON DELETE CASCADE
);

-- 5. Tabela de agrupamento de parcelamento
CREATE TABLE IF NOT EXISTS Parcelamento_Agrupador (
  Id_Parcelamento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Id_Usuario UUID NOT NULL,
  Descricao_Parcela VARCHAR(100) NOT NULL,
  Valor_Total DECIMAL(10,2) NOT NULL,
  Qtd_Parcelas INT NOT NULL,
  Data_Inicio DATE NOT NULL,
  CONSTRAINT fk_usuario_parcelamento FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario) ON DELETE CASCADE
);

-- 6. Tabela de despesas
CREATE TABLE IF NOT EXISTS Despesa (
  Id_Despesa UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Id_Usuario UUID NOT NULL,
  Id_Conta UUID NOT NULL,
  Id_Parcelamento UUID,
  Descricao_Despesa VARCHAR(100) NOT NULL,
  Valor_Parcela DECIMAL(10,2) NOT NULL,
  Data DATE NOT NULL,
  Categoria VARCHAR(50) NOT NULL,
  Numero_Parcela INT DEFAULT 1,
  CONSTRAINT fk_usuario_despesa FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario) ON DELETE CASCADE,
  CONSTRAINT fk_conta_despesa FOREIGN KEY (Id_Conta) REFERENCES Conta_Cartao(Id_Conta),
  CONSTRAINT fk_parcelamento_despesa FOREIGN KEY (Id_Parcelamento) REFERENCES Parcelamento_Agrupador(Id_Parcelamento) ON DELETE CASCADE
);

-- 7. Tabela de Reservas
CREATE TABLE IF NOT EXISTS Reserva (
  Id_Reserva UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  Id_Usuario UUID NOT NULL,
  Nome_Objetivo VARCHAR(100) NOT NULL,
  Valor_Alvo DECIMAL(10,2) NOT NULL,
  Valor_Atual DECIMAL(10,2) DEFAULT 0.00,
  Data_Limite DATE,
  CONSTRAINT fk_usuario_reserva FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_membro_familia_usuario ON Membro_Familia(Id_Usuario);
CREATE INDEX IF NOT EXISTS idx_conta_cartao_usuario ON Conta_Cartao(Id_Usuario);
CREATE INDEX IF NOT EXISTS idx_renda_usuario ON Renda(Id_Usuario);
CREATE INDEX IF NOT EXISTS idx_renda_data ON Renda(Data);
CREATE INDEX IF NOT EXISTS idx_parcelamento_usuario ON Parcelamento_Agrupador(Id_Usuario);
CREATE INDEX IF NOT EXISTS idx_despesa_usuario ON Despesa(Id_Usuario);
CREATE INDEX IF NOT EXISTS idx_despesa_data ON Despesa(Data);
CREATE INDEX IF NOT EXISTS idx_despesa_categoria ON Despesa(Categoria);
CREATE INDEX IF NOT EXISTS idx_reserva_usuario ON Reserva(Id_Usuario);
`;

async function createTables() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await pool.connect();
    console.log('✅ Conectado!\n');
    
    console.log('🔄 Criando tabelas...');
    await pool.query(createTablesSQL);
    console.log('✅ Tabelas criadas com sucesso!\n');
    
    console.log('✅ Setup do banco de dados concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    process.exit(1);
  }
}

createTables();
