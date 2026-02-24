import { Op } from 'sequelize'
import models from '@/models/index.js'

const { Renda } = models

// Gera data YYYY-MM-DD para um mês/ano com o dia informado (clampado ao último dia do mês)
function gerarData(ano, mes, dia) {
  const ultimoDia = new Date(ano, mes, 0).getDate()
  const d = Math.min(dia, ultimoDia)
  return `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

class RendaService {
  async criar(dados) {
    const { Fixa, Dia_Vencimento, Data, Id_Usuario, Descricao_Renda, Valor_Renda } = dados

    if (!Fixa) {
      return Renda.create({ Id_Usuario, Descricao_Renda, Valor_Renda, Data, Fixa: false })
    }

    // Renda fixa: gera 12 meses a partir do mês da data informada
    const dia = Dia_Vencimento || parseInt(Data.split('-')[2]) || 1
    const dataRef = new Date(Data + 'T00:00:00')
    const mesInicio = dataRef.getMonth() + 1
    const anoInicio = dataRef.getFullYear()

    const registros = []
    for (let i = 0; i < 12; i++) {
      let mes = mesInicio + i
      let ano = anoInicio
      if (mes > 12) { mes -= 12; ano += 1 }
      registros.push({
        Id_Usuario,
        Descricao_Renda,
        Valor_Renda,
        Data: gerarData(ano, mes, dia),
        Fixa: true,
        Dia_Vencimento: dia,
      })
    }

    const criadas = await Renda.bulkCreate(registros, { returning: true })
    return criadas
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

    return Renda.findAll({ where, order: [['Data', 'DESC']] })
  }

  async calcularTotalPorPeriodo(idUsuario, filtros = {}) {
    const rendas = await this.listarPorUsuario(idUsuario, filtros)
    const total = rendas.reduce((acc, r) => acc + parseFloat(r.Valor_Renda), 0)
    return parseFloat(total.toFixed(2))
  }

  async atualizar(id, dados) {
    const renda = await this.buscarPorId(id)

    // Se pedir para atualizar todas as ocorrências futuras da renda fixa
    if (dados.atualizarTodas && renda.Fixa) {
      const rendas = await Renda.findAll({
        where: {
          Id_Usuario: renda.Id_Usuario,
          Fixa: true,
          Descricao_Renda: renda.Descricao_Renda,
          Dia_Vencimento: renda.Dia_Vencimento,
          Data: { [Op.gte]: renda.Data },
        }
      })

      const { atualizarTodas, ...novosDados } = dados
      for (const r of rendas) {
        const update = { ...novosDados }
        if (dados.Dia_Vencimento !== undefined) {
          const [ano, mes] = r.Data.split('-').map(Number)
          update.Data = gerarData(ano, mes, dados.Dia_Vencimento)
        }
        await r.update(update)
      }
      return rendas[0]
    }

    const { atualizarTodas, ...rest } = dados
    await renda.update(rest)
    return renda
  }

  async deletar(id, deletarTodas = false) {
    const renda = await this.buscarPorId(id)

    if (deletarTodas && renda.Fixa) {
      await Renda.destroy({
        where: {
          Id_Usuario: renda.Id_Usuario,
          Fixa: true,
          Descricao_Renda: renda.Descricao_Renda,
          Dia_Vencimento: renda.Dia_Vencimento,
          Data: { [Op.gte]: renda.Data },
        }
      })
      return { mensagem: 'Rendas fixas deletadas com sucesso' }
    }

    await renda.destroy()
    return { mensagem: 'Renda deletada com sucesso' }
  }
}

export default new RendaService()
