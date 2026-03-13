# Sistema Financeiro Web

Sistema financeiro pessoal/familiar full-stack, construído com Next.js 15 e PostgreSQL. Permite controlar despesas, rendas, parcelamentos, reservas e contas bancárias — com importação de extratos via CSV e painel administrativo.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes, Sequelize 6 ORM |
| Banco de dados | PostgreSQL |
| Autenticação | JWT (7 dias) + bcryptjs |
| Email | Nodemailer (SMTP/Gmail) |
| Gráficos | Recharts |
| API Docs | Swagger UI + swagger-jsdoc |

## Funcionalidades

- **Dashboard** — resumo mensal de receitas, despesas e saldo; gráficos consolidados
- **Contas e Cartões** — cadastro de contas bancárias e cartões com cor personalizada
- **Despesas** — CRUD com categoria, conta vinculada e suporte a parcelamento
- **Rendas** — controle de salários e outras receitas
- **Parcelamentos** — agrupamento de parcelas com acompanhamento do progresso
- **Reservas** — objetivos de poupança com valor-alvo e prazo
- **Membros da família** — gestão de membros do grupo financeiro
- **Importação CSV** — importa extratos bancários com auto-categorização por 70+ palavras-chave
- **Relatórios** — análise de gastos por categoria e período
- **Admin** — painel de gestão de usuários e estatísticas do sistema
- **Auth completa** — registro, verificação de e-mail, recuperação de senha

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+

## Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd projeto-sistema-financeiro-web

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais (veja seção abaixo)

# 4. Crie o banco de dados e as tabelas
psql -U postgres -c "CREATE DATABASE financeiro_web;"
psql -U postgres -d financeiro_web -f src/database/schemas/create-tables.sql

# 5. (Opcional) Crie o usuário admin inicial
node src/database/seeds/create-admin.mjs

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Ambiente
NODE_ENV=development

# Banco de dados (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financeiro_web
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_SSL=false

# JWT
JWT_SECRET=chave-secreta-forte-aqui
JWT_EXPIRES_IN=7d

# Email (SMTP / Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-app-password
```

> Para Gmail, gere uma **App Password** com 2FA habilitado em sua conta Google.

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento (http://localhost:3000)
npm run build    # Build de produção
npm start        # Inicia servidor de produção
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # API Routes (Next.js)
│   │   ├── usuarios/
│   │   ├── contas-cartoes/
│   │   ├── despesas/
│   │   ├── rendas/
│   │   ├── parcelamentos/
│   │   ├── reservas/
│   │   ├── membros-familia/
│   │   ├── importar-csv/
│   │   ├── dashboard/
│   │   └── admin/
│   └── (páginas)/        # Pages do App Router
├── controllers/          # Lógica dos endpoints
├── services/             # Regras de negócio
├── models/               # Modelos Sequelize (ORM)
├── middleware/           # Autenticação JWT
├── config/               # DB e variáveis de ambiente
├── components/           # Componentes React reutilizáveis
├── contexts/             # Context API (AuthContext)
└── database/
    ├── schemas/          # DDL das tabelas
    ├── migrations/       # Migrações incrementais
    └── seeds/            # Dados iniciais
```

## Documentação da API

Com o servidor rodando, acesse `/api-docs` para a interface Swagger interativa.

## Categorias de Auto-classificação (CSV)

A importação detecta automaticamente a categoria pela descrição da transação:

`Alimentação` · `Transporte` · `Saúde` · `Entretenimento` · `Educação` · `Roupas` · `Contas` · `Moradia` · `Eletrônicos` · `Outros`

## Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.