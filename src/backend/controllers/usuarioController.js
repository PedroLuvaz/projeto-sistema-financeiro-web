const usuarioService = require('../services/usuarioService');

class UsuarioController {
  async registrar(req, res, next) {
    try {
      const resultado = await usuarioService.registrar(req.body);
      return res.status(201).json({
        success: true,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { Email, Senha } = req.body;

      if (!Email || !Senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const resultado = await usuarioService.login(Email, Senha);
      return res.status(200).json({
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
      const usuario = await usuarioService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  async listarTodos(req, res, next) {
    try {
      const usuarios = await usuarioService.listarTodos();
      return res.status(200).json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await usuarioService.deletar(id);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();
