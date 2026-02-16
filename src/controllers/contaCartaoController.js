import contaCartaoService from '@/services/contaCartaoService.js'

class ContaCartaoController {
  async criar(body) {
    const conta = await contaCartaoService.criar(body)
    return { status: 201, data: conta }
  }

  async buscarPorId(id) {
    const conta = await contaCartaoService.buscarPorId(id)
    return { status: 200, data: conta }
  }

  async listarPorUsuario(idUsuario, tipo) {
    const contas = await contaCartaoService.listarPorUsuario(idUsuario, tipo)
    return { status: 200, data: contas }
  }

  async atualizar(id, body) {
    const conta = await contaCartaoService.atualizar(id, body)
    return { status: 200, data: conta }
  }

  async deletar(id) {
    const resultado = await contaCartaoService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new ContaCartaoController()
