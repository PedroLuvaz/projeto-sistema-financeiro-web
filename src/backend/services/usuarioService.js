const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

class UsuarioService {
  gerarToken(usuario) {
    return jwt.sign(
      { id: usuario.Id_Usuario, email: usuario.Email },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
  }

  async registrar(dados) {
    // Verificar se email já existe
    const existente = await Usuario.findOne({ where: { Email: dados.Email } });
    if (existente) {
      const error = new Error('Email já cadastrado');
      error.statusCode = 409;
      throw error;
    }

    const senhaHash = await bcrypt.hash(dados.Senha, 10);

    const usuario = await Usuario.create({
      ...dados,
      Senha: senhaHash
    });

    const { Senha, ...usuarioSemSenha } = usuario.toJSON();
    const token = this.gerarToken(usuario);

    return { usuario: usuarioSemSenha, token };
  }

  async login(email, senha) {
    const usuario = await Usuario.findOne({ where: { Email: email } });

    if (!usuario) {
      const error = new Error('Email ou senha inválidos');
      error.statusCode = 401;
      throw error;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    if (!senhaValida) {
      const error = new Error('Email ou senha inválidos');
      error.statusCode = 401;
      throw error;
    }

    const { Senha, ...usuarioSemSenha } = usuario.toJSON();
    const token = this.gerarToken(usuario);

    return { usuario: usuarioSemSenha, token };
  }

  async buscarPorId(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['Senha'] }
    });

    if (!usuario) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return usuario;
  }

  async buscarPorEmail(email) {
    const usuario = await Usuario.findOne({
      where: { Email: email }
    });

    return usuario;
  }

  async listarTodos() {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['Senha'] }
    });

    return usuarios;
  }

  async atualizar(id, dados) {
    const usuario = await this.buscarPorId(id);

    if (dados.Senha) {
      dados.Senha = await bcrypt.hash(dados.Senha, 10);
    }

    await usuario.update(dados);

    const { Senha, ...usuarioSemSenha } = usuario.toJSON();
    return usuarioSemSenha;
  }

  async deletar(id) {
    const usuario = await this.buscarPorId(id);
    await usuario.destroy();
    return { mensagem: 'Usuário deletado com sucesso' };
  }
}

module.exports = new UsuarioService();
