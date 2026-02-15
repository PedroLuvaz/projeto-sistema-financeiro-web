# API Backend - Sistema Financeiro

Backend completo para sistema de controle financeiro pessoal construído com Node.js, Express e Sequelize ORM.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **bcrypt** - Hash de senhas
- **dotenv** - Variáveis de ambiente

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

## ⚙️ Configuração

O arquivo `.env` já está configurado com as credenciais do banco Neon PostgreSQL:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DB_HOST=ep-twilight-pine-acanxv4x-pooler.sa-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=financas
DB_USER=financeapp_owner
DB_PASSWORD=npg_QI3Ny0atmMeD
DB_SSL=true
```

## 🗄️ Configuração do Banco de Dados

### 1. Criar as tabelas

Execute o script SQL no seu banco de dados:

```bash
# O script está em: src/database/schemas/create-tables.sql
```

Ou use sua ferramenta de gerenciamento PostgreSQL favorita para executar o SQL.

### 2. Popular com dados de exemplo (Seed)

```bash
npm run seed
```

Este comando irá:
- Criar 2 usuários de exemplo
- Adicionar membros da família
- Criar contas e cartões
- Adicionar rendas, despesas e reservas de exemplo

**Credenciais criadas:**
- Email: `joao.silva@email.com` | Senha: `senha123`
- Email: `maria.santos@email.com` | Senha: `senha123`

## 🏃‍♂️ Executar

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📚 Estrutura da API

### Base URL
```
http://localhost:3001/api
```

### Endpoints Disponíveis

#### 👤 Usuários (`/api/usuarios`)
- `POST /` - Criar usuário
- `GET /` - Listar todos os usuários
- `GET /:id` - Buscar usuário por ID
- `PUT /:id` - Atualizar usuário
- `DELETE /:id` - Deletar usuário

#### 👨‍👩‍👧‍👦 Membros da Família (`/api/membros-familia`)
- `POST /` - Criar membro
- `GET /usuario/:idUsuario` - Listar membros de um usuário
- `GET /:id` - Buscar membro por ID
- `PUT /:id` - Atualizar membro
- `DELETE /:id` - Deletar membro

#### 💳 Contas e Cartões (`/api/contas-cartoes`)
- `POST /` - Criar conta/cartão
- `GET /usuario/:idUsuario` - Listar contas de um usuário
  - Query params: `?tipo=Corrente|Crédito|Dinheiro`
- `GET /:id` - Buscar conta por ID
- `PUT /:id` - Atualizar conta
- `DELETE /:id` - Deletar conta

#### 💰 Rendas (`/api/rendas`)
- `POST /` - Criar renda
- `GET /usuario/:idUsuario` - Listar rendas de um usuário
  - Query params: `?dataInicio=2026-01-01&dataFim=2026-12-31`
- `GET /usuario/:idUsuario/total` - Calcular total de rendas
- `GET /:id` - Buscar renda por ID
- `PUT /:id` - Atualizar renda
- `DELETE /:id` - Deletar renda

#### 🔢 Parcelamentos (`/api/parcelamentos`)
- `POST /` - Criar parcelamento
- `GET /usuario/:idUsuario` - Listar parcelamentos de um usuário
- `GET /:id` - Buscar parcelamento por ID (com despesas vinculadas)
- `PUT /:id` - Atualizar parcelamento
- `DELETE /:id` - Deletar parcelamento (deleta despesas em cascade)

#### 💸 Despesas (`/api/despesas`)
- `POST /` - Criar despesa
- `GET /usuario/:idUsuario` - Listar despesas de um usuário
  - Query params: `?dataInicio=2026-01-01&dataFim=2026-12-31&categoria=Alimentação&idConta=uuid`
- `GET /usuario/:idUsuario/total` - Calcular total de despesas
- `GET /usuario/:idUsuario/categorias` - Calcular despesas por categoria
- `GET /:id` - Buscar despesa por ID
- `PUT /:id` - Atualizar despesa
- `DELETE /:id` - Deletar despesa

#### 🎯 Reservas (`/api/reservas`)
- `POST /` - Criar reserva
- `GET /usuario/:idUsuario` - Listar reservas de um usuário (com progresso)
- `GET /:id` - Buscar reserva por ID
- `PUT /:id` - Atualizar reserva
- `PUT /:id/adicionar` - Adicionar valor à reserva
- `PUT /:id/retirar` - Retirar valor da reserva
- `DELETE /:id` - Deletar reserva

#### 🏥 Health Check (`/api/health`)
- `GET /` - Verificar status da API

## 📝 Exemplos de Requisições

### Criar Usuário
```json
POST /api/usuarios
{
  "Nome": "João Silva",
  "Email": "joao@email.com",
  "Senha": "senha123"
}
```

### Criar Conta/Cartão
```json
POST /api/contas-cartoes
{
  "Id_Usuario": "uuid-do-usuario",
  "Nome_Conta": "Nubank",
  "Tipo": "Crédito",
  "Titular": "João Silva",
  "Ultimos_Digitos": "1234",
  "Cor_Hex": "#820AD1"
}
```

### Criar Despesa
```json
POST /api/despesas
{
  "Id_Usuario": "uuid-do-usuario",
  "Id_Conta": "uuid-da-conta",
  "Id_Parcelamento": null,
  "Descricao_Despesa": "Supermercado",
  "Valor_Parcela": 450.00,
  "Data": "2026-02-14",
  "Categoria": "Alimentação",
  "Numero_Parcela": 1
}
```

### Criar Reserva
```json
POST /api/reservas
{
  "Id_Usuario": "uuid-do-usuario",
  "Nome_Objetivo": "Viagem",
  "Valor_Alvo": 5000.00,
  "Valor_Atual": 1000.00,
  "Data_Limite": "2026-12-31"
}
```

## 🏗️ Estrutura do Projeto

```
src/backend/
├── config/           # Configurações (banco, env)
├── controllers/      # Controladores (lógica de requisição)
├── middleware/       # Middlewares (erros, validações)
├── models/           # Models Sequelize (definição das tabelas)
├── routes/           # Rotas da API
├── scripts/          # Scripts utilitários (seed)
├── services/         # Lógica de negócio
├── utils/            # Funções auxiliares
├── app.js           # Configuração do Express
└── server.js        # Inicialização do servidor
```

## 🔐 Segurança

- Senhas são hasheadas com bcrypt (salt rounds: 10)
- CORS configurado
- Helmet para headers de segurança
- Validações no nível do model

## 📊 Models e Relacionamentos

- **Usuario** (1:N com todas as outras entidades)
- **MembroFamilia** (N:1 com Usuario)
- **ContaCartao** (N:1 com Usuario, 1:N com Despesa)
- **Renda** (N:1 com Usuario)
- **ParcelamentoAgrupador** (N:1 com Usuario, 1:N com Despesa)
- **Despesa** (N:1 com Usuario, ContaCartao, ParcelamentoAgrupador)
- **Reserva** (N:1 com Usuario)

## 🧪 Testando a API

### Com curl:
```bash
# Health check
curl http://localhost:3001/api/health

# Listar usuários
curl http://localhost:3001/api/usuarios
```

### Com Postman/Insomnia:
Importe as requisições ou teste manualmente os endpoints listados acima.

## 🐛 Debug

O projeto usa Morgan para logging de requisições HTTP em modo desenvolvimento.

## 📄 Licença

MIT
