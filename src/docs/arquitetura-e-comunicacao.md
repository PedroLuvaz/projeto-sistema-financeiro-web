# Arquitetura e Comunicação — Finance App

Este documento descreve como a aplicação é estruturada e como o frontend se comunica com o backend, para facilitar o onboarding da equipe.

---

## Visão Geral

O sistema é uma aplicação **Next.js full-stack** — o frontend e o backend rodam no mesmo processo. Não há um servidor separado: as rotas de API ficam dentro da própria pasta do projeto.

```
Browser (React)
     ↕  HTTP (Axios)
API Routes (Next.js — /src/app/api/**)
     ↕
Controllers → Services → Models (Sequelize)
     ↕
PostgreSQL (Neon Cloud)
```

**Stack:**
| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Next.js 15 App Router |
| Estilização | Tailwind CSS 4 |
| Gráficos | Recharts |
| HTTP Client | Axios |
| Backend (API) | Next.js Route Handlers |
| Autenticação | JWT (jsonwebtoken) |
| ORM | Sequelize 6 |
| Banco de dados | PostgreSQL (Neon) |
| Criptografia | bcryptjs |
| Email | Nodemailer |

---

## Estrutura de Pastas

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # Rotas de API (backend)
│   │   ├── _helpers/
│   │   │   └── routeHandler.js # Wrapper central de autenticação e erros
│   │   ├── usuarios/
│   │   │   ├── login/route.js
│   │   │   ├── registrar/route.js
│   │   │   └── [id]/route.js
│   │   ├── despesas/
│   │   │   ├── route.js        # POST /api/despesas
│   │   │   ├── [id]/route.js   # GET/PUT/DELETE /api/despesas/:id
│   │   │   └── usuario/
│   │   │       └── [idUsuario]/
│   │   │           ├── route.js
│   │   │           ├── total/route.js
│   │   │           ├── categorias/route.js
│   │   │           └── exportar-csv/route.js
│   │   ├── contas-cartoes/
│   │   ├── rendas/
│   │   ├── parcelamentos/
│   │   ├── reservas/
│   │   ├── membros-familia/
│   │   ├── dashboard/
│   │   ├── importar-csv/
│   │   ├── admin/
│   │   └── health/
│   ├── login/page.jsx          # Tela de login
│   ├── despesas/page.jsx       # Tela de despesas
│   ├── contas/page.jsx         # Tela de contas
│   ├── rendas/page.jsx
│   ├── parcelamentos/page.jsx
│   ├── reservas/page.jsx
│   └── page.jsx                # Dashboard principal
├── config/
│   ├── env.js                  # Leitura das variáveis de ambiente
│   └── database.js             # Conexão Sequelize com PostgreSQL
├── contexts/
│   └── AuthContext.jsx         # Estado global de autenticação
├── controllers/
│   ├── usuarioController.js
│   ├── despesaController.js
│   ├── contaCartaoController.js
│   ├── rendaController.js
│   ├── parcelamentoController.js
│   ├── reservaController.js
│   ├── membroFamiliaController.js
│   ├── dashboardController.js
│   └── importacaoController.js
├── middleware/
│   └── auth.js                 # Verificação do JWT
├── models/
│   ├── index.js                # Inicialização e associações
│   ├── Usuario.js
│   ├── ContaCartao.js
│   ├── Despesa.js
│   ├── ParcelamentoAgrupador.js
│   ├── Renda.js
│   ├── Reserva.js
│   └── MembroFamilia.js
├── services/
│   ├── usuarioService.js
│   ├── despesaService.js
│   ├── contaCartaoService.js
│   ├── rendaService.js
│   ├── parcelamentoService.js
│   ├── reservaService.js
│   ├── membroFamiliaService.js
│   ├── dashboardService.js
│   └── importacaoService.js
├── services/
│   └── api.js                  # Cliente Axios configurado
└── utils/
    └── helpers.js              # Formatadores e constantes
```

---

## As 4 Camadas do Backend

O backend segue uma arquitetura em camadas. Cada camada tem uma responsabilidade única.

```
Route Handler  →  Controller  →  Service  →  Model (Sequelize)
    (HTTP)         (input)       (lógica)     (banco de dados)
```

### Camada 1 — Route Handler (src/app/api/**/route.js)

Responsável por receber a requisição HTTP e devolvê-la como resposta HTTP. Não contém lógica de negócio.

Todo route handler usa o `handleRequest()` que centraliza autenticação, tratamento de erros e formatação da resposta.

```js
// src/app/api/despesas/route.js
import { handleRequest } from '@/app/api/_helpers/routeHandler'
import despesaController from '@/controllers/despesaController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return despesaController.criar(body)
  })
  // auth: true por padrão — exige Bearer token
}

export async function GET(request) {
  return handleRequest(request, async (req) => {
    // ...
  }, { auth: false }) // rota pública
}
```

### Camada 2 — routeHandler.js (src/app/api/_helpers/routeHandler.js)

O coração do pipeline de API. Toda requisição passa por aqui.

```
Requisição HTTP
       ↓
┌─────────────────────────────┐
│       handleRequest()        │
│                              │
│  1. Verificar token JWT      │
│     (se auth: true)          │
│  2. Verificar cargo admin    │
│     (se adminOnly: true)     │
│  3. Chamar o handler         │
│  4. Formatar resposta        │
│     { success: true, data }  │
│  5. Capturar erros           │
│     { success: false, error }│
└─────────────────────────────┘
       ↓
Resposta HTTP
```

```js
async function handleRequest(request, handler, { auth = true, adminOnly = false } = {}) {
  try {
    if (auth || adminOnly) {
      const authResult = verificarToken(request)
      if (!authResult.success) {
        return NextResponse.json(
          { success: false, error: authResult.error },
          { status: 401 }
        )
      }
      // Injeta dados do usuário autenticado na requisição
      request.usuarioId = authResult.usuarioId
      request.usuarioCargo = authResult.usuarioCargo

      if (adminOnly && authResult.usuarioCargo !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Acesso restrito a administradores' },
          { status: 403 }
        )
      }
    }

    const result = await handler(request)

    // Resposta CSV tem tratamento especial
    if (result.isCSV) {
      return new Response(result.data, {
        headers: { 'Content-Type': 'text/csv; charset=utf-8' }
      })
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: result.status }
    )
  } catch (error) {
    const status = error.status || error.statusCode || 500
    return NextResponse.json(
      { success: false, error: error.message },
      { status }
    )
  }
}
```

### Camada 3 — Controller (src/controllers/)

Recebe os dados da requisição, valida os campos obrigatórios, chama o service e retorna `{ status, data }`.

```js
// src/controllers/despesaController.js
async criar(body) {
  // Valida campos obrigatórios
  if (!body.Id_Usuario || !body.Id_Conta) {
    const error = new Error('Id_Usuario e Id_Conta são obrigatórios')
    error.status = 400
    throw error
  }

  // Delega para o service
  const resultado = await despesaService.criar(body)

  // Retorna no formato que o handleRequest espera
  return { status: 201, data: resultado }
}
```

### Camada 4 — Service (src/services/)

Contém toda a lógica de negócio. Faz queries no banco, aplica regras, usa transações quando necessário.

```js
// src/services/despesaService.js
async criar(dados) {
  const numeroParcelas = dados.Numero_Parcelas || 1

  // Despesa avulsa
  if (numeroParcelas <= 1) {
    const despesa = await Despesa.create({ ...dados, Numero_Parcela: 1 })
    return await this.buscarPorId(despesa.Id_Despesa)
  }

  // Despesa parcelada: usa transação para garantir consistência
  const transaction = await sequelize.transaction()
  try {
    const valorParcela = (dados.Valor_Total / numeroParcelas).toFixed(2)

    const parcelamento = await ParcelamentoAgrupador.create({
      Id_Usuario: dados.Id_Usuario,
      Descricao_Parcela: dados.Descricao_Despesa,
      Valor_Total: dados.Valor_Total,
      Qtd_Parcelas: numeroParcelas,
      Data_Inicio: dados.Data
    }, { transaction })

    const despesas = []
    for (let i = 0; i < numeroParcelas; i++) {
      const data = new Date(dados.Data)
      data.setMonth(data.getMonth() + i)

      const despesa = await Despesa.create({
        Id_Usuario: dados.Id_Usuario,
        Id_Conta: dados.Id_Conta,
        Id_Parcelamento: parcelamento.Id_Parcelamento,
        Descricao_Despesa: dados.Descricao_Despesa,
        Valor_Parcela: valorParcela,
        Data: data.toISOString().split('T')[0],
        Categoria: dados.Categoria,
        Numero_Parcela: i + 1
      }, { transaction })

      despesas.push(despesa)
    }

    await transaction.commit()
    return { parcelamento, despesas }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

---

## Autenticação JWT

O sistema usa **JSON Web Tokens (JWT)** para autenticar requisições.

### Como funciona

```
1. Usuário faz login
        ↓
2. API valida email + senha (bcryptjs)
        ↓
3. API gera token JWT com payload:
   { id, email, cargo }
   Expira em: 7 dias
        ↓
4. Frontend salva token no localStorage
        ↓
5. Toda requisição seguinte inclui:
   Authorization: Bearer eyJhbGci...
        ↓
6. handleRequest() verifica o token
        ↓
7. Se válido: request.usuarioId fica disponível
   Se inválido/expirado: retorna 401
```

### Middleware de verificação (src/middleware/auth.js)

```js
function verificarToken(request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) return { success: false, error: 'Token não fornecido', status: 401 }

  const [scheme, token] = authHeader.split(' ')

  if (!/^Bearer$/i.test(scheme)) return { success: false, error: 'Token mal formatado', status: 401 }

  try {
    const decoded = jwt.verify(token, env.jwt.secret)
    return {
      success: true,
      usuarioId: decoded.id,
      usuarioEmail: decoded.email,
      usuarioCargo: decoded.cargo
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return { success: false, error: 'Token expirado', status: 401 }
    return { success: false, error: 'Token inválido', status: 401 }
  }
}
```

### Erros possíveis de autenticação

| Código | Erro | Causa |
|---|---|---|
| 401 | Token não fornecido | Header Authorization ausente |
| 401 | Token mal formatado | Formato inválido (não `Bearer <token>`) |
| 401 | Token expirado | Passou de 7 dias desde o login |
| 401 | Token inválido | Assinatura inválida ou token corrompido |
| 403 | Acesso restrito a administradores | Cargo do usuário não é `admin` |

---

## Frontend — Como a API é Consumida

### Cliente Axios (src/services/api.js)

Todas as chamadas ao backend passam por um cliente Axios centralizado:

```js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',                              // prefixo de todas as URLs
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token automaticamente em TODA requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Trata 401 globalmente: limpa sessão e redireciona para login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

**Isso significa:** o desenvolvedor nunca precisa adicionar o token manualmente. Basta importar `api` e fazer a chamada.

### Contexto de Autenticação (src/contexts/AuthContext.jsx)

Gerencia o estado do usuário logado globalmente via React Context:

```js
// Como usar em qualquer componente/página:
const { user, login, logout } = useAuth()

// user contém:
// { Id_Usuario, Nome, Email, Cargo, Email_Verificado }
```

**Fluxo de login:**

```js
const login = async (email, senha) => {
  const res = await api.post('/usuarios/login', { Email: email, Senha: senha })
  const { token, usuario } = res.data.data

  localStorage.setItem('token', token)        // persiste entre recargas
  localStorage.setItem('user', JSON.stringify(usuario))
  setUser(usuario)                             // atualiza estado global
  return usuario
}
```

**Fluxo de logout:**

```js
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  setUser(null)
  router.push('/login')
}
```

**Proteção de rotas:** as páginas verificam se o usuário está logado e redirecionam se necessário:

```js
useEffect(() => {
  if (!loading && !user) router.push('/login')
}, [user, loading])
```

### Exemplos de Chamadas nas Páginas

**Dashboard — buscar resumo mensal:**
```js
const { data } = await api.get(`/dashboard/usuario/${user.Id_Usuario}/resumo-mensal`, {
  params: { mes, ano }
})
// URL final: GET /api/dashboard/usuario/uuid.../resumo-mensal?mes=3&ano=2026
```

**Despesas — buscar com filtros:**
```js
const { data } = await api.get(`/despesas/usuario/${user.Id_Usuario}`, {
  params: { mes, ano, categoria, idConta }
})
```

**Despesas — criar parcelada:**
```js
const { data } = await api.post('/despesas', {
  Id_Usuario: user.Id_Usuario,
  Id_Conta: contaId,
  Descricao_Despesa: 'iPhone 15',
  Valor_Total: 6000,
  Numero_Parcelas: 12,
  Data: '2026-03-13',
  Categoria: 'Eletrônicos'
})
```

**Despesas — exportar CSV:**
```js
const { data } = await api.get(`/despesas/usuario/${user.Id_Usuario}/exportar-csv`, {
  params: { mes, ano },
  responseType: 'blob'    // importante para arquivos
})
const url = URL.createObjectURL(new Blob([data]))
// cria link de download...
```

**Despesas — deletar parcelamento inteiro:**
```js
await api.delete(`/despesas/${despesaId}?deletarParcelamento=true`)
```

---

## Fluxo Completo de uma Requisição

Exemplo: usuário cria uma despesa parcelada.

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER                                                     │
│                                                             │
│  api.post('/despesas', { ...body })                         │
│       ↓                                                     │
│  Axios interceptor adiciona:                                │
│  Authorization: Bearer eyJhbGci...                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST /api/despesas
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS ROUTE HANDLER                                       │
│  src/app/api/despesas/route.js                              │
│                                                             │
│  export async function POST(request) {                      │
│    return handleRequest(request, async (req) => {           │
│      const body = await req.json()                          │
│      return despesaController.criar(body)                   │
│    })                                                       │
│  }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  ROUTE HANDLER WRAPPER                                       │
│  src/app/api/_helpers/routeHandler.js                       │
│                                                             │
│  1. verificarToken(request)                                 │
│     → jwt.verify(token, secret)                            │
│     → OK: request.usuarioId = decoded.id                   │
│                                                             │
│  2. Chama o handler passado                                 │
│  3. Formata { success: true, data: resultado }              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLER                                                  │
│  src/controllers/despesaController.js                       │
│                                                             │
│  criar(body):                                               │
│  - Valida campos obrigatórios                               │
│  - Chama despesaService.criar(body)                         │
│  - Retorna { status: 201, data: resultado }                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  SERVICE                                                     │
│  src/services/despesaService.js                             │
│                                                             │
│  criar(dados):                                              │
│  - Numero_Parcelas > 1?                                     │
│    → Inicia transaction no PostgreSQL                       │
│    → Cria ParcelamentoAgrupador                             │
│    → Loop: cria N Despesas (datas incrementando por mês)    │
│    → Commit transaction                                     │
│  - Retorna { parcelamento, despesas[] }                     │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  MODEL / BANCO DE DADOS                                      │
│  Sequelize → PostgreSQL (Neon)                              │
│                                                             │
│  INSERT INTO parcelamento_agrupador (...)                   │
│  INSERT INTO despesa (...) × N                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
         HTTP 201 { success: true, data: { parcelamento, despesas } }
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  BROWSER                                                     │
│  res.data.data → { parcelamento, despesas }                 │
│  Atualiza estado React → re-render da tela                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Banco de Dados

### Conexão

O banco é **PostgreSQL hospedado no Neon** (cloud). A conexão é feita via Sequelize com SSL habilitado:

```js
// src/config/database.js
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
})
```

### Entidades e Relacionamentos

```
Usuario
  ├── ContaCartao (1:N) — cascade delete
  ├── Despesa (1:N) — cascade delete
  ├── Renda (1:N) — cascade delete
  ├── ParcelamentoAgrupador (1:N) — cascade delete
  │     └── Despesa (1:N) — cascade delete
  ├── Reserva (1:N) — cascade delete
  └── MembroFamilia (1:N) — cascade delete

ContaCartao
  └── Despesa (1:N)
```

**Cascade delete:** deletar um usuário remove automaticamente TODOS os seus dados. O mesmo vale para um parcelamento — deletá-lo remove todas as despesas vinculadas.

### Modelos e campos principais

| Modelo | Chave Primária | Campos Principais |
|---|---|---|
| `Usuario` | `Id_Usuario` (UUID) | `Nome`, `Email`, `Senha` (hash), `Cargo`, `Email_Verificado` |
| `ContaCartao` | `Id_Conta` (UUID) | `Nome_Conta`, `Tipo`, `Titular`, `Cor_Hex` |
| `Despesa` | `Id_Despesa` (UUID) | `Descricao_Despesa`, `Valor_Parcela`, `Data`, `Categoria`, `Numero_Parcela` |
| `Renda` | `Id_Renda` (UUID) | `Descricao_Renda`, `Valor_Renda`, `Data`, `Fixa`, `Dia_Vencimento` |
| `ParcelamentoAgrupador` | `Id_Parcelamento` (UUID) | `Descricao_Parcela`, `Valor_Total`, `Qtd_Parcelas`, `Data_Inicio` |
| `Reserva` | `Id_Reserva` (UUID) | `Nome_Objetivo`, `Valor_Alvo`, `Valor_Atual`, `Data_Limite` |
| `MembroFamilia` | `Id_Membro` (UUID) | `Nome_Membro`, `Parentesco` |

---

## Variáveis de Ambiente

O arquivo `.env` na raiz do projeto configura:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_HOST` | Host do PostgreSQL | `ep-xxx.neon.tech` |
| `DB_PORT` | Porta | `5432` |
| `DB_NAME` | Nome do banco | `financas` |
| `DB_USER` | Usuário | `financeapp_owner` |
| `DB_PASSWORD` | Senha | `...` |
| `DB_SSL` | Usar SSL | `true` |
| `JWT_SECRET` | Chave de assinatura do JWT | `sua-chave-secreta` |
| `JWT_EXPIRES_IN` | Validade do token | `7d` |
| `EMAIL_USER` | Email para envio | `app@email.com` |
| `EMAIL_PASS` | Senha do email | `...` |

---

## Formato Padrão de Resposta

**Toda** resposta da API segue este contrato:

```json
// Sucesso
{
  "success": true,
  "data": { ... }
}

// Erro
{
  "success": false,
  "error": "Mensagem descritiva do erro"
}
```

### Códigos HTTP utilizados

| Código | Situação |
|---|---|
| `200` | Operação bem-sucedida (GET, PUT, DELETE) |
| `201` | Recurso criado com sucesso (POST) |
| `400` | Dados inválidos ou campos obrigatórios faltando |
| `401` | Token ausente, expirado ou inválido |
| `403` | Sem permissão (ex: rota de admin) |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: email já cadastrado) |
| `500` | Erro interno do servidor |

---

## Regras de Negócio Importantes

### Registro de usuário
- Após registrar, o usuário recebe um código de 6 dígitos por email
- O código expira em 15 minutos
- O usuário só consegue fazer login após verificar o email

### Despesas parceladas
- Quando `Numero_Parcelas > 1`, o sistema cria um `ParcelamentoAgrupador` e N despesas automaticamente
- As datas das parcelas incrementam mensalmente a partir da data informada
- Tudo é feito em uma **transação de banco** — ou tudo é criado, ou nada é

### Rendas fixas
- Quando `Fixa: true`, o sistema cria **12 registros mensais** automaticamente
- O `Dia_Vencimento` define o dia de cada mês; se omitido, usa o dia da `Data`
- Se o dia não existir no mês (ex: dia 31 em fevereiro), usa o último dia do mês

### Deletar em cascata
- Deletar um usuário remove todos os seus dados
- Deletar um parcelamento remove todas as parcelas (despesas) vinculadas
- Deletar uma despesa com `?deletarParcelamento=true` remove o parcelamento inteiro

### Importação de CSV
- Fluxo em 4 etapas: Preview → Processar → Confirmar → (Desfazer)
- Detecta parcelamentos automaticamente pela notação `DESCRIÇÃO 05/12`
- Categoriza despesas automaticamente por palavras-chave na descrição

---

## Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Criar o arquivo .env com as variáveis necessárias
# (ver seção Variáveis de Ambiente)

# Rodar em desenvolvimento
npm run dev
# Disponível em: http://localhost:3000

# Build para produção
npm run build
npm start
```

---

## Referências

- [Coleção Postman](../finance-app.postman_collection.json) — todos os endpoints documentados com exemplos
- [Next.js App Router](https://nextjs.org/docs/app) — documentação das rotas de API
- [Sequelize](https://sequelize.org/docs/v6/) — ORM utilizado
- [JWT](https://jwt.io/) — padrão de autenticação
