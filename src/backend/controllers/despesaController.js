const despesaService = require('../services/despesaService');

class DespesaController {
  /**
   * Cria despesa. Se Numero_Parcelas > 1, cria parcelamento automático.
   * Body: { Id_Usuario, Id_Conta, Descricao_Despesa, Valor_Total, Data, Categoria, Numero_Parcelas }
   */
  async criar(req, res, next) {
    try {
      const resultado = await despesaService.criar(req.body);
      return res.status(201).json({
        success: true,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const despesa = await despesaService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: despesa
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista despesas por usuário com filtros: mes, ano, dataInicio, dataFim, categoria, idConta
   */
  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano, dataInicio, dataFim, categoria, idConta } = req.query;

      const filtros = {};
      if (mes) filtros.mes = mes;
      if (ano) filtros.ano = ano;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;
      if (categoria) filtros.categoria = categoria;
      if (idConta) filtros.idConta = idConta;

      const despesas = await despesaService.listarPorUsuario(idUsuario, filtros);
      return res.status(200).json({
        success: true,
        data: despesas
      });
    } catch (error) {
      next(error);
    }
  }

  async calcularTotal(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano, dataInicio, dataFim } = req.query;

      const filtros = {};
      if (mes) filtros.mes = mes;
      if (ano) filtros.ano = ano;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;

      const total = await despesaService.calcularTotalPorPeriodo(idUsuario, filtros);
      return res.status(200).json({
        success: true,
        data: { total }
      });
    } catch (error) {
      next(error);
    }
  }

  async calcularPorCategoria(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano, dataInicio, dataFim } = req.query;

      const filtros = {};
      if (mes) filtros.mes = mes;
      if (ano) filtros.ano = ano;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;

      const porCategoria = await despesaService.calcularPorCategoria(idUsuario, filtros);
      return res.status(200).json({
        success: true,
        data: porCategoria
      });
    } catch (error) {
      next(error);
    }
  }

  async topDespesas(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano, limite } = req.query;

      const filtros = {};
      if (mes) filtros.mes = mes;
      if (ano) filtros.ano = ano;

      const top = await despesaService.topDespesas(idUsuario, filtros, parseInt(limite) || 5);
      return res.status(200).json({
        success: true,
        data: top
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportação CSV das despesas
   */
  async exportarCSV(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano, dataInicio, dataFim } = req.query;

      const filtros = {};
      if (mes) filtros.mes = mes;
      if (ano) filtros.ano = ano;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;

      const csv = await despesaService.exportarCSV(idUsuario, filtros);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=despesas-${mes || 'todas'}-${ano || 'todos'}.csv`);
      return res.send('\ufeff' + csv); // BOM para Excel
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const despesa = await despesaService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: despesa
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta despesa. Query param ?parcelamento=true deleta o parcelamento inteiro.
   */
  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletarParcelamento = req.query.parcelamento === 'true';
      const resultado = await despesaService.deletar(id, deletarParcelamento);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DespesaController();
