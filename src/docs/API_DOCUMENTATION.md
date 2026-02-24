# FinanceApp - Documentação da API

## 🚀 Como acessar a documentação Swagger

### 1. Em desenvolvimento:
```bash
npm run dev
```
Acesse: **http://localhost:3000/api-docs**

### 2. Em produção:
```bash
npm run build
npm run start
```
Acesse: **http://localhost:3000/api-docs**

## 📖 Estrutura da API

A API possui **36 endpoints** organizados em 9 grupos:

### 1. Health (`/api/health`)
- **GET** /health - Verificar status da API e banco de dados

### 2. Usuários (`/api/usuarios`)
- **POST** /registrar - Criar novo usuário (sem autenticação)
- **POST** /login - Fazer login e obter token JWT (sem autenticação)
- **GET** /usuarios - Listar todos usuários
- **GET** /usuarios/{id} - Obter usuário por ID
- **PUT** /usuarios/{id} - Atualizar usuário
- **DELETE** /usuarios/{id} - Deletar usuário

### 3. Membros Família (`/api/membros-familia`)
- **POST** / - Criar membro
- **GET** /usuario/{idUsuario} - Listar membros
- **GET** /{id} - Obter membro por ID
- **PUT** /{id} - Atualizar membro
- **DELETE** /{id} - Deletar membro

### 4. Contas/Cartões (`/api/contas-cartoes`)
- **POST** / - Criar conta/cartão
- **GET** /usuario/{idUsuario} - Listar contas (filtro por tipo opcional)
- **GET** /{id} - Obter conta por ID
- **PUT** /{id} - Atualizar conta
- **DELETE** /{id} - Deletar conta

### 5. Rendas (`/api/rendas`)
- **POST** / - Criar renda
- **GET** /usuario/{idUsuario} - Listar rendas (filtros: mes, ano, busca)
- **GET** /usuario/{idUsuario}/total - Total de rendas do mês
- **GET** /{id} - Obter renda por ID
- **PUT** /{id} - Atualizar renda
- **DELETE** /{id} - Deletar renda

### 6. Despesas (`/api/despesas`)
- **POST** / - Criar despesa (com suporte a parcelamento)
- **GET** /usuario/{idUsuario} - Listar despesas (filtros: mes, ano, categoria, busca)
- **GET** /usuario/{idUsuario}/total - Total de despesas do mês
- **GET** /usuario/{idUsuario}/categorias - Despesas agrupadas por categoria
- **GET** /usuario/{idUsuario}/top - Top 5 maiores despesas
- **GET** /usuario/{idUsuario}/exportar-csv - Exportar CSV
- **GET** /{id} - Obter despesa por ID
- **PUT** /{id} - Atualizar despesa
- **DELETE** /{id} - Deletar despesa (query param: deletarParcelamento)

### 7. Parcelamentos (`/api/parcelamentos`)
- **POST** / - Criar parcelamento
- **GET** /usuario/{idUsuario} - Listar parcelamentos
- **GET** /usuario/{idUsuario}/dividas-futuras - Total de dívidas futuras
- **GET** /usuario/{idUsuario}/cronograma - Cronograma de parcelas
- **GET** /usuario/{idUsuario}/faturas - Faturas por cartão (params: mes, ano)
- **GET** /{id} - Obter parcelamento por ID
- **PUT** /{id} - Atualizar parcelamento
- **DELETE** /{id} - Deletar parcelamento e todas as parcelas

### 8. Reservas (`/api/reservas`)
- **POST** / - Criar reserva/objetivo
- **GET** /usuario/{idUsuario} - Listar reservas
- **GET** /{id} - Obter reserva por ID
- **PUT** /{id} - Atualizar reserva
- **PUT** /{id}/adicionar - Adicionar valor (body: {valor})
- **PUT** /{id}/retirar - Retirar valor (body: {valor})
- **DELETE** /{id} - Deletar reserva

### 9. Dashboard (`/api/dashboard`)
- **GET** /usuario/{idUsuario}/resumo-mensal - Resumo do mês (params: mes, ano)
- **GET** /usuario/{idUsuario}/relatorio-anual - Relatório anual (param: ano)
- **GET** /usuario/{idUsuario}/relatorio-anual/csv - Exportar relatório CSV

## 🔐 Autenticação

Todos os endpoints exceto `/usuarios/registrar` e `/usuarios/login` requerem autenticação via **Bearer Token JWT**.

### Como obter o token:

```bash
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "senha": "suaSenha"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "Id_Usuario": "uuid",
      "Nome": "Seu Nome",
      "Email": "seu@email.com"
    }
  }
}
```

### Como usar o token:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Exemplos de Uso

### PowerShell

```powershell
# 1. Registrar usuário
Invoke-RestMethod -Uri "http://localhost:3000/api/usuarios/registrar" `
  -Method POST -ContentType "application/json" `
  -Body (@{ nome="João"; email="joao@email.com"; senha="senha123" } | ConvertTo-Json)

# 2. Login
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/usuarios/login" `
  -Method POST -ContentType "application/json" `
  -Body (@{ email="joao@email.com"; senha="senha123" } | ConvertTo-Json)

$token = $login.data.token
$userId = $login.data.usuario.Id_Usuario

# 3. Listar contas (autenticado)
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/contas-cartoes/usuario/$userId" `
  -Method GET -Headers $headers | ConvertTo-Json -Depth 5

# 4. Criar despesa
Invoke-RestMethod -Uri "http://localhost:3000/api/despesas" `
  -Method POST -Headers $headers -ContentType "application/json" `
  -Body (@{
    Id_Usuario=$userId
    Id_Conta="uuid-da-conta"
    Descricao_Despesa="Mercado"
    Valor_Parcela=150.50
    Categoria="Alimentação"
    Data="2026-02-16"
  } | ConvertTo-Json)

# 5. Obter resumo mensal
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/usuario/$userId/resumo-mensal?mes=2&ano=2026" `
  -Method GET -Headers $headers | ConvertTo-Json -Depth 5
```

### cURL (Linux/Mac/Git Bash)

```bash
# 1. Registrar
curl -X POST http://localhost:3000/api/usuarios/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@email.com","senha":"senha123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","senha":"senha123"}' \
  | jq -r '.data.token')

# 3. Listar despesas
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/despesas/usuario/UUID?mes=2&ano=2026"

# 4. Exportar CSV
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/despesas/usuario/UUID/exportar-csv?mes=2&ano=2026" \
  -o despesas.csv
```

## 📊 Modelos de Dados

### Usuario
```json
{
  "Id_Usuario": "uuid",
  "Nome": "string",
  "Email": "string",
  "Senha_Hash": "string (bcryptjs)",
  "Data_Criacao": "datetime"
}
```

### ContaCartao
```json
{
  "Id_Conta": "uuid",
  "Id_Usuario": "uuid",
  "Nome_Conta": "string",
  "Tipo": "enum (Conta Corrente | Cartão de Crédito | Poupança | Conta Digital)",
  "Ultimos_Digitos": "string",
  "Limite_Credito": "number (nullable)",
  "Cor_Hex": "string (#RRGGBB)"
}
```

### Despesa
```json
{
  "Id_Despesa": "uuid",
  "Id_Usuario": "uuid",
  "Id_Conta": "uuid",
  "Descricao_Despesa": "string",
  "Valor_Parcela": "number",
  "Categoria": "string",
  "Data": "date",
  "Id_Parcelamento": "uuid (nullable)",
  "Numero_Parcela": "integer (nullable)"
}
```

### Parcelamento
```json
{
  "Id_Parcelamento": "uuid",
  "Id_Usuario": "uuid",
  "Descricao_Parcela": "string",
  "Valor_Total": "number",
  "Qtd_Parcelas": "integer",
  "Data_Inicio": "date"
}
```

### Reserva
```json
{
  "Id_Reserva": "uuid",
  "Id_Usuario": "uuid",
  "Nome_Objetivo": "string",
  "Valor_Alvo": "number",
  "Valor_Atual": "number",
  "Data_Limite": "date (nullable)"
}
```

## 🔧 Tecnologias Utilizadas

- **Framework:** Next.js 15.3.4 (App Router)
- **Autenticação:** JWT (jsonwebtoken 9.0.3)
- **Hash de Senha:** bcryptjs 3.0.2
- **Database:** PostgreSQL + Sequelize 6.37.7
- **Documentação:** Swagger UI React + OpenAPI 3.0
- **Frontend:** React 19.1.0, Recharts 2.15.3, TailwindCSS v4

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database (PostgreSQL)
DB_HOST=seu-host.neon.tech
DB_PORT=5432
DB_NAME=financas
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_SSL=true

# JWT
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d

# Node
NODE_ENV=development
```

## 🚀 Deploy

### Vercel (Recomendado para Next.js)
```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente no dashboard da Vercel.

### Docker
```bash
docker build -t financeapp .
docker run -p 3000:3000 --env-file .env.local financeapp
```

## 📞 Suporte

- **Email:** suporte@financeapp.com
- **Documentação Interativa:** http://localhost:3000/api-docs
- **Repositório:** [GitHub Link]

---

**Desenvolvido com ❤️ usando Next.js + PostgreSQL**
