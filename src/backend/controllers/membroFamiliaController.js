const membroFamiliaService = require('../services/membroFamiliaService');

class MembroFamiliaController {
  async criar(req, res, next) {
    try {
      const membro = await membroFamiliaService.criar(req.body);
      return res.status(201).json({
        success: true,
        data: membro
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const membro = await membroFamiliaService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: membro
      });
    } catch (error) {
      next(error);
    }
  }

  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const membros = await membroFamiliaService.listarPorUsuario(idUsuario);
      return res.status(200).json({
        success: true,
        data: membros
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const membro = await membroFamiliaService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: membro
      });
    } catch (error) {
      next(error);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await membroFamiliaService.deletar(id);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MembroFamiliaController();
