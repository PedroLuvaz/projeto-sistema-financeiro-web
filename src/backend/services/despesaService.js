const { Despesa, ContaCartao, ParcelamentoAgrupador, sequelize } = require('../models');
const { Op } = require('sequelize');

class DespesaService {
  /**
   * Cria uma despesa. Se numeroParcelas > 1, cria automaticamente
   * o ParcelamentoAgrupador e gera N registros de despesa (1 por mês).
   */
  async criar(dados) {
    const numeroParcelas = dados.Numero_Parcelas || 1;

    // Despesa simples (à vista)
    if (numeroParcelas <= 1) {
      const despesa = await Despesa.create({
        Id_Usuario: dados.Id_Usuario,
        Id_Conta: dados.Id_Conta,
        Descricao_Despesa: dados.Descricao_Despesa,
        Valor_Parcela: dados.Valor_Parcela || dados.Valor_Total || 0,
        Data: dados.Data,
        Categoria: dados.Categoria,
        Numero_Parcela: 1
      });
      return await this.buscarPorId(despesa.Id_Despesa);
    }

    // Despesa parcelada — criar agrupador + N parcelas
    const transaction = await sequelize.transaction();

    try {
      const valorTotal = parseFloat(dados.Valor_Total || 0);
      const valorParcela = parseFloat((valorTotal / numeroParcelas).toFixed(2));

      // 1. Criar ParcelamentoAgrupador
      const parcelamento = await ParcelamentoAgrupador.create({
        Id_Usuario: dados.Id_Usuario,
        Descricao_Parcela: dados.Descricao_Despesa,
        Valor_Total: valorTotal,
        Qtd_Parcelas: numeroParcelas,
        Data_Inicio: dados.Data
      }, { transaction });

      // 2. Gerar N despesas incrementando o mês
      const despesasCriadas = [];
      const dataBase = new Date(dados.Data);

      for (let i = 0; i < numeroParcelas; i++) {
        const dataParcela = new Date(dataBase);
        dataParcela.setMonth(dataParcela.getMonth() + i);

        // Formatar como YYYY-MM-DD
        const dataFormatada = dataParcela.toISOString().split('T')[0];

        const despesa = await Despesa.create({
          Id_Usuario: dados.Id_Usuario,
          Id_Conta: dados.Id_Conta,
          Id_Parcelamento: parcelamento.Id_Parcelamento,
          Descricao_Despesa: dados.Descricao_Despesa,
          Valor_Parcela: valorParcela,
          Data: dataFormatada,
          Categoria: dados.Categoria,
          Numero_Parcela: i + 1
        }, { transaction });

        despesasCriadas.push(despesa);
      }

      await transaction.commit();

      return {
        parcelamento,
        despesas: despesasCriadas
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async buscarPorId(id) {
    const despesa = await Despesa.findByPk(id, {
      include: [
        {
          model: ContaCartao,
          as: 'conta',
          attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
        },
        {
          model: ParcelamentoAgrupador,
          as: 'parcelamento',
          attributes: ['Id_Parcelamento', 'Descricao_Parcela', 'Qtd_Parcelas', 'Valor_Total']
        }
      ]
    });

    if (!despesa) {
      const error = new Error('Despesa não encontrada');
      error.statusCode = 404;
      throw error;
    }

    return despesa;
  }

  /**
   * Lista despesas filtrando por mês/ano (obrigatório para dashboard).
   * Se receber mes e ano, filtra pelo mês inteiro.
   * Se receber dataInicio/dataFim, filtra por período customizado.
   */
  async listarPorUsuario(idUsuario, filtros = {}) {
    const where = { Id_Usuario: idUsuario };

    // Filtro por mês/ano (prioridade — usado pelo dashboard)
    if (filtros.mes && filtros.ano) {
      const mes = parseInt(filtros.mes);
      const ano = parseInt(filtros.ano);
      const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0];
      where.Data = { [Op.between]: [primeiroDia, ultimoDia] };
    }
    // Filtro por período customizado
    else if (filtros.dataInicio && filtros.dataFim) {
      where.Data = { [Op.between]: [filtros.dataInicio, filtros.dataFim] };
    } else if (filtros.dataInicio) {
      where.Data = { [Op.gte]: filtros.dataInicio };
    } else if (filtros.dataFim) {
      where.Data = { [Op.lte]: filtros.dataFim };
    }

    if (filtros.categoria) {
      where.Categoria = filtros.categoria;
    }

    if (filtros.idConta) {
      where.Id_Conta = filtros.idConta;
    }

    const despesas = await Despesa.findAll({
      where,
      include: [
        {
          model: ContaCartao,
          as: 'conta',
          attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
        },
        {
          model: ParcelamentoAgrupador,
          as: 'parcelamento',
          attributes: ['Id_Parcelamento', 'Descricao_Parcela', 'Qtd_Parcelas', 'Valor_Total']
        }
      ],
      order: [['Data', 'DESC']]
    });

    return despesas;
  }

  /**
   * Calcula total de despesas num período
   */
  async calcularTotalPorPeriodo(idUsuario, filtros = {}) {
    const despesas = await this.listarPorUsuario(idUsuario, filtros);

    const total = despesas.reduce((acc, d) => acc + parseFloat(d.Valor_Parcela), 0);
    return parseFloat(total.toFixed(2));
  }

  /**
   * Calcula totais agrupados por categoria
   */
  async calcularPorCategoria(idUsuario, filtros = {}) {
    const despesas = await this.listarPorUsuario(idUsuario, filtros);

    const porCategoria = {};
    despesas.forEach(d => {
      const cat = d.Categoria;
      if (!porCategoria[cat]) porCategoria[cat] = 0;
      porCategoria[cat] += parseFloat(d.Valor_Parcela);
    });

    // Retornar como array
    return Object.entries(porCategoria).map(([categoria, total]) => ({
      categoria,
      total: parseFloat(total.toFixed(2))
    }));
  }

  /**
   * Top N maiores despesas do período
   */
  async topDespesas(idUsuario, filtros = {}, limite = 5) {
    const despesas = await this.listarPorUsuario(idUsuario, filtros);

    return despesas
      .sort((a, b) => parseFloat(b.Valor_Parcela) - parseFloat(a.Valor_Parcela))
      .slice(0, limite);
  }

  /**
   * Exporta despesas como CSV
   */
  async exportarCSV(idUsuario, filtros = {}) {
    const despesas = await this.listarPorUsuario(idUsuario, filtros);

    const header = 'Descricao;Valor;Data;Categoria;Conta;Parcela\n';
    const linhas = despesas.map(d => {
      return [
        d.Descricao_Despesa,
        parseFloat(d.Valor_Parcela).toFixed(2).replace('.', ','),
        d.Data,
        d.Categoria,
        d.conta?.Nome_Conta || '',
        d.parcelamento ? `${d.Numero_Parcela}/${d.parcelamento.Qtd_Parcelas}` : 'À vista'
      ].join(';');
    }).join('\n');

    return header + linhas;
  }

  async atualizar(id, dados) {
    const despesa = await this.buscarPorId(id);
    await despesa.update(dados);
    return await this.buscarPorId(id);
  }

  /**
   * Deleta uma despesa. Se for parcelada, pode deletar todas do parcelamento.
   */
  async deletar(id, deletarParcelamento = false) {
    const despesa = await this.buscarPorId(id);

    if (deletarParcelamento && despesa.Id_Parcelamento) {
      // Deleta o parcelamento inteiro (CASCADE apaga todas as parcelas)
      const parcelamento = await ParcelamentoAgrupador.findByPk(despesa.Id_Parcelamento);
      if (parcelamento) {
        await parcelamento.destroy();
        return { mensagem: 'Parcelamento e todas as parcelas deletados com sucesso' };
      }
    }

    await despesa.destroy();
    return { mensagem: 'Despesa deletada com sucesso' };
  }
}

module.exports = new DespesaService();
