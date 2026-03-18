# Sistema Financeiro Web

Aplicação web fullstack para gestão de finanças pessoais, desenvolvida como projeto acadêmico.

## Sobre o Projeto

O Sistema Financeiro Web é uma plataforma que permite aos usuários controlar suas finanças de forma completa, incluindo controle de despesas, rendas, contas, reservas financeiras e gerenciamento de membros da família.

A aplicação foi construída com arquitetura fullstack monolítica utilizando **Next.js 15 (App Router)**, integrando frontend React e backend API REST no mesmo repositório e processo.

## Funcionalidades

- **Autenticação** — Registro, login e controle de acesso via JWT, com suporte a perfis `usuario` e `admin`
- **Dashboard** — Resumo mensal e relatório anual com gráficos interativos
- **Despesas** — Cadastro de despesas avulsas ou parceladas (com agrupamento automático de parcelas)
- **Rendas** — Registro de fontes de renda
- **Contas e Cartões** — Gerenciamento de contas bancárias e cartões de crédito
- **Reservas** — Criação de objetivos de poupança com aporte e retirada de valores
- **Família** — Cadastro de membros da família vinculados ao usuário
- **Exportação CSV** — Exportação de despesas e relatórios anuais
- **Painel Admin** — Gerenciamento de usuários e estatísticas do sistema
- **Tema claro/escuro** — Alternância de tema com persistência

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Banco de Dados | PostgreSQL |
| ORM | Sequelize 6 |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Gráficos | Recharts |
| Ícones | Lucide React |
| HTTP Client | Axios |
| Estilização | CSS custom properties + Tailwind (reset) |

## Estrutura do Projeto

```
src/
  app/
    api/           ← Rotas do backend (Next.js API Routes)
      _helpers/    ← routeHandler.js — middleware de autenticação e roteamento
      admin/       ← Rotas protegidas por perfil admin
    admin/         ← Painel administrativo (frontend)
    (outras)       ← Páginas do usuário (dashboard, despesas, rendas, etc.)
  components/      ← Componentes compartilhados (Layout, gráficos, etc.)
  contexts/        ← AuthContext — estado global de autenticação
  controllers/     ← Mapeiam retorno dos services para a resposta HTTP
  models/          ← Modelos Sequelize (entidades do banco)
  services/        ← Lógica de negócio e acesso ao banco de dados
  middleware/      ← Verificação de JWT
  config/          ← Variáveis de ambiente e instância Sequelize
  database/
    schemas/       ← SQL de criação das tabelas
    migrations/    ← SQLs de alteração estrutural do banco
    seeds/         ← Scripts para dados iniciais (ex: criar admin)
```

## Como Executar

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

### Configuração

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd projeto-sistema-financeiro-web
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo `.env` na raiz com as variáveis:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=financeiro_web
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_SSL=false
   JWT_SECRET=sua-chave-secreta
   JWT_EXPIRES_IN=7d
   ```

4. Crie o banco de dados no PostgreSQL:
   ```sql
   CREATE DATABASE financeiro_web;
   ```

5. Execute o schema para criar as tabelas:
   ```bash
   # Execute no seu cliente PostgreSQL:
   # src/database/schemas/create-tables.sql
   ```

6. Crie o usuário administrador inicial:
   ```bash
   node src/database/seeds/create-admin.mjs
   ```

7. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

### Scripts disponíveis

```bash
npm run dev      # Inicia em modo desenvolvimento (porta 3000)
npm run build    # Gera build de produção
npm run start    # Inicia em modo produção (após build)
```

## Banco de Dados

O schema do banco é composto pelas seguintes tabelas:

| Tabela | Descrição |
|---|---|
| `usuario` | Usuários da plataforma (cargo: `usuario` ou `admin`) |
| `conta_cartao` | Contas bancárias e cartões vinculados ao usuário |
| `renda` | Fontes de renda do usuário |
| `despesa` | Despesas avulsas ou parcelas de um parcelamento |
| `parcelamento_agrupador` | Agrupador de despesas parceladas |
| `reserva` | Objetivos de poupança com controle de saldo |
| `membro_familia` | Membros da família vinculados ao usuário |

> Todas as chaves estrangeiras de `id_usuario` possuem `ON DELETE CASCADE`.

## Equipe

| Nome | Função |
|---|---|
| **Pedro Lucas** | Back-end e API|
| **Laura Vasconcelos** | Banco de Dados e Back-end |
| **Kevin Santos** | Front-end |

## Agradecimentos

Agradecemos ao professor **Thiago Soares Marques** pela orientação, pelo apoio durante o desenvolvimento do projeto e por todo o conhecimento compartilhado ao longo da disciplina.
