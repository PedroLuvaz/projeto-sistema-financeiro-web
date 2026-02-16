import { Op } from 'sequelize'
import models from '@/models/index.js'

const { Renda } = models

class RendaService {
  async criar(dados) {
    const renda = await Renda.create(dados)
    return renda
  }

  async buscarPorId(id) {
    const renda = await Renda.findByPk(id)
    if (!renda) {
      const error = new Error('Renda não encontrada')
      error.statusCode = 404
      throw error
    }
    return renda
  }

  async listarPorUsuario(idUsuario, filtros = {}) {
    const where = { Id_Usuario: idUsuario }

    if (filtros.mes && filtros.ano) {
      const mes = parseInt(filtros.mes)
      const ano = parseInt(filtros.ano)
      const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
      const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0]
      where.Data = { [Op.between]: [primeiroDia, ultimoDia] }
    } else if (filtros.dataInicio && filtros.dataFim) {
      where.Data = { [Op.between]: [filtros.dataInicio, filtros.dataFim] }
    } else if (filtros.dataInicio) {
      where.Data = { [Op.gte]: filtros.dataInicio }
    } else if (filtros.dataFim) {
      where.Data = { [Op.lte]: filtros.dataFim }
    }

    const rendas = await Renda.findAll({
      where,
      order: [['Data', 'DESC']]
    })
    return rendas
  }

  async calcularTotalPorPeriodo(idUsuario, filtros = {}) {
    const rendas = await this.listarPorUsuario(idUsuario, filtros)
    const total = rendas.reduce((acc, r) => acc + parseFloat(r.Valor_Renda), 0)
    return parseFloat(total.toFixed(2))
  }

  async atualizar(id, dados) {
    const renda = await this.buscarPorId(id)
    await renda.update(dados)
    return renda
  }

  async deletar(id) {
    const renda = await this.buscarPorId(id)
    await renda.destroy()
    return { mensagem: 'Renda deletada com sucesso' }
  }
}

export default new RendaService()
