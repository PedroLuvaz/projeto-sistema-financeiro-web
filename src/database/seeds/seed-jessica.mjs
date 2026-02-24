/**
 * Seed: popula dados da Jéssica Xarlana baseado na planilha Despesas.xlsx
 * Uso: node src/database/seeds/seed-jessica.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

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
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
})

const ID_JESSICA = 'e2085a5e-84de-4617-a19b-da45fe1b9bfa'

// ── Helpers ──────────────────────────────────────────────────────────────────
const q = (sql, vals = []) => client.query(sql, vals)
const uuid = () => randomUUID()

// ── Dados da planilha ─────────────────────────────────────────────────────────

// Totais mensais "contas fixas" (aluguel 225 + academia 70 = 295 fixo; água+energia = total-295)
const CONTAS_FIXAS_2025 = [
  { mes: 1,  total: 366.00   },
  { mes: 2,  total: 347.00   },
  { mes: 3,  total: 332.75   },
  { mes: 4,  total: 357.84   },
  { mes: 5,  total: 348.25   },
  { mes: 6,  total: 352.25   },
  { mes: 7,  total: 354.15   },
  { mes: 8,  total: 357.15   },
  { mes: 9,  total: 375.66   }, // inclui chuveiro R$40
  { mes: 10, total: 361.18   },
  { mes: 11, total: 363.19   },
  { mes: 12, total: 345.45   },
]
const CONTAS_FIXAS_2026 = [
  { mes: 1,  total: 356.38   },
]

// Cartão - despesas da fatura fev/2026 e mar/2026
const CARTAO_FEV_2026 = [
  { desc: 'Apple Music',           valor:   20.00, cat: 'Entretenimento', parcelas: 1 },
  { desc: 'Recarga celular',       valor:   30.00, cat: 'Contas',         parcelas: 1 },
  { desc: 'Uber (Assaí)',          valor:   18.11, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Uber (trauma)',         valor:    7.50, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Uber (Nicole)',         valor:    7.50, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Passe ônibus',          valor:   40.00, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Hambúrguer',            valor:   20.50, cat: 'Alimentação',    parcelas: 1 },
  { desc: 'Uber',                  valor:    4.77, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Recarga vovó',          valor:   30.00, cat: 'Contas',         parcelas: 1 },
  { desc: 'Uber',                  valor:    4.38, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Uber',                  valor:    4.81, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Uber',                  valor:    4.78, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Uber',                  valor:    8.02, cat: 'Transporte',     parcelas: 1 },
  { desc: 'Spotify (Pedro)',       valor:    6.00, cat: 'Entretenimento', parcelas: 1 },
  { desc: 'Remédio',               valor:   26.00, cat: 'Saúde',          parcelas: 1 },
]

// Parcelamentos (com data de início calculada baseado na parcela atual em fev/2026)
// "X/Y em fev/2026" → início = fev/2026 - (X-1) meses
const PARCELAMENTOS_CARTAO = [
  // notebook 5/12 em fev2026 → início out2025
  { desc: 'Notebook (Pedro)',    total: 4043.28, parcelas: 12, inicio: '2025-10-05', cat: 'Eletrônicos'    },
  // jogo 3/6 em fev2026 → início dez2025
  { desc: 'Jogo (Pedro)',        total:  101.10, parcelas:  6, inicio: '2025-12-05', cat: 'Entretenimento' },
  // protetor 3/3 em fev2026 → início dez2025
  { desc: 'Protetor labial',     total:   69.93, parcelas:  3, inicio: '2025-12-05', cat: 'Saúde'          },
  // dentista 3/3 em fev2026 → início dez2025
  { desc: 'Dentista',            total:  480.00, parcelas:  3, inicio: '2025-12-05', cat: 'Saúde'          },
  // gocase 2/3 em fev2026 → início jan2026
  { desc: 'Capinha Gocase',      total:  188.28, parcelas:  3, inicio: '2026-01-05', cat: 'Eletrônicos'    },
  // capinhas 2/3 em fev2026 → início jan2026
  { desc: 'Capinhas (kit)',      total:  125.79, parcelas:  3, inicio: '2026-01-05', cat: 'Eletrônicos'    },
  // kit crochê 2/2 em fev2026 → início jan2026
  { desc: 'Kit crochê',          total:   36.94, parcelas:  2, inicio: '2026-01-05', cat: 'Outros'         },
  // assai 1/2 em fev2026 (na fatura de fev está como 1/2)
  { desc: 'Compras Assaí',       total:  413.80, parcelas:  2, inicio: '2026-02-05', cat: 'Alimentação'    },
  // celular 3/12 em fev2026 → início dez2025
  { desc: 'Celular novo',        total: 4566.96, parcelas: 12, inicio: '2025-12-05', cat: 'Eletrônicos'    },
  // carregador 1/2 em fev2026 → início fev2026
  { desc: 'Carregador',          total:   51.90, parcelas:  2, inicio: '2026-02-05', cat: 'Eletrônicos'    },
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await client.connect()
  console.log('✅ Conectado ao banco')

  // Limpa dados existentes da Jéssica (para re-seed limpo)
  await q(`DELETE FROM despesa         WHERE id_usuario = $1`, [ID_JESSICA])
  await q(`DELETE FROM parcelamento_agrupador WHERE id_usuario = $1`, [ID_JESSICA])
  await q(`DELETE FROM renda           WHERE id_usuario = $1`, [ID_JESSICA])
  await q(`DELETE FROM reserva         WHERE id_usuario = $1`, [ID_JESSICA])
  await q(`DELETE FROM conta_cartao    WHERE id_usuario = $1`, [ID_JESSICA])
  console.log('🗑  Dados anteriores removidos')

  // ── 1. Contas ───────────────────────────────────────────────────────────────
  const idConta = uuid()
  const idCartao = uuid()

  await q(`INSERT INTO conta_cartao VALUES ($1,$2,'Conta Corrente','Corrente','Jéssica Xarlana',NULL,'#10b981')`,
    [idConta, ID_JESSICA])
  await q(`INSERT INTO conta_cartao VALUES ($1,$2,'Cartão de Crédito','Crédito','Jéssica Xarlana','4321','#6366f1')`,
    [idCartao, ID_JESSICA])
  console.log('💳 Contas criadas')

  // ── 2. Reservas ─────────────────────────────────────────────────────────────
  await q(`INSERT INTO reserva VALUES ($1,$2,'Fundo de emergência',3000.00,850.00,'2026-12-31')`,
    [uuid(), ID_JESSICA])
  await q(`INSERT INTO reserva VALUES ($1,$2,'Viagem',1500.00,230.00,'2026-07-01')`,
    [uuid(), ID_JESSICA])
  console.log('🎯 Reservas criadas')

  // ── 3. Rendas mensais ───────────────────────────────────────────────────────
  const SALARIO = 2800.00

  for (const { mes, total } of CONTAS_FIXAS_2025) {
    const dia = `2025-${String(mes).padStart(2,'0')}-05`
    await q(`INSERT INTO renda VALUES ($1,$2,'Salário',$3,$4)`, [uuid(), ID_JESSICA, SALARIO, dia])
  }
  // Renda extra (freela) em alguns meses
  await q(`INSERT INTO renda VALUES ($1,$2,'Freela design',$3,$4)`, [uuid(), ID_JESSICA, 450.00, '2025-03-20'])
  await q(`INSERT INTO renda VALUES ($1,$2,'Freela design',$3,$4)`, [uuid(), ID_JESSICA, 600.00, '2025-07-18'])
  await q(`INSERT INTO renda VALUES ($1,$2,'13º salário',$3,$4)`,   [uuid(), ID_JESSICA, 2800.00, '2025-11-28'])

  // 2026 jan + fev
  await q(`INSERT INTO renda VALUES ($1,$2,'Salário',$3,$4)`, [uuid(), ID_JESSICA, SALARIO, '2026-01-05'])
  await q(`INSERT INTO renda VALUES ($1,$2,'Salário',$3,$4)`, [uuid(), ID_JESSICA, SALARIO, '2026-02-05'])
  console.log('💰 Rendas criadas')

  // ── 4. Despesas fixas mensais ───────────────────────────────────────────────
  async function inserirDespesaFixa(desc, valor, data, cat, contaId) {
    await q(
      `INSERT INTO despesa (id_despesa,id_usuario,id_conta,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1)`,
      [uuid(), ID_JESSICA, contaId, desc, valor, data, cat]
    )
  }

  for (const { mes, total } of CONTAS_FIXAS_2025) {
    const mm = String(mes).padStart(2, '0')
    const variavel = parseFloat((total - 295).toFixed(2)) // total - aluguel(225) - academia(70)

    // Água e energia derivados do variável (proporção 40/60)
    const agua   = parseFloat((variavel * 0.38).toFixed(2))
    const energia = parseFloat((variavel - agua).toFixed(2))

    await inserirDespesaFixa('Aluguel',  225.00, `2025-${mm}-10`, 'Moradia', idConta)
    await inserirDespesaFixa('Academia',  70.00, `2025-${mm}-18`, 'Saúde',   idConta)

    if (mes === 9) {
      // Set/25: chuveiro incluso (total 375.66 = 295 + água + energia + chuveiro 40)
      const sem_chuv = parseFloat((total - 295 - 40).toFixed(2))
      const aguaS   = parseFloat((sem_chuv * 0.38).toFixed(2))
      const energiaS = parseFloat((sem_chuv - aguaS).toFixed(2))
      await inserirDespesaFixa('Água',           aguaS,    `2025-${mm}-10`, 'Contas', idConta)
      await inserirDespesaFixa('Energia elétrica', energiaS, `2025-${mm}-10`, 'Contas', idConta)
      await inserirDespesaFixa('Reparo chuveiro', 40.00,   `2025-${mm}-15`, 'Moradia', idConta)
    } else {
      await inserirDespesaFixa('Água',             agua,    `2025-${mm}-10`, 'Contas', idConta)
      await inserirDespesaFixa('Energia elétrica', energia, `2025-${mm}-10`, 'Contas', idConta)
    }
  }

  // 2026 jan
  const v26jan = parseFloat((CONTAS_FIXAS_2026[0].total - 295).toFixed(2))
  const agua26  = parseFloat((v26jan * 0.38).toFixed(2))
  const en26    = parseFloat((v26jan - agua26).toFixed(2))
  await inserirDespesaFixa('Aluguel',           225.00, '2026-01-10', 'Moradia', idConta)
  await inserirDespesaFixa('Academia',           70.00, '2026-01-18', 'Saúde',   idConta)
  await inserirDespesaFixa('Água',               agua26, '2026-01-10', 'Contas', idConta)
  await inserirDespesaFixa('Energia elétrica',   en26,   '2026-01-10', 'Contas', idConta)

  console.log('📋 Despesas fixas mensais inseridas')

  // ── 5. Despesas avulsas do cartão (fev/2026) ────────────────────────────────
  for (const item of CARTAO_FEV_2026) {
    await q(
      `INSERT INTO despesa (id_despesa,id_usuario,id_conta,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1)`,
      [uuid(), ID_JESSICA, idCartao, item.desc, item.valor, '2026-02-15', item.cat]
    )
  }
  console.log('🛒 Despesas avulsas do cartão inseridas')

  // ── 6. Parcelamentos no cartão ──────────────────────────────────────────────
  for (const p of PARCELAMENTOS_CARTAO) {
    const idParc = uuid()
    const valorParcela = parseFloat((p.total / p.parcelas).toFixed(2))
    const dataInicio = new Date(p.inicio)

    await q(
      `INSERT INTO parcelamento_agrupador VALUES ($1,$2,$3,$4,$5,$6)`,
      [idParc, ID_JESSICA, p.desc, p.total, p.parcelas, p.inicio]
    )

    for (let i = 0; i < p.parcelas; i++) {
      const d = new Date(dataInicio)
      d.setMonth(d.getMonth() + i)
      const dataStr = d.toISOString().split('T')[0]

      await q(
        `INSERT INTO despesa (id_despesa,id_usuario,id_conta,id_parcelamento,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uuid(), ID_JESSICA, idCartao, idParc, p.desc, valorParcela, dataStr, p.cat, i + 1]
      )
    }
    console.log(`  ✓ ${p.desc}: ${p.parcelas}x R$ ${valorParcela}`)
  }

  // ── 7. Algumas despesas variáveis para enriquecer o histórico ───────────────
  const extras = [
    ['Farmácia',          45.90, '2025-02-08', 'Saúde',          idConta],
    ['Mercado',          312.50, '2025-02-20', 'Alimentação',    idConta],
    ['Mercado',          287.30, '2025-03-18', 'Alimentação',    idConta],
    ['Restaurante',       68.00, '2025-03-22', 'Alimentação',    idConta],
    ['Mercado',          340.00, '2025-04-17', 'Alimentação',    idConta],
    ['Uber',              14.50, '2025-04-25', 'Transporte',     idConta],
    ['Farmácia',          32.00, '2025-05-06', 'Saúde',          idConta],
    ['Mercado',          295.70, '2025-05-22', 'Alimentação',    idConta],
    ['Roupa (loja)',      159.90, '2025-06-10', 'Roupas',         idCartao],
    ['Mercado',          310.40, '2025-06-24', 'Alimentação',    idConta],
    ['Presente aniversário', 89.00, '2025-07-03', 'Outros',      idConta],
    ['Mercado',          325.00, '2025-07-20', 'Alimentação',    idConta],
    ['Cinema',            48.00, '2025-08-09', 'Entretenimento', idConta],
    ['Mercado',          299.60, '2025-08-21', 'Alimentação',    idConta],
    ['Médico consulta',   180.00, '2025-09-04', 'Saúde',         idConta],
    ['Mercado',           268.00, '2025-09-19', 'Alimentação',   idConta],
    ['Calçado',           199.90, '2025-10-05', 'Roupas',        idCartao],
    ['Mercado',           315.30, '2025-10-23', 'Alimentação',   idConta],
    ['Mercado',           290.00, '2025-11-14', 'Alimentação',   idConta],
    ['Restaurante',        85.00, '2025-11-29', 'Alimentação',   idConta],
    ['Mercado',           305.00, '2025-12-12', 'Alimentação',   idConta],
    ['Presente Natal',    120.00, '2025-12-20', 'Outros',        idConta],
    ['Mercado',           340.00, '2026-01-18', 'Alimentação',   idConta],
    ['Farmácia',           55.00, '2026-01-24', 'Saúde',         idConta],
    ['Mercado',           285.00, '2026-02-20', 'Alimentação',   idConta],
  ]

  for (const [desc, valor, data, cat, conta] of extras) {
    await q(
      `INSERT INTO despesa (id_despesa,id_usuario,id_conta,descricao_despesa,valor_parcela,data,categoria,numero_parcela)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1)`,
      [uuid(), ID_JESSICA, conta, desc, valor, data, cat]
    )
  }
  console.log('🧺 Despesas variáveis extras inseridas')

  console.log('\n✅ Seed da Jéssica concluído com sucesso!')
  console.log('   Conta Corrente ID:', idConta)
  console.log('   Cartão de Crédito ID:', idCartao)
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => client.end())
