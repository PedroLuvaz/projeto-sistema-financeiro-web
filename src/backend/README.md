# Backend

Setup inicial do backend do sistema financeiro, com integracao ao PostgreSQL.

## Stack

- Node.js
- Express
- PostgreSQL (`pg`)
- CORS
- Helmet
- Morgan
- Dotenv

## Requisitos

- Node.js 20+ (recomendado)
- npm 10+
- PostgreSQL 14+

## Instalacao

No diretorio `backend`:

```bash
npm install
```

## Passo a passo: configurar PostgreSQL

1. Acesse o `psql` com um usuario administrador (exemplo: `postgres`):

```sql
psql -U postgres
```

2. Crie o banco da aplicacao (se ainda nao existir):

```sql
CREATE DATABASE financeiro_web;
```

3. Crie um usuario dedicado para a aplicacao:

```sql
CREATE USER financeiro_app WITH PASSWORD 'senha_forte_aqui';
```

4. Dê permissao no banco:

```sql
GRANT ALL PRIVILEGES ON DATABASE financeiro_web TO financeiro_app;
```

5. Conecte no banco criado para configurar schema/tabelas:

```sql
\c financeiro_web
```

6. Garanta permissao no schema `public`:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO financeiro_app;
```

## Passo a passo: configurar `.env`

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Preencha os valores no `.env`:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financeiro_web
DB_USER=financeiro_app
DB_PASSWORD=senha_forte_aqui
DB_SSL=false
```

3. Confirme que os valores batem com o banco criado no PostgreSQL.

## Execucao

Modo desenvolvimento (auto-reload):

```bash
npm run dev
```

Modo producao:

```bash
npm start
```

Na subida, o backend testa a conexao com o PostgreSQL. Se falhar, o processo encerra com erro.

## Endpoints iniciais

- `GET /` status geral da API
- `GET /api/health` health check da API e do banco

## Estrutura de pastas

- `src/app.js`: configuracao principal da aplicacao Express
- `src/server.js`: inicializacao do servidor + bootstrap de conexao com banco
- `src/config/env.js`: leitura de variaveis de ambiente
- `src/config/database.js`: pool do PostgreSQL
- `src/routes/`: rotas da API
- `src/middleware/`: middlewares globais (404 e erro)
- `controllers/`, `services/`, `models/`, `utils/`: espacos reservados para evolucao
