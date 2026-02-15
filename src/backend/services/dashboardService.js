const despesaService = require('./despesaService');
const rendaService = require('./rendaService');
const { Despesa, Renda, ContaCartao } = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  /**
   * Resumo mensal completo para o dashboard
   */
  async resumoMensal(idUsuario, mes, ano) {
    const filtros = { mes, ano };

    // Calcular totais em paralelo
    const [totalRendas, totalDespesas, despesasPorCategoria, topDespesas] = await Promise.all([
      rendaService.calcularTotalPorPeriodo(idUsuario, filtros),
      despesaService.calcularTotalPorPeriodo(idUsuario, filtros),
      despesaService.calcularPorCategoria(idUsuario, filtros),
      despesaService.topDespesas(idUsuario, filtros, 5)
    ]);

    const saldoLiquido = parseFloat((totalRendas - totalDespesas).toFixed(2));

    return {
      mes: parseInt(mes),
      ano: parseInt(ano),
      total_rendas: totalRendas,
      total_despesas: totalDespesas,
      saldo_liquido: saldoLiquido,
      despesas_por_categoria: despesasPorCategoria,
      top_5_despesas: topDespesas
    };
  }

  /**
   * Relatório anual completo
   */
  async relatorioAnual(idUsuario, ano) {
    const resumosMensais = [];
    let totalRendasAnual = 0;
    let totalDespesasAnual = 0;

    // Calcular mês a mês
    for (let mes = 1; mes <= 12; mes++) {
      const filtros = { mes: String(mes), ano: String(ano) };

      const [totalRendas, totalDespesas] = await Promise.all([
        rendaService.calcularTotalPorPeriodo(idUsuario, filtros),
        despesaService.calcularTotalPorPeriodo(idUsuario, filtros)
      ]);

      totalRendasAnual += totalRendas;
      totalDespesasAnual += totalDespesas;

      resumosMensais.push({
        mes,
        total_rendas: totalRendas,
        total_despesas: totalDespesas,
        saldo: parseFloat((totalRendas - totalDespesas).toFixed(2))
      });
    }

    // Listar rendas do ano inteiro
    const rendasAno = await rendaService.listarPorUsuario(idUsuario, {
      dataInicio: `${ano}-01-01`,
      dataFim: `${ano}-12-31`
    });

    // Despesas agrupadas por conta/cartão
    const primeiroDiaAno = `${ano}-01-01`;
    const ultimoDiaAno = `${ano}-12-31`;

    const contas = await ContaCartao.findAll({
      where: { Id_Usuario: idUsuario }
    });

    const despesasPorConta = [];

    for (const conta of contas) {
      const despesas = await Despesa.findAll({
        where: {
          Id_Usuario: idUsuario,
          Id_Conta: conta.Id_Conta,
          Data: { [Op.between]: [primeiroDiaAno, ultimoDiaAno] }
        },
        order: [['Data', 'DESC']]
      });

      const totalConta = despesas.reduce((acc, d) => acc + parseFloat(d.Valor_Parcela), 0);

      if (despesas.length > 0) {
        despesasPorConta.push({
          conta: {
            Id_Conta: conta.Id_Conta,
            Nome_Conta: conta.Nome_Conta,
            Tipo: conta.Tipo,
            Cor_Hex: conta.Cor_Hex
          },
          total: parseFloat(totalConta.toFixed(2)),
          quantidade: despesas.length
        });
      }
    }

    // Despesas por categoria no ano
    const categorias = await despesaService.calcularPorCategoria(idUsuario, {
      dataInicio: primeiroDiaAno,
      dataFim: ultimoDiaAno
    });

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
    };
  }

  /**
   * Exporta relatório anual como CSV
   */
  async exportarRelatorioAnualCSV(idUsuario, ano) {
    const relatorio = await this.relatorioAnual(idUsuario, ano);

    let csv = `RELATÓRIO ANUAL ${ano}\n\n`;

    // Resumo
    csv += `Total Rendas;${relatorio.resumo.total_rendas.toFixed(2).replace('.', ',')}\n`;
    csv += `Total Despesas;${relatorio.resumo.total_despesas.toFixed(2).replace('.', ',')}\n`;
    csv += `Saldo Final;${relatorio.resumo.saldo_final.toFixed(2).replace('.', ',')}\n\n`;

    // Evolução mensal
    csv += `MÊS;RENDAS;DESPESAS;SALDO\n`;
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    relatorio.evolucao_mensal.forEach(m => {
      csv += `${meses[m.mes - 1]};${m.total_rendas.toFixed(2).replace('.', ',')};${m.total_despesas.toFixed(2).replace('.', ',')};${m.saldo.toFixed(2).replace('.', ',')}\n`;
    });

    csv += `\nDESPESAS POR CONTA\n`;
    csv += `CONTA;TIPO;TOTAL;QUANTIDADE\n`;
    relatorio.despesas_por_conta.forEach(c => {
      csv += `${c.conta.Nome_Conta};${c.conta.Tipo};${c.total.toFixed(2).replace('.', ',')};${c.quantidade}\n`;
    });

    csv += `\nDESPESAS POR CATEGORIA\n`;
    csv += `CATEGORIA;TOTAL\n`;
    relatorio.despesas_por_categoria.forEach(c => {
      csv += `${c.categoria};${c.total.toFixed(2).replace('.', ',')}\n`;
    });

    return csv;
  }
}

module.exports = new DashboardService();
