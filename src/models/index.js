import sequelize from '@/config/database'

import defineUsuario from './Usuario.js'
import defineMembroFamilia from './MembroFamilia.js'
import defineContaCartao from './ContaCartao.js'
import defineRenda from './Renda.js'
import defineParcelamentoAgrupador from './ParcelamentoAgrupador.js'
import defineDespesa from './Despesa.js'
import defineReserva from './Reserva.js'

const Usuario = defineUsuario(sequelize)
const MembroFamilia = defineMembroFamilia(sequelize)
const ContaCartao = defineContaCartao(sequelize)
const Renda = defineRenda(sequelize)
const ParcelamentoAgrupador = defineParcelamentoAgrupador(sequelize)
const Despesa = defineDespesa(sequelize)
const Reserva = defineReserva(sequelize)

const models = {
  Usuario,
  MembroFamilia,
  ContaCartao,
  Renda,
  ParcelamentoAgrupador,
  Despesa,
  Reserva,
  sequelize
}

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

export default models
