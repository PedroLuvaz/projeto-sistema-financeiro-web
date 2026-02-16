import usuarioService from '@/services/usuarioService.js'

class UsuarioController {
  async registrar(body) {
    const resultado = await usuarioService.registrar(body)
    return { status: 201, data: resultado }
  }

  async login(body) {
    const { Email, Senha } = body
    if (!Email || !Senha) {
      return { status: 400, error: 'Email e senha são obrigatórios' }
    }
    const resultado = await usuarioService.login(Email, Senha)
    return { status: 200, data: resultado }
  }

  async buscarPorId(id) {
    const usuario = await usuarioService.buscarPorId(id)
    return { status: 200, data: usuario }
  }

  async listarTodos() {
    const usuarios = await usuarioService.listarTodos()
    return { status: 200, data: usuarios }
  }

  async atualizar(id, body) {
    const usuario = await usuarioService.atualizar(id, body)
    return { status: 200, data: usuario }
  }

  async deletar(id) {
    const resultado = await usuarioService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new UsuarioController()
