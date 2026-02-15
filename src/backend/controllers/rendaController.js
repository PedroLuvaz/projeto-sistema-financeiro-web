const rendaService = require('../services/rendaService');

class RendaController {
  async criar(req, res, next) {
    try {
      const renda = await rendaService.criar(req.body);
      return res.status(201).json({
        success: true,
        data: renda
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const renda = await rendaService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: renda
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista rendas por usuário com filtros: mes, ano, dataInicio, dataFim
   */
  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano, dataInicio, dataFim } = req.query;

      const filtros = {};
      if (mes) filtros.mes = mes;
      if (ano) filtros.ano = ano;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;

      const rendas = await rendaService.listarPorUsuario(idUsuario, filtros);
      return res.status(200).json({
        success: true,
        data: rendas
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

      const total = await rendaService.calcularTotalPorPeriodo(idUsuario, filtros);
      return res.status(200).json({
        success: true,
        data: { total }
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const renda = await rendaService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: renda
      });
    } catch (error) {
      next(error);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await rendaService.deletar(id);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RendaController();
