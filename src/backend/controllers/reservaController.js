const reservaService = require('../services/reservaService');

class ReservaController {
  async criar(req, res, next) {
    try {
      const reserva = await reservaService.criar(req.body);
      return res.status(201).json({
        success: true,
        data: reserva
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: reserva
      });
    } catch (error) {
      next(error);
    }
  }

  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const reservas = await reservaService.listarPorUsuario(idUsuario);
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error) {
      next(error);
    }
  }

  async adicionarValor(req, res, next) {
    try {
      const { id } = req.params;
      const { valor } = req.body;
      
      if (!valor || valor <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor inválido'
        });
      }
      
      const reserva = await reservaService.adicionarValor(id, valor);
      return res.status(200).json({
        success: true,
        data: reserva
      });
    } catch (error) {
      next(error);
    }
  }

  async retirarValor(req, res, next) {
    try {
      const { id } = req.params;
      const { valor } = req.body;
      
      if (!valor || valor <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor inválido'
        });
      }
      
      const reserva = await reservaService.retirarValor(id, valor);
      return res.status(200).json({
        success: true,
        data: reserva
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: reserva
      });
    } catch (error) {
      next(error);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await reservaService.deletar(id);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservaController();
