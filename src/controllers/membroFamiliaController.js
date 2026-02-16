import membroFamiliaService from '@/services/membroFamiliaService.js'

class MembroFamiliaController {
  async criar(body) {
    const membro = await membroFamiliaService.criar(body)
    return { status: 201, data: membro }
  }

  async buscarPorId(id) {
    const membro = await membroFamiliaService.buscarPorId(id)
    return { status: 200, data: membro }
  }

  async listarPorUsuario(idUsuario) {
    const membros = await membroFamiliaService.listarPorUsuario(idUsuario)
    return { status: 200, data: membros }
  }

  async atualizar(id, body) {
    const membro = await membroFamiliaService.atualizar(id, body)
    return { status: 200, data: membro }
  }

  async deletar(id) {
    const resultado = await membroFamiliaService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new MembroFamiliaController()
