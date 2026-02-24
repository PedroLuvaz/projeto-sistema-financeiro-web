# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Comandos essenciais

```bash
# Desenvolvimento
npm run dev        # Inicia o servidor Next.js em modo dev (porta 3000)
npm run build      # Build de produção
npm run start      # Inicia em modo produção (após build)

# Criar conta admin pela primeira vez
node src/database/seeds/create-admin.mjs

# Rodar migração do campo cargo (se o banco existir sem ele)
# Execute no PostgreSQL: src/database/migrations/add-cargo-to-usuario.sql
```

## Variáveis de ambiente (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financeiro_web
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
JWT_SECRET=sua-chave-secreta
JWT_EXPIRES_IN=7d
```

O banco de dados deve existir antes de iniciar. As tabelas são criadas pelo script `src/database/schemas/create-tables.sql`. Não há auto-sync do Sequelize — os modelos refletem a estrutura real, mas a criação das tabelas é manual via SQL.

---

## Arquitetura

O projeto é uma aplicação **fullstack monolítica com Next.js 15 App Router**. O frontend (React) e o backend (API REST) coexistem no mesmo processo e repositório.

### Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **ORM**: Sequelize 6 com driver `pg` explicitamente passado como `dialectModule` (necessário para Vercel/edge)
- **Banco**: PostgreSQL
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Estilização**: CSS-in-JS inline + CSS custom properties (sem Tailwind utilitário — só o reset via `@import "tailwindcss"`)

### Fluxo de uma requisição

```
Browser → Next.js Route (src/app/api/.../route.js)
              ↓
         handleRequest() [src/app/api/_helpers/routeHandler.js]
              ↓ verificarToken() se auth: true ou adminOnly: true
         Controller (src/controllers/)
              ↓
         Service (src/services/)  ←→  Sequelize Models (src/models/)
              ↓
         { status, data } ou { status, error }
              ↓
         NextResponse.json({ success, data }) ou Response (CSV)
```

### Estrutura de diretórios relevante

```
src/
  app/
    api/           ← Routes do backend (Next.js API Routes)
      _helpers/    ← routeHandler.js — único entry point para toda rota
      admin/       ← Rotas protegidas por adminOnly: true
    admin/         ← Página frontend do painel admin
    (outras pastas) ← Páginas frontend (todas 'use client')
  components/      ← Componentes compartilhados; Layout.jsx é o shell do app
  contexts/        ← Somente AuthContext.jsx (estado global de auth)
  controllers/     ← Mapeiam retorno do service para { status, data/error }
  models/          ← Definições Sequelize; index.js inicializa e associa todos
  services/        ← Lógica de negócio e acesso ao banco
  middleware/      ← auth.js: verificação JWT, retorna { usuarioId, usuarioEmail, usuarioCargo }
  config/          ← env.js (variáveis) e database.js (instância Sequelize singleton)
  utils/helpers.js ← formatCurrency, formatDate, CATEGORIAS, cores de gráficos
  database/
    schemas/       ← SQL de criação das tabelas
    migrations/    ← SQLs de alteração (ex: adicionar campo cargo)
    seeds/         ← Scripts Node.js para dados iniciais
```

---

## Padrões obrigatórios

### Criar uma nova rota de API

Toda rota usa `handleRequest` — nunca responda diretamente com `NextResponse` em rotas novas:

```js
// src/app/api/minha-entidade/route.js
import { handleRequest } from '@/app/api/_helpers/routeHandler'
import meuController from '@/controllers/meuController'

export async function GET(request) {
  return handleRequest(request, async (req) => {
    return meuController.listar()
  })
  // { auth: true } é o default — omitir é seguro
}

// Rota pública:
export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return meuController.criar(body)
  }, { auth: false })
}

// Rota exclusiva de admin:
export async function DELETE(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    return meuController.deletar(id, req.usuarioId)
  }, { adminOnly: true })
}
```

O `handleRequest` injeta em `req`: `usuarioId`, `usuarioEmail`, `usuarioCargo`.

### Retorno dos controllers

Sempre retornar `{ status: <número>, data: <resultado> }` para sucesso, ou lançar `Error` com `.statusCode` para erros:

```js
// Controller
async meuMetodo(id) {
  const resultado = await meuService.buscar(id)
  return { status: 200, data: resultado }
}

// Service — para erros:
const error = new Error('Não encontrado')
error.statusCode = 404
throw error
```

### Modelo Sequelize

Todos os modelos seguem o padrão de factory function recebendo `sequelize`. O campo usa `field: 'nome_snake'` para mapeamento, e `PascalCase` no JavaScript. Associations ficam em `Model.associate = (models) => {}` e são chamadas em `src/models/index.js`.

```js
// src/models/MinhaEntidade.js
import { DataTypes } from 'sequelize'
export default (sequelize) => {
  const MinhaEntidade = sequelize.define('MinhaEntidade', {
    Id_Entidade: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: 'id_entidade' },
    // ...
  }, { tableName: 'minha_entidade', timestamps: false, underscored: true })

  MinhaEntidade.associate = (models) => {
    MinhaEntidade.belongsTo(models.Usuario, { foreignKey: 'Id_Usuario', as: 'usuario', onDelete: 'CASCADE' })
  }
  return MinhaEntidade
}
```

Registrar em `src/models/index.js` com `import define... from './MinhaEntidade.js'` e adicionar ao objeto `models`.

### Frontend — páginas

Todas as páginas são `'use client'` e seguem este padrão:

```js
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'

export default function MinhaPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
  }, [user, router])

  if (!user) return null
  // ...
  return <Layout>...</Layout>
}
```

Requisições ao backend usam `api` do `src/services/api.js` (Axios com base `/api` e interceptor que injeta token do localStorage).

---

## Sistema de autenticação

1. Login/registro → `POST /api/usuarios/login` ou `/api/usuarios/registrar`
2. Resposta retorna `{ token, usuario }` — token é JWT com `{ id, email, cargo }`
3. Token e `usuario` salvos no `localStorage` pelo `AuthContext`
4. Todo request subsequente inclui `Authorization: Bearer <token>` via interceptor Axios
5. Backend verifica em `verificarToken()` → extrai `usuarioId`, `usuarioEmail`, `usuarioCargo`
6. `adminOnly: true` no `handleRequest` rejeita com 403 se `usuarioCargo !== 'admin'`
7. 401 em qualquer resposta → logout automático e redirect para `/login` (interceptor Axios)

**Campo `Cargo`** na tabela `usuario`: `'usuario'` (padrão) ou `'admin'`. O `cargo` é incluído no JWT para evitar consulta ao banco em cada request.

---

## Sistema de parcelamento

O sistema de despesas suporta dois modos, controlados pelo campo `Numero_Parcelas` no payload de criação:

- **`Numero_Parcelas <= 1`**: cria 1 registro `Despesa` direto, sem agrupador.
- **`Numero_Parcelas > 1`**: usa transação Sequelize para criar:
  1. 1 `ParcelamentoAgrupador` (metadados do grupo)
  2. N registros `Despesa`, um por mês (data incrementada por `setMonth(+i)`), todos vinculados ao agrupador via `Id_Parcelamento`

Deletar o `ParcelamentoAgrupador` cascateia e remove todas as `Despesa` filhas (ON DELETE CASCADE no banco e nas associations Sequelize).

---

## Tema / Estilização

A interface usa CSS custom properties definidas em `src/app/globals.css`. O tema claro/escuro é aplicado adicionando/removendo a classe `.dark` no `<html>` pelo `ThemeProvider`. Toda estilização nova deve usar as variáveis:

| Variável | Uso |
|---|---|
| `--color-primary` | Verde principal (#059669 light / #34d399 dark) |
| `--color-surface` | Fundo da página |
| `--color-surface-2` | Cards / sidebar |
| `--color-surface-3` | Inputs / hover states |
| `--color-border` | Bordas |
| `--color-text` | Texto principal |
| `--color-text-secondary` | Texto secundário |
| `--color-text-muted` | Texto desabilitado/placeholder |
| `--color-danger` | Vermelho de erros/deletar |

Classes CSS reutilizáveis definidas em `globals.css`: `.glass-card`, `.btn-primary`, `.input-field`, `.input-label`, `.badge`, `.stat-card`, `.stat-card-emerald`, `.stat-card-rose`, `.stat-card-indigo`.

---

## Rotas da API — mapa completo

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/usuarios/registrar` | Pública | Registrar usuário |
| POST | `/api/usuarios/login` | Pública | Login |
| GET | `/api/usuarios` | Auth | Listar todos |
| GET/PUT/DELETE | `/api/usuarios/[id]` | Auth | CRUD usuário |
| POST | `/api/despesas` | Auth | Criar despesa/parcelamento |
| GET | `/api/despesas/usuario/[id]` | Auth | Listar despesas (filtros: mes, ano, categoria, idConta) |
| GET | `/api/despesas/usuario/[id]/total` | Auth | Soma de despesas |
| GET | `/api/despesas/usuario/[id]/categorias` | Auth | Agrupado por categoria |
| GET | `/api/despesas/usuario/[id]/top` | Auth | Top N despesas |
| GET | `/api/despesas/usuario/[id]/exportar-csv` | Auth | Export CSV |
| PUT/DELETE | `/api/despesas/[id]` | Auth | Atualizar/deletar despesa |
| POST | `/api/rendas` | Auth | Criar renda |
| GET | `/api/rendas/usuario/[id]` | Auth | Listar rendas |
| GET | `/api/rendas/usuario/[id]/total` | Auth | Soma rendas |
| PUT/DELETE | `/api/rendas/[id]` | Auth | CRUD renda |
| POST | `/api/contas-cartoes` | Auth | Criar conta/cartão |
| GET | `/api/contas-cartoes/usuario/[id]` | Auth | Listar contas |
| PUT/DELETE | `/api/contas-cartoes/[id]` | Auth | CRUD conta |
| POST | `/api/reservas` | Auth | Criar reserva |
| GET | `/api/reservas/usuario/[id]` | Auth | Listar reservas |
| PUT/DELETE | `/api/reservas/[id]` | Auth | CRUD reserva |
| POST | `/api/reservas/[id]/adicionar` | Auth | Adicionar valor à reserva |
| POST | `/api/reservas/[id]/retirar` | Auth | Retirar valor da reserva |
| GET | `/api/dashboard/usuario/[id]/resumo-mensal` | Auth | Resumo mensal (params: mes, ano) |
| GET | `/api/dashboard/usuario/[id]/relatorio-anual` | Auth | Relatório anual (param: ano) |
| GET | `/api/dashboard/usuario/[id]/relatorio-anual/csv` | Auth | Relatório anual CSV |
| GET | `/api/admin/stats` | Admin | Estatísticas do sistema |
| GET | `/api/admin/usuarios` | Admin | Listar todos os usuários |
| GET/DELETE | `/api/admin/usuarios/[id]` | Admin | Buscar/deletar usuário |
| PUT | `/api/admin/usuarios/[id]/cargo` | Admin | Alterar cargo (`'usuario'` ou `'admin'`) |
| POST | `/api/admin/setup` | Pública* | Criar primeiro admin (bloqueado se já existe admin) |
| GET | `/api/health` | Pública | Health check |

---

## Banco de dados — schema resumido

```
usuario          — id_usuario (UUID PK), nome, email (UNIQUE), senha, cargo, data_criacao
membro_familia   — id_membro, id_usuario (FK→usuario CASCADE), nome_membro, parentesco
conta_cartao     — id_conta, id_usuario (FK→usuario CASCADE), nome_conta, tipo, titular, ultimos_digitos, cor_hex
renda            — id_renda, id_usuario (FK), descricao_renda, valor_renda, data
parcelamento_agrupador — id_parcelamento, id_usuario (FK), descricao_parcela, valor_total, qtd_parcelas, data_inicio
despesa          — id_despesa, id_usuario (FK), id_conta (FK), id_parcelamento (FK nullable), descricao_despesa, valor_parcela, data, categoria, numero_parcela
reserva          — id_reserva, id_usuario (FK), nome_objetivo, valor_alvo, valor_atual, data_limite
```

Todas as FK de `id_usuario` têm `ON DELETE CASCADE`. Deletar um `parcelamento_agrupador` cascateia para `despesa`.
