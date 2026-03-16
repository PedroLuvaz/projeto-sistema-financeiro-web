/**
 * Seed: Thiago Marques — demonstração completa de todas as funcionalidades
 *
 * Cobre:
 *  ✔ Usuário com cargo 'usuario' e email verificado
 *  ✔ 3 tipos de conta (Corrente, Crédito, Dinheiro)
 *  ✔ Membros de família (4 membros)
 *  ✔ Rendas fixas mensais + variáveis (salário, freela, aluguel recebido, 13º, PLR)
 *  ✔ Despesas em todas as 10 categorias (Alimentação, Transporte, Moradia,
 *    Saúde, Educação, Entretenimento, Eletrônicos, Roupas, Contas, Outros)
 *  ✔ Despesas nas 3 contas diferentes
 *  ✔ Parcelamentos com 2, 3, 6, 12 e 18 parcelas
 *  ✔ Reservas (fundo de emergência, viagem, reforma, investimento)
 *    com diferentes níveis de progresso
 *  ✔ Histórico de 14 meses (jan/2025 → mar/2026)
 *
 * Uso: node src/database/seeds/seed-thiago.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../../../.env')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch { }

const { Client } = pg
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'financeiro_web',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

const ID_THIAGO = 'b1c2d3e4-f5a6-7890-bcde-f1a2b3c4d5e6'
const EMAIL_THIAGO = 'thiago.marques@email.com'
const SENHA_THIAGO = 'Thiago@123'

const q = (sql, vals = []) => client.query(sql, vals)
const uuid = () => randomUUID()

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de data
// ─────────────────────────────────────────────────────────────────────────────

/** Retorna "YYYY-MM-DD" para o ano/mês/dia dados */
function d(ano, mes, dia) {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await client.connect()
  console.log('✅ Conectado ao banco')

  // ── 0. Usuário ──────────────────────────────────────────────────────────────
  const existente = await q(`SELECT id_usuario FROM usuario WHERE id_usuario = $1`, [ID_THIAGO])

  if (existente.rows.length === 0) {
    const senhaHash = await bcrypt.hash(SENHA_THIAGO, 10)
    await q(
      `INSERT INTO usuario (id_usuario, nome, email, senha, cargo, email_verificado, data_criacao)
       VALUES ($1, $2, $3, $4, 'usuario', true, NOW())`,
      [ID_THIAGO, 'Thiago Marques', EMAIL_THIAGO, senhaHash]
    )
    console.log('👤 Usuário Thiago Marques criado')
    console.log(`   Email: ${EMAIL_THIAGO}`)
    console.log(`   Senha: ${SENHA_THIAGO}`)
  } else {
    console.log('👤 Usuário já existe — pulando criação')
  }

  // Limpa dados financeiros existentes para re-seed limpo
  await q(`DELETE FROM despesa                WHERE id_usuario = $1`, [ID_THIAGO])
  await q(`DELETE FROM parcelamento_agrupador WHERE id_usuario = $1`, [ID_THIAGO])
  await q(`DELETE FROM renda                  WHERE id_usuario = $1`, [ID_THIAGO])
  await q(`DELETE FROM reserva                WHERE id_usuario = $1`, [ID_THIAGO])
  await q(`DELETE FROM conta_cartao           WHERE id_usuario = $1`, [ID_THIAGO])
  await q(`DELETE FROM membro_familia         WHERE id_usuario = $1`, [ID_THIAGO])
  console.log('🗑  Dados anteriores removidos')

  // ── 1. Contas (todos os 3 tipos) ────────────────────────────────────────────
  const idCorrente = uuid()
  const idCredito  = uuid()
  const idDinheiro = uuid()

  await q(
    `INSERT INTO conta_cartao VALUES ($1,$2,'Conta Corrente Itaú','Corrente','Thiago Marques','7823','#10b981')`,
    [idCorrente, ID_THIAGO]
  )
  await q(
    `INSERT INTO conta_cartao VALUES ($1,$2,'Nubank Roxinho','Crédito','Thiago Marques','4590','#8b5cf6')`,
    [idCredito, ID_THIAGO]
  )
  await q(
    `INSERT INTO conta_cartao VALUES ($1,$2,'Carteira','Dinheiro','Thiago Marques',NULL,'#f59e0b')`,
    [idDinheiro, ID_THIAGO]
  )
  console.log('💳 3 contas criadas (Corrente, Crédito, Dinheiro)')

  // ── 2. Membros de família ───────────────────────────────────────────────────
  const membros = [
    ['Ana Marques',     'Esposa'  ],
    ['Lucas Marques',   'Filho'   ],
    ['Beatriz Marques', 'Filha'   ],
    ['Carlos Marques',  'Pai'     ],
  ]
  for (const [nome, parentesco] of membros) {
    await q(
      `INSERT INTO membro_familia (id_membro, id_usuario, nome_membro, parentesco)
       VALUES ($1, $2, $3, $4)`,
      [uuid(), ID_THIAGO, nome, parentesco]
    )
  }
  console.log('👨‍👩‍👧‍👦 4 membros de família criados')

  // ── 3. Reservas / metas financeiras ────────────────────────────────────────
  // Reservas com diferentes níveis de progresso para mostrar variedade no dashboard
  const reservas = [
    // [nome,                 alvo,     atual,    prazo       ]
    ['Fundo de Emergência',  15000.00,  8200.00, '2026-12-31'],  // 55% — em andamento
    ['Viagem para Europa',   12000.00,  3500.00, '2027-06-30'],  // 29% — início
    ['Reforma da Cozinha',    8000.00,  8000.00, '2026-03-01'],  // 100% — concluída
    ['Entrada do Carro',     20000.00,  1200.00, '2028-01-01'],  // 6% — longo prazo
  ]
  for (const [nome, alvo, atual, prazo] of reservas) {
    await q(
      `INSERT INTO reserva (id_reserva, id_usuario, nome_objetivo, valor_alvo, valor_atual, data_limite)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [uuid(), ID_THIAGO, nome, alvo, atual, prazo]
    )
  }
  console.log('🎯 4 reservas criadas')

  // ── 4. Rendas ───────────────────────────────────────────────────────────────
  const SALARIO = 6800.00
  const ALUGUEL_IMOVEL = 1400.00  // recebe aluguel de um imóvel

  // Salário mensal: jan/2025 → mar/2026 (15 meses)
  const mesesRenda = [
    [2025,1],[2025,2],[2025,3],[2025,4],[2025,5],[2025,6],
    [2025,7],[2025,8],[2025,9],[2025,10],[2025,11],[2025,12],
    [2026,1],[2026,2],[2026,3],
  ]
  for (const [ano, mes] of mesesRenda) {
    await q(
      `INSERT INTO renda (id_renda,id_usuario,descricao_renda,valor_renda,data,fixa,dia_vencimento)
       VALUES ($1,$2,'Salário CLT',$3,$4,true,5)`,
      [uuid(), ID_THIAGO, SALARIO, d(ano, mes, 5)]
    )
    await q(
      `INSERT INTO renda (id_renda,id_usuario,descricao_renda,valor_renda,data,fixa,dia_vencimento)
       VALUES ($1,$2,'Aluguel imóvel',$3,$4,true,10)`,
      [uuid(), ID_THIAGO, ALUGUEL_IMOVEL, d(ano, mes, 10)]
    )
  }

  // Rendas variáveis ao longo do tempo
  const rendasExtras = [
    ['Freelance consultoria', 1800.00, '2025-02-22'],
    ['Bônus trimestral',      2500.00, '2025-03-31'],
    ['Freelance consultoria', 2200.00, '2025-06-15'],
    ['13º salário',           6800.00, '2025-11-28'],
    ['PLR (Participação Lucros)', 4500.00, '2025-12-20'],
    ['Freelance consultoria', 1500.00, '2026-01-18'],
    ['Bônus trimestral',      2500.00, '2026-03-31'],
  ]
  for (const [desc, valor, data] of rendasExtras) {
    await q(
      `INSERT INTO renda (id_renda,id_usuario,descricao_renda,valor_renda,data,fixa)
       VALUES ($1,$2,$3,$4,$5,false)`,
      [uuid(), ID_THIAGO, desc, valor, data]
    )
  }
  console.log('💰 Rendas inseridas (salário fixo + aluguel + extras)')

  // ── 5. Despesas fixas mensais (conta corrente) ──────────────────────────────
  async function despesaFixa(desc, valor, data, cat, contaId) {
    await q(
      `INSERT INTO despesa (id_despesa,id_usuario,id_conta,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1)`,
      [uuid(), ID_THIAGO, contaId, desc, valor, data, cat]
    )
  }

  const mesesDespesa = [
    [2025,1],[2025,2],[2025,3],[2025,4],[2025,5],[2025,6],
    [2025,7],[2025,8],[2025,9],[2025,10],[2025,11],[2025,12],
    [2026,1],[2026,2],[2026,3],
  ]

  for (const [ano, mes] of mesesDespesa) {
    // Moradia
    await despesaFixa('Financiamento imóvel',  1850.00, d(ano, mes, 5),  'Moradia',       idCorrente)
    await despesaFixa('Condomínio',              480.00, d(ano, mes, 10), 'Moradia',       idCorrente)
    // Contas
    await despesaFixa('Plano de saúde família', 890.00, d(ano, mes, 8),  'Saúde',         idCorrente)
    await despesaFixa('Internet fibra',          119.90, d(ano, mes, 15), 'Contas',        idCorrente)
    await despesaFixa('Energia elétrica',        210.00, d(ano, mes, 12), 'Contas',        idCorrente)
    await despesaFixa('Água e gás',               85.00, d(ano, mes, 12), 'Contas',        idCorrente)
    // Educação (escola dos filhos)
    await despesaFixa('Escola Lucas',            650.00, d(ano, mes, 7),  'Educação',      idCorrente)
    await despesaFixa('Escola Beatriz',          650.00, d(ano, mes, 7),  'Educação',      idCorrente)
    // Transporte
    await despesaFixa('Combustível',             380.00, d(ano, mes, 20), 'Transporte',    idCorrente)
    await despesaFixa('IPVA parcelado',          150.00, d(ano, mes, 25), 'Transporte',    idCorrente)
    // Entretenimento / assinaturas
    await despesaFixa('Netflix',                  55.90, d(ano, mes, 3),  'Entretenimento', idCredito)
    await despesaFixa('Spotify Família',          34.90, d(ano, mes, 3),  'Entretenimento', idCredito)
    await despesaFixa('Amazon Prime',             19.90, d(ano, mes, 3),  'Entretenimento', idCredito)
    // Academia
    await despesaFixa('Academia Smart Fit',       99.90, d(ano, mes, 18), 'Saúde',         idCorrente)
  }
  console.log('📋 Despesas fixas mensais inseridas')

  // ── 6. Parcelamentos ────────────────────────────────────────────────────────
  const parcelamentos = [
    // [desc,                     total,      qtd, inicio,       cat,             conta    ]
    ['TV 75" Samsung QLED',     4799.00,  12, '2025-01-10', 'Eletrônicos',    idCredito],
    ['Notebook Dell',           6299.00,  18, '2025-02-10', 'Eletrônicos',    idCredito],
    ['Geladeira French Door',   4599.00,  10, '2025-04-10', 'Outros',         idCredito],
    ['Curso MBA Online',        4200.00,   6, '2025-05-10', 'Educação',       idCredito],
    ['Tênis Nike Air Max',       699.90,   3, '2025-07-10', 'Roupas',         idCredito],
    ['PlayStation 5',           4499.00,  12, '2025-08-10', 'Entretenimento', idCredito],
    ['Ar-condicionado 12.000BTU',3299.00,  8, '2025-09-10', 'Outros',         idCredito],
    ['Viagem litoral (hotel)',   2800.00,   3, '2025-12-10', 'Entretenimento', idCredito],
    ['iPhone 16 Pro',           8499.00,  12, '2026-01-10', 'Eletrônicos',    idCredito],
    ['Óculos de grau',           980.00,   2, '2026-02-10', 'Saúde',          idCredito],
  ]

  for (const [desc, total, qtd, inicio, cat, contaId] of parcelamentos) {
    const idParc = uuid()
    const valorParcela = parseFloat((total / qtd).toFixed(2))
    const dataInicio = new Date(inicio)

    await q(
      `INSERT INTO parcelamento_agrupador (id_parcelamento,id_usuario,descricao_parcela,valor_total,qtd_parcelas,data_inicio)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [idParc, ID_THIAGO, desc, total, qtd, inicio]
    )

    for (let i = 0; i < qtd; i++) {
      const dt = new Date(dataInicio)
      dt.setMonth(dt.getMonth() + i)
      const dataStr = dt.toISOString().split('T')[0]

      await q(
        `INSERT INTO despesa (id_despesa,id_usuario,id_conta,id_parcelamento,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uuid(), ID_THIAGO, contaId, idParc, desc, valorParcela, dataStr, cat, i + 1]
      )
    }
    console.log(`  ✓ ${desc}: ${qtd}x R$ ${valorParcela.toFixed(2)}`)
  }
  console.log('💳 Parcelamentos inseridos')

  // ── 7. Despesas variáveis avulsas ───────────────────────────────────────────
  // Cobre todas as 10 categorias em diferentes contas e períodos
  const extras = [
    // Alimentação — corrente e dinheiro
    ['Mercado Extra',            680.00, '2025-01-22', 'Alimentação',    idCorrente],
    ['Ifood (pizza)',             89.90, '2025-01-28', 'Alimentação',    idCredito ],
    ['Padaria',                   18.50, '2025-02-05', 'Alimentação',    idDinheiro],
    ['Mercado Carrefour',        720.40, '2025-02-20', 'Alimentação',    idCorrente],
    ['Churrasco (carne)',        145.00, '2025-03-15', 'Alimentação',    idCorrente],
    ['Mercado Extra',            695.00, '2025-03-25', 'Alimentação',    idCorrente],
    ['Restaurante japonês',      198.00, '2025-04-12', 'Alimentação',    idCredito ],
    ['Mercado Carrefour',        745.00, '2025-04-24', 'Alimentação',    idCorrente],
    ['Ifood',                     62.00, '2025-05-10', 'Alimentação',    idCredito ],
    ['Mercado Extra',            710.00, '2025-05-25', 'Alimentação',    idCorrente],
    ['Vinho importado',           87.00, '2025-06-07', 'Alimentação',    idCredito ],
    ['Mercado Extra',            655.00, '2025-06-22', 'Alimentação',    idCorrente],
    ['Churrasco aniversário',    230.00, '2025-07-05', 'Alimentação',    idCorrente],
    ['Mercado Carrefour',        730.00, '2025-07-24', 'Alimentação',    idCorrente],
    ['Restaurante italiano',     165.00, '2025-08-17', 'Alimentação',    idCredito ],
    ['Mercado Extra',            698.00, '2025-08-25', 'Alimentação',    idCorrente],
    ['Ifood',                     74.50, '2025-09-08', 'Alimentação',    idCredito ],
    ['Mercado Extra',            712.00, '2025-09-22', 'Alimentação',    idCorrente],
    ['Mercado Carrefour',        680.00, '2025-10-20', 'Alimentação',    idCorrente],
    ['Ceia de Natal (compras)',  480.00, '2025-12-22', 'Alimentação',    idCorrente],
    ['Mercado Extra',            660.00, '2026-01-20', 'Alimentação',    idCorrente],
    ['Mercado Carrefour',        705.00, '2026-02-18', 'Alimentação',    idCorrente],
    ['Mercado Extra',            690.00, '2026-03-19', 'Alimentação',    idCorrente],

    // Transporte — corrente e dinheiro
    ['Uber (trabalho)',           28.50, '2025-01-15', 'Transporte',     idCorrente],
    ['Estacionamento',            15.00, '2025-02-10', 'Transporte',     idDinheiro],
    ['Revisão 30.000km',         850.00, '2025-03-08', 'Transporte',     idCorrente],
    ['Uber',                      32.00, '2025-04-18', 'Transporte',     idCorrente],
    ['Pedágio (viagem)',           48.00, '2025-07-10', 'Transporte',     idDinheiro],
    ['Lavagem carro',             45.00, '2025-09-14', 'Transporte',     idDinheiro],
    ['Pneu (par dianteiro)',      680.00, '2025-10-03', 'Transporte',     idCorrente],
    ['Uber (aeroporto)',           64.00, '2025-12-18', 'Transporte',     idCorrente],
    ['IPVA quitação',             390.00, '2026-01-15', 'Transporte',     idCorrente],

    // Moradia — extras esporádicos
    ['Dedetização',               280.00, '2025-02-14', 'Moradia',       idCorrente],
    ['Cortina blackout',          420.00, '2025-05-03', 'Moradia',       idCredito ],
    ['Pintura sala',              900.00, '2025-07-19', 'Moradia',       idCorrente],
    ['Chave reserva (cópia)',      15.00, '2025-09-02', 'Moradia',       idDinheiro],
    ['Encanador',                 180.00, '2025-11-11', 'Moradia',       idCorrente],
    ['Cortinas (quarto casal)',   350.00, '2026-02-05', 'Moradia',       idCredito ],

    // Saúde — corrente e dinheiro
    ['Farmácia',                  89.90, '2025-01-08', 'Saúde',         idCorrente],
    ['Dentista (consulta)',       220.00, '2025-02-25', 'Saúde',         idCorrente],
    ['Exames de rotina',          380.00, '2025-04-06', 'Saúde',         idCorrente],
    ['Farmácia',                  67.50, '2025-05-18', 'Saúde',         idCorrente],
    ['Psicólogo (4 sessões)',     560.00, '2025-06-20', 'Saúde',         idCorrente],
    ['Farmácia',                 112.00, '2025-08-04', 'Saúde',         idCorrente],
    ['Ortodontista (Ana)',        280.00, '2025-09-12', 'Saúde',         idCorrente],
    ['Pediatra (Lucas)',          250.00, '2025-10-07', 'Saúde',         idCorrente],
    ['Farmácia',                  54.00, '2025-12-03', 'Saúde',         idCorrente],
    ['Vitaminas',                  78.00, '2026-01-10', 'Saúde',        idCorrente],
    ['Dermato (Beatriz)',         300.00, '2026-02-14', 'Saúde',         idCorrente],
    ['Farmácia',                  92.00, '2026-03-05', 'Saúde',         idCorrente],

    // Educação — extras
    ['Livros didáticos Lucas',   180.00, '2025-01-20', 'Educação',      idCorrente],
    ['Livros didáticos Beatriz', 160.00, '2025-01-20', 'Educação',      idCorrente],
    ['Curso inglês (Thiago)',    320.00, '2025-03-01', 'Educação',       idCorrente],
    ['Material escolar',         145.00, '2025-07-28', 'Educação',       idCorrente],
    ['Livro técnico (TI)',        89.00, '2025-09-05', 'Educação',       idCredito ],
    ['Certificação AWS',         650.00, '2025-10-15', 'Educação',       idCorrente],
    ['Livros didáticos 2026',    290.00, '2026-01-18', 'Educação',       idCorrente],
    ['Curso Excel avançado',     199.00, '2026-02-08', 'Educação',       idCredito ],

    // Entretenimento — cartão e dinheiro
    ['Cinema (família)',          148.00, '2025-01-18', 'Entretenimento', idCorrente],
    ['Show Luan Santana',         320.00, '2025-03-22', 'Entretenimento', idCredito ],
    ['Parque de diversões',       390.00, '2025-04-20', 'Entretenimento', idCorrente],
    ['Cinema',                     72.00, '2025-05-30', 'Entretenimento', idCorrente],
    ['Clube (passeio)',            120.00, '2025-06-28', 'Entretenimento', idDinheiro],
    ['Ingresso futebol',           85.00, '2025-08-03', 'Entretenimento', idDinheiro],
    ['Cinema IMAX',                89.00, '2025-10-12', 'Entretenimento', idCorrente],
    ['Jantar aniversário Ana',    280.00, '2025-11-08', 'Entretenimento', idCredito ],
    ['Reveillon',                 450.00, '2025-12-31', 'Entretenimento', idCorrente],
    ['Aquário (passeio)',         160.00, '2026-01-25', 'Entretenimento', idCorrente],
    ['Show sertanejo',            190.00, '2026-02-28', 'Entretenimento', idCredito ],
    ['Cinema',                     68.00, '2026-03-10', 'Entretenimento', idCorrente],

    // Roupas — cartão
    ['Camisa social (trabalho)',   180.00, '2025-02-08', 'Roupas',       idCredito ],
    ['Tênis casual',              249.90, '2025-04-15', 'Roupas',        idCredito ],
    ['Roupas Lucas (volta aulas)',  320.00,'2025-07-22', 'Roupas',       idCredito ],
    ['Roupas Beatriz',             280.00, '2025-07-22', 'Roupas',       idCredito ],
    ['Casaco inverno',             399.00, '2025-08-14', 'Roupas',       idCredito ],
    ['Roupas trabalho (kit)',      560.00, '2025-09-20', 'Roupas',       idCredito ],
    ['Roupa festa Natal',         240.00, '2025-12-15', 'Roupas',        idCredito ],
    ['Roupas verão (família)',     480.00, '2026-01-12', 'Roupas',       idCredito ],
    ['Tênis esportivo',           319.90, '2026-03-08', 'Roupas',        idCredito ],

    // Contas — avulsas
    ['Seguro automóvel',          189.00, '2025-01-05', 'Contas',        idCorrente],
    ['Recarga celular Thiago',     30.00, '2025-02-01', 'Contas',        idDinheiro],
    ['Recarga celular Ana',        30.00, '2025-02-01', 'Contas',        idDinheiro],
    ['Renovação CNH',             136.00, '2025-04-10', 'Contas',        idCorrente],
    ['Seguro automóvel',          189.00, '2025-07-05', 'Contas',        idCorrente],
    ['IPTU (boleto extra)',        420.00, '2025-08-20', 'Contas',        idCorrente],
    ['Recarga celular Lucas',      25.00, '2025-09-01', 'Contas',        idDinheiro],
    ['Seguro automóvel',          189.00, '2026-01-05', 'Contas',        idCorrente],
    ['Taxa bancária',              12.90, '2026-02-01', 'Contas',        idCorrente],

    // Eletrônicos — avulsos
    ['Mouse sem fio',              89.90, '2025-03-10', 'Eletrônicos',   idCredito ],
    ['Cabo HDMI',                  25.00, '2025-06-05', 'Eletrônicos',   idDinheiro],
    ['Pendrive 128GB',             45.00, '2025-08-28', 'Eletrônicos',   idCorrente],
    ['Carregador turbo',           79.90, '2025-11-20', 'Eletrônicos',   idCredito ],
    ['Teclado mecânico',          299.00, '2026-01-08', 'Eletrônicos',   idCredito ],

    // Outros — presentes, doações, etc.
    ['Presente aniversário Lucas', 180.00,'2025-03-12', 'Outros',        idCorrente],
    ['Presente aniversário Beatriz',160.00,'2025-05-20','Outros',         idCorrente],
    ['Doação ONG',                  50.00, '2025-06-01', 'Outros',       idCorrente],
    ['Presente casamento amigo',   200.00, '2025-07-14', 'Outros',       idCorrente],
    ['Presente Dia dos Pais',      150.00, '2025-08-10', 'Outros',       idCorrente],
    ['Doação campanha',             80.00, '2025-09-28', 'Outros',       idDinheiro],
    ['Presente Natal (família)',   400.00, '2025-12-10', 'Outros',       idCorrente],
    ['Cesta de Natal (funcionária)',120.00,'2025-12-18', 'Outros',       idCorrente],
    ['Presente aniversário Ana',   250.00, '2026-01-30', 'Outros',       idCredito ],
    ['Doação ONG',                  50.00, '2026-02-01', 'Outros',       idCorrente],
    ['Conserto guarda-roupa',       95.00, '2026-03-12', 'Outros',       idCorrente],
  ]

  for (const [desc, valor, data, cat, conta] of extras) {
    await q(
      `INSERT INTO despesa (id_despesa,id_usuario,id_conta,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1)`,
      [uuid(), ID_THIAGO, conta, desc, valor, data, cat]
    )
  }
  console.log(`🧺 ${extras.length} despesas variáveis avulsas inseridas`)

  // ── Resumo final ─────────────────────────────────────────────────────────────
  console.log('\n✅ Seed do Thiago Marques concluído com sucesso!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   Login:            ' + EMAIL_THIAGO)
  console.log('   Senha:            ' + SENHA_THIAGO)
  console.log('   ID do usuário:    ' + ID_THIAGO)
  console.log('   Conta Corrente:   ' + idCorrente)
  console.log('   Cartão Crédito:   ' + idCredito)
  console.log('   Carteira:         ' + idDinheiro)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   Período coberto:  Jan/2025 → Mar/2026 (15 meses)')
  console.log('   Membros família:  4 (esposa, 2 filhos, pai)')
  console.log('   Reservas:         4 (emergência, viagem, reforma, carro)')
  console.log('   Tipos de renda:   Salário fixo + Aluguel + Freelas + 13º + PLR')
  console.log('   Categorias:       10/10 cobertas')
  console.log('   Parcelamentos:    10 (2x a 18x)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => client.end())
