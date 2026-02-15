const contaCartaoService = require('../services/contaCartaoService');

class ContaCartaoController {
  async criar(req, res, next) {
    try {
      const conta = await contaCartaoService.criar(req.body);
      return res.status(201).json({
        success: true,
        data: conta
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const conta = await contaCartaoService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: conta
      });
    } catch (error) {
      next(error);
    }
  }

  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { tipo } = req.query;
      const contas = await contaCartaoService.listarPorUsuario(idUsuario, tipo);
      return res.status(200).json({
        success: true,
        data: contas
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const conta = await contaCartaoService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: conta
      });
    } catch (error) {
      next(error);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await contaCartaoService.deletar(id);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContaCartaoController();
