import { Op } from 'sequelize'
import despesaService from '@/services/despesaService.js'
import rendaService from '@/services/rendaService.js'
import models from '@/models/index.js'
import cacheService, { CACHE_KEYS, TTL } from './cacheService.js'

const { Despesa, Renda, ContaCartao, sequelize } = models

class DashboardService {
  async resumoMensal(idUsuario, mes, ano) {
    const cacheKey = cacheService.generateKey(CACHE_KEYS.DASHBOARD_RESUMO, idUsuario, { mes, ano })
    
    return cacheService.getOrSet(cacheKey, async () => {
      const filtros = { mes, ano }

      const [totalRendas, totalDespesas, despesasPorCategoria, topDespesas] = await Promise.all([
        rendaService.calcularTotalPorPeriodo(idUsuario, filtros),
        despesaService.calcularTotalPorPeriodo(idUsuario, filtros),
        despesaService.calcularPorCategoria(idUsuario, filtros),
        despesaService.topDespesas(idUsuario, filtros, 5)
      ])

      const saldoLiquido = parseFloat((totalRendas - totalDespesas).toFixed(2))

      return {
        mes: parseInt(mes),
        ano: parseInt(ano),
        total_rendas: totalRendas,
        total_despesas: totalDespesas,
        saldo_liquido: saldoLiquido,
        despesas_por_categoria: despesasPorCategoria,
        top_5_despesas: topDespesas
      }
    }, TTL.MEDIUM)
  }

  /**
   * OPTIMIZED: Eliminates N+1 queries by:
   * 1. Using single queries with GROUP BY for monthly totals
   * 2. Using eager loading with includes for account data
   * 3. Fetching all data in parallel where possible
   */
  async relatorioAnual(idUsuario, ano) {
    const cacheKey = cacheService.generateKey(CACHE_KEYS.DASHBOARD_RELATORIO, idUsuario, { ano })
    
    return cacheService.getOrSet(cacheKey, async () => {
      const primeiroDiaAno = `${ano}-01-01`
      const ultimoDiaAno = `${ano}-12-31`

      // Fetch all data in parallel with optimized queries
      const [
        rendasMensais,
        despesasMensais,
        despesasPorContaRaw,
        categorias,
        rendasAno
      ] = await Promise.all([
        // Monthly income totals - single query with GROUP BY
        Renda.findAll({
          where: {
            Id_Usuario: idUsuario,
            Data: { [Op.between]: [primeiroDiaAno, ultimoDiaAno] }
          },
          attributes: [
            [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "Data"')), 'mes'],
            [sequelize.fn('SUM', sequelize.col('Valor_Renda')), 'total']
          ],
          group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "Data"'))],
          raw: true
        }),
        
        // Monthly expense totals - single query with GROUP BY
        Despesa.findAll({
          where: {
            Id_Usuario: idUsuario,
            Data: { [Op.between]: [primeiroDiaAno, ultimoDiaAno] }
          },
          attributes: [
            [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "Data"')), 'mes'],
            [sequelize.fn('SUM', sequelize.col('Valor_Parcela')), 'total']
          ],
          group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "Data"'))],
          raw: true
        }),
        
        // Expenses by account - single query with GROUP BY and JOIN
        Despesa.findAll({
          where: {
            Id_Usuario: idUsuario,
            Data: { [Op.between]: [primeiroDiaAno, ultimoDiaAno] }
          },
          attributes: [
            'Id_Conta',
            [sequelize.fn('SUM', sequelize.col('Valor_Parcela')), 'total'],
            [sequelize.fn('COUNT', sequelize.col('Id_Despesa')), 'quantidade']
          ],
          include: [{
            model: ContaCartao,
            as: 'conta',
            attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
          }],
          group: ['Id_Conta', 'conta.Id_Conta', 'conta.Nome_Conta', 'conta.Tipo', 'conta.Cor_Hex'],
          raw: false
        }),
        
        // Category totals
        despesaService.calcularPorCategoria(idUsuario, {
          dataInicio: primeiroDiaAno,
          dataFim: ultimoDiaAno
        }),
        
        // All incomes for the year (for detailed listing)
        rendaService.listarPorUsuario(idUsuario, {
          dataInicio: primeiroDiaAno,
          dataFim: ultimoDiaAno
        })
      ])

      // Build monthly summary from grouped results
      const rendasMap = new Map(rendasMensais.map(r => [parseInt(r.mes), parseFloat(r.total || 0)]))
      const despesasMap = new Map(despesasMensais.map(d => [parseInt(d.mes), parseFloat(d.total || 0)]))
      
      let totalRendasAnual = 0
      let totalDespesasAnual = 0
      const resumosMensais = []

      for (let mes = 1; mes <= 12; mes++) {
        const totalRendas = rendasMap.get(mes) || 0
        const totalDespesas = despesasMap.get(mes) || 0
        
        totalRendasAnual += totalRendas
        totalDespesasAnual += totalDespesas

        resumosMensais.push({
          mes,
          total_rendas: parseFloat(totalRendas.toFixed(2)),
          total_despesas: parseFloat(totalDespesas.toFixed(2)),
          saldo: parseFloat((totalRendas - totalDespesas).toFixed(2))
        })
      }

      // Process expenses by account
      const despesasPorConta = despesasPorContaRaw
        .filter(d => d.conta)
        .map(d => ({
          conta: {
            Id_Conta: d.conta.Id_Conta,
            Nome_Conta: d.conta.Nome_Conta,
            Tipo: d.conta.Tipo,
            Cor_Hex: d.conta.Cor_Hex
          },
          total: parseFloat(parseFloat(d.dataValues?.total || d.total || 0).toFixed(2)),
          quantidade: parseInt(d.dataValues?.quantidade || d.quantidade || 0)
        }))

      return {
        ano: parseInt(ano),
        resumo: {
          total_rendas: parseFloat(totalRendasAnual.toFixed(2)),
          total_despesas: parseFloat(totalDespesasAnual.toFixed(2)),
          saldo_final: parseFloat((totalRendasAnual - totalDespesasAnual).toFixed(2))
        },
        evolucao_mensal: resumosMensais,
        rendas: rendasAno,
        despesas_por_conta: despesasPorConta,
        despesas_por_categoria: categorias
      }
    }, TTL.LONG)
  }

  async exportarRelatorioAnualCSV(idUsuario, ano) {
    const relatorio = await this.relatorioAnual(idUsuario, ano)

    let csv = `RELATÓRIO ANUAL ${ano}\n\n`
    csv += `Total Rendas;${relatorio.resumo.total_rendas.toFixed(2).replace('.', ',')}\n`
    csv += `Total Despesas;${relatorio.resumo.total_despesas.toFixed(2).replace('.', ',')}\n`
    csv += `Saldo Final;${relatorio.resumo.saldo_final.toFixed(2).replace('.', ',')}\n\n`

    csv += `MÊS;RENDAS;DESPESAS;SALDO\n`
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    relatorio.evolucao_mensal.forEach(m => {
      csv += `${meses[m.mes - 1]};${m.total_rendas.toFixed(2).replace('.', ',')};${m.total_despesas.toFixed(2).replace('.', ',')};${m.saldo.toFixed(2).replace('.', ',')}\n`
    })

    csv += `\nDESPESAS POR CONTA\n`
    csv += `CONTA;TIPO;TOTAL;QUANTIDADE\n`
    relatorio.despesas_por_conta.forEach(c => {
      csv += `${c.conta.Nome_Conta};${c.conta.Tipo};${c.total.toFixed(2).replace('.', ',')};${c.quantidade}\n`
    })

    csv += `\nDESPESAS POR CATEGORIA\n`
    csv += `CATEGORIA;TOTAL\n`
    relatorio.despesas_por_categoria.forEach(c => {
      csv += `${c.categoria};${c.total.toFixed(2).replace('.', ',')}\n`
    })

    return csv
  }
}

export default new DashboardService()
