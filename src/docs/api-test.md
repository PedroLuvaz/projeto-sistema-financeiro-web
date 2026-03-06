# 🧪 Guia de Testes de API — FinanceApp (Postman)

> **Base URL:** `http://localhost:3000/api`
> **Formato:** Todos os bodies são `JSON` (`Content-Type: application/json`)
> **Auth:** Após o login, copie o `token` e use como `Authorization: Bearer <token>` nos endpoints protegidos

---

## Sumário

1. [Configuração inicial no Postman](#1-configuração-inicial-no-postman)
2. [Health Check](#2-health-check)
3. [Usuários — Cadastro e Autenticação](#3-usuários--cadastro-e-autenticação)
4. [Contas e Cartões](#4-contas-e-cartões)
5. [Rendas](#5-rendas)
6. [Despesas](#6-despesas)
7. [Parcelamentos](#7-parcelamentos)
8. [Reservas](#8-reservas)
9. [Membros da Família](#9-membros-da-família)
10. [Dashboard](#10-dashboard)
11. [Importação CSV](#11-importação-csv)
12. [Admin](#12-admin)
13. [Fluxo completo passo a passo](#13-fluxo-completo-passo-a-passo)

---

## 1. Configuração inicial no Postman

### Criando uma variável de ambiente

1. No Postman, clique em **Environments** → **New Environment**
2. Nomeie como `FinanceApp Local`
3. Adicione as variáveis:

| Variável     | Initial Value                  |
|--------------|-------------------------------|
| `base_url`   | `http://localhost:3000/api`   |
| `token`      | *(deixe vazio por enquanto)*  |
| `usuario_id` | *(deixe vazio por enquanto)*  |
| `conta_id`   | *(deixe vazio por enquanto)*  |

4. Ative o ambiente clicando no seletor no canto superior direito

### Salvando o token automaticamente

No request de **Login**, vá em **Tests** e cole:

```javascript
const json = pm.response.json();
if (json.data && json.data.token) {
    pm.environment.set("token", json.data.token);
    pm.environment.set("usuario_id", json.data.usuario.Id_Usuario);
}
```

### Header de autenticação

Em todos os requests protegidos, vá em **Authorization**:
- Type: `Bearer Token`
- Token: `{{token}}`

---

## 2. Health Check

### GET — Verificar se a API está no ar

```
GET {{base_url}}/health
```

**Resposta esperada (200):**
```json
{ "status": "ok" }
```

---

## 3. Usuários — Cadastro e Autenticação

### 3.1 Registrar novo usuário

```
POST {{base_url}}/usuarios/registrar
```

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta esperada (201):**
```json
{
  "data": {
    "mensagem": "Usuário registrado. Verifique seu e-mail."
  }
}
```

> Um código de 6 dígitos será enviado para o e-mail informado.
> Em modo dev (sem EMAIL_USER configurado), o código aparece no terminal do servidor.

---

### 3.2 Verificar e-mail

```
POST {{base_url}}/usuarios/verificar-email
```

**Body:**
```json
{
  "email": "joao@email.com",
  "codigo": "123456"
}
```

**Resposta esperada (200):**
```json
{
  "data": { "mensagem": "E-mail verificado com sucesso." }
}
```

---

### 3.3 Reenviar código de verificação

```
POST {{base_url}}/usuarios/reenviar-codigo
```

**Body:**
```json
{
  "email": "joao@email.com"
}
```

---

### 3.4 Login ✅

```
POST {{base_url}}/usuarios/login
```

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta esperada (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "Id_Usuario": "uuid-aqui",
      "Nome": "João Silva",
      "Email": "joao@email.com",
      "Cargo": "usuario"
    }
  }
}
```

> Cole o `token` na variável de ambiente `token` e o `Id_Usuario` em `usuario_id`.

---

### 3.5 Buscar usuário por ID

```
GET {{base_url}}/usuarios/{{usuario_id}}
Authorization: Bearer {{token}}
```

---

### 3.6 Atualizar usuário

```
PUT {{base_url}}/usuarios/{{usuario_id}}
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "nome": "João da Silva Atualizado"
}
```

---

### 3.7 Esqueci minha senha

```
POST {{base_url}}/usuarios/esqueci-senha
```

**Body:**
```json
{
  "email": "joao@email.com"
}
```

---

### 3.8 Resetar senha

```
POST {{base_url}}/usuarios/resetar-senha
```

**Body:**
```json
{
  "email": "joao@email.com",
  "codigo": "654321",
  "novaSenha": "novaSenha456"
}
```

---

## 4. Contas e Cartões

> Todos os endpoints abaixo requerem `Authorization: Bearer {{token}}`

### 4.1 Criar conta/cartão

```
POST {{base_url}}/contas-cartoes
```

**Body — Conta Corrente:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Nome_Conta": "Nubank Conta",
  "Tipo": "Corrente",
  "Titular": "João Silva",
  "Cor_Hex": "#8B5CF6"
}
```

**Body — Cartão de Crédito:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Nome_Conta": "Nubank Crédito",
  "Tipo": "Crédito",
  "Titular": "João Silva",
  "Ultimos_Digitos": "1234",
  "Cor_Hex": "#6366F1"
}
```

**Body — Dinheiro:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Nome_Conta": "Carteira",
  "Tipo": "Dinheiro",
  "Titular": "João Silva",
  "Cor_Hex": "#10B981"
}
```

**Tipos válidos:** `"Corrente"`, `"Crédito"`, `"Dinheiro"`

**Resposta esperada (201):**
```json
{
  "data": {
    "Id_Conta": "uuid-da-conta",
    "Nome_Conta": "Nubank Conta",
    ...
  }
}
```

> Salve o `Id_Conta` na variável `conta_id`.

---

### 4.2 Listar contas do usuário

```
GET {{base_url}}/contas-cartoes/usuario/{{usuario_id}}
```

**Query params opcionais:**
- `?tipo=Crédito` — filtra por tipo

---

### 4.3 Buscar conta por ID

```
GET {{base_url}}/contas-cartoes/{{conta_id}}
```

---

### 4.4 Atualizar conta

```
PUT {{base_url}}/contas-cartoes/{{conta_id}}
```

**Body:**
```json
{
  "Nome_Conta": "Nubank Conta Principal",
  "Cor_Hex": "#EC4899"
}
```

---

### 4.5 Deletar conta

```
DELETE {{base_url}}/contas-cartoes/{{conta_id}}
```

---

## 5. Rendas

> Todos os endpoints requerem `Authorization: Bearer {{token}}`

### 5.1 Criar renda

```
POST {{base_url}}/rendas
```

**Body — Renda variável:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Descricao_Renda": "Salário março",
  "Valor_Renda": 3500.00,
  "Data": "2026-03-05",
  "Fixa": false
}
```

**Body — Renda fixa recorrente:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Descricao_Renda": "Salário fixo",
  "Valor_Renda": 3500.00,
  "Data": "2026-03-05",
  "Fixa": true,
  "Dia_Vencimento": 5
}
```

---

### 5.2 Listar rendas do usuário

```
GET {{base_url}}/rendas/usuario/{{usuario_id}}?mes=3&ano=2026
```

**Query params:**
- `mes` — número do mês (1–12)
- `ano` — ano com 4 dígitos

---

### 5.3 Total de rendas no período

```
GET {{base_url}}/rendas/usuario/{{usuario_id}}/total?mes=3&ano=2026
```

---

### 5.4 Atualizar renda

```
PUT {{base_url}}/rendas/{id_renda}
```

**Body:**
```json
{
  "Valor_Renda": 4000.00,
  "Descricao_Renda": "Salário março atualizado"
}
```

---

### 5.5 Deletar renda

```
DELETE {{base_url}}/rendas/{id_renda}
```

**Query params opcionais:**
- `?deletarTodas=true` — deleta todas as ocorrências de uma renda fixa

---

## 6. Despesas

> Todos os endpoints requerem `Authorization: Bearer {{token}}`

### 6.1 Criar despesa (avulsa)

```
POST {{base_url}}/despesas
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Id_Conta": "{{conta_id}}",
  "Descricao_Despesa": "Supermercado",
  "Valor_Parcela": 250.00,
  "Valor_Total": 250.00,
  "Data": "2026-03-05",
  "Categoria": "Alimentação",
  "Numero_Parcelas": 1
}
```

**Categorias válidas comuns:** `"Alimentação"`, `"Transporte"`, `"Saúde"`, `"Lazer"`, `"Moradia"`, `"Educação"`, `"Outros"`

---

### 6.2 Criar despesa parcelada

```
POST {{base_url}}/despesas
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Id_Conta": "{{conta_id}}",
  "Descricao_Despesa": "Notebook Samsung",
  "Valor_Total": 3600.00,
  "Valor_Parcela": 300.00,
  "Data": "2026-03-01",
  "Categoria": "Tecnologia",
  "Numero_Parcelas": 12
}
```

> Isso cria um `ParcelamentoAgrupador` + 12 despesas mensais automaticamente.

---

### 6.3 Listar despesas do usuário

```
GET {{base_url}}/despesas/usuario/{{usuario_id}}?mes=3&ano=2026
```

**Query params disponíveis:**
- `mes` — mês (1–12)
- `ano` — ano
- `categoria` — filtrar por categoria
- `idConta` — filtrar por conta
- `dataInicio` — `YYYY-MM-DD`
- `dataFim` — `YYYY-MM-DD`

---

### 6.4 Total de despesas no período

```
GET {{base_url}}/despesas/usuario/{{usuario_id}}/total?mes=3&ano=2026
```

---

### 6.5 Despesas por categoria

```
GET {{base_url}}/despesas/usuario/{{usuario_id}}/categorias?mes=3&ano=2026
```

---

### 6.6 Top despesas do mês

```
GET {{base_url}}/despesas/usuario/{{usuario_id}}/top?mes=3&ano=2026
```

---

### 6.7 Exportar despesas em CSV

```
GET {{base_url}}/despesas/usuario/{{usuario_id}}/exportar-csv?mes=3&ano=2026
```

> Retorna um arquivo CSV. No Postman, clique em **Save Response → Save to a file**.

---

### 6.8 Atualizar despesa

```
PUT {{base_url}}/despesas/{id_despesa}
```

**Body:**
```json
{
  "Descricao_Despesa": "Supermercado Extra",
  "Valor_Parcela": 280.00,
  "Categoria": "Alimentação"
}
```

---

### 6.9 Deletar despesa

```
DELETE {{base_url}}/despesas/{id_despesa}
```

**Query params opcionais:**
- `?deletarParcelamento=true` — deleta todas as parcelas do parcelamento vinculado

---

## 7. Parcelamentos

> Todos os endpoints requerem `Authorization: Bearer {{token}}`

### 7.1 Criar parcelamento manualmente

```
POST {{base_url}}/parcelamentos
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Id_Conta": "{{conta_id}}",
  "Descricao_Parcela": "TV 55 polegadas",
  "Valor_Total": 2400.00,
  "Qtd_Parcelas": 8,
  "Data_Inicio": "2026-03-01"
}
```

---

### 7.2 Listar parcelamentos do usuário

```
GET {{base_url}}/parcelamentos/usuario/{{usuario_id}}
```

---

### 7.3 Dívidas futuras

```
GET {{base_url}}/parcelamentos/usuario/{{usuario_id}}/dividas-futuras
```

---

### 7.4 Cronograma de pagamentos

```
GET {{base_url}}/parcelamentos/usuario/{{usuario_id}}/cronograma
```

---

### 7.5 Fatura por cartão no mês

```
GET {{base_url}}/parcelamentos/usuario/{{usuario_id}}/faturas?mes=3&ano=2026
```

---

### 7.6 Deletar parcelamento

```
DELETE {{base_url}}/parcelamentos/{id_parcelamento}
```

---

## 8. Reservas

> Todos os endpoints requerem `Authorization: Bearer {{token}}`

### 8.1 Criar reserva (objetivo financeiro)

```
POST {{base_url}}/reservas
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Nome_Objetivo": "Viagem para Europa",
  "Valor_Alvo": 15000.00,
  "Data_Limite": "2027-06-30"
}
```

---

### 8.2 Listar reservas do usuário

```
GET {{base_url}}/reservas/usuario/{{usuario_id}}
```

---

### 8.3 Adicionar valor à reserva

```
POST {{base_url}}/reservas/{id_reserva}/adicionar
```

**Body:**
```json
{
  "valor": 500.00
}
```

---

### 8.4 Retirar valor da reserva

```
POST {{base_url}}/reservas/{id_reserva}/retirar
```

**Body:**
```json
{
  "valor": 100.00
}
```

---

### 8.5 Atualizar reserva

```
PUT {{base_url}}/reservas/{id_reserva}
```

**Body:**
```json
{
  "Nome_Objetivo": "Viagem para Europa e Portugal",
  "Valor_Alvo": 18000.00
}
```

---

### 8.6 Deletar reserva

```
DELETE {{base_url}}/reservas/{id_reserva}
```

---

## 9. Membros da Família

> Todos os endpoints requerem `Authorization: Bearer {{token}}`

### 9.1 Criar membro

```
POST {{base_url}}/membros-familia
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Nome_Membro": "Maria Silva",
  "Parentesco": "Cônjuge"
}
```

---

### 9.2 Listar membros do usuário

```
GET {{base_url}}/membros-familia/usuario/{{usuario_id}}
```

---

### 9.3 Atualizar membro

```
PUT {{base_url}}/membros-familia/{id_membro}
```

**Body:**
```json
{
  "Nome_Membro": "Maria da Silva",
  "Parentesco": "Esposa"
}
```

---

### 9.4 Deletar membro

```
DELETE {{base_url}}/membros-familia/{id_membro}
```

---

## 10. Dashboard

> Todos os endpoints requerem `Authorization: Bearer {{token}}`

### 10.1 Resumo financeiro mensal

```
GET {{base_url}}/dashboard/usuario/{{usuario_id}}/resumo-mensal?mes=3&ano=2026
```

**Resposta esperada (200):**
```json
{
  "data": {
    "totalRendas": 3500.00,
    "totalDespesas": 1800.00,
    "saldo": 1700.00,
    "despesasPorCategoria": [
      { "categoria": "Alimentação", "total": 500.00 },
      { "categoria": "Transporte", "total": 300.00 }
    ]
  }
}
```

---

### 10.2 Relatório anual

```
GET {{base_url}}/dashboard/usuario/{{usuario_id}}/relatorio-anual?ano=2026
```

---

### 10.3 Exportar relatório anual em CSV

```
GET {{base_url}}/dashboard/usuario/{{usuario_id}}/relatorio-anual/csv?ano=2026
```

---

## 11. Importação CSV

> Requer `Authorization: Bearer {{token}}`

### 11.1 Processar arquivo CSV

```
POST {{base_url}}/importar-csv/processar
Content-Type: multipart/form-data
```

**No Postman:**
1. Aba **Body** → selecione **form-data**
2. Adicione chave `file` do tipo **File** e selecione o CSV da fatura
3. Adicione chave `Id_Usuario` com valor `{{usuario_id}}`

---

### 11.2 Confirmar importação

```
POST {{base_url}}/importar-csv/confirmar
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}",
  "Id_Conta": "{{conta_id}}"
}
```

---

### 11.3 Desfazer importação

```
POST {{base_url}}/importar-csv/desfazer
```

**Body:**
```json
{
  "Id_Usuario": "{{usuario_id}}"
}
```

---

## 12. Admin

> Requer `Authorization: Bearer {{token}}` de um usuário com `Cargo: "admin"`

### 12.1 Setup inicial do admin

```
POST {{base_url}}/admin/setup
```

**Body:**
```json
{
  "email": "admin@financeapp.com",
  "senha": "admin123",
  "nome": "Administrador"
}
```

---

### 12.2 Estatísticas gerais

```
GET {{base_url}}/admin/stats
```

---

### 12.3 Listar todos os usuários

```
GET {{base_url}}/admin/usuarios
```

---

### 12.4 Buscar usuário por ID (admin)

```
GET {{base_url}}/admin/usuarios/{id}
```

---

### 12.5 Alterar cargo de usuário

```
PUT {{base_url}}/admin/usuarios/{id}/cargo
```

**Body:**
```json
{
  "cargo": "admin"
}
```

**Valores válidos:** `"usuario"`, `"admin"`

---

### 12.6 Deletar usuário (admin)

```
DELETE {{base_url}}/admin/usuarios/{id}
```

---

## 13. Fluxo completo passo a passo

Este é o roteiro recomendado para testar o sistema do zero:

```
Passo 1  → [POST] /usuarios/registrar        — Criar conta
Passo 2  → verificar código no terminal (dev) ou no e-mail
Passo 3  → [POST] /usuarios/verificar-email  — Confirmar e-mail
Passo 4  → [POST] /usuarios/login            — Logar e salvar token
Passo 5  → [POST] /contas-cartoes            — Criar conta corrente
Passo 6  → [POST] /contas-cartoes            — Criar cartão de crédito
Passo 7  → [POST] /rendas                    — Cadastrar salário do mês
Passo 8  → [POST] /despesas                  — Cadastrar despesa avulsa
Passo 9  → [POST] /despesas                  — Cadastrar despesa parcelada (12x)
Passo 10 → [POST] /reservas                  — Criar meta de economia
Passo 11 → [POST] /reservas/{id}/adicionar   — Depositar valor na reserva
Passo 12 → [GET]  /dashboard/usuario/{id}/resumo-mensal — Ver resumo
Passo 13 → [GET]  /despesas/usuario/{id}/categorias     — Ver pizza de gastos
Passo 14 → [GET]  /parcelamentos/usuario/{id}/dividas-futuras — Ver dívidas
```

---

## Erros comuns

| Código | Causa mais provável |
|--------|---------------------|
| `400`  | Campo obrigatório faltando no body |
| `401`  | Token ausente, expirado ou inválido |
| `403`  | E-mail não verificado / sem permissão |
| `404`  | Recurso não encontrado (UUID errado) |
| `500`  | Erro interno — verifique o terminal do servidor |

---

> **Dica:** Use a coleção do Postman exportada em conjunto com o ambiente `FinanceApp Local` para ter tudo configurado automaticamente com variáveis compartilhadas entre as requests.
