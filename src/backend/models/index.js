const sequelize = require('../config/database');

// Importar todos os models
const Usuario = require('./Usuario')(sequelize);
const MembroFamilia = require('./MembroFamilia')(sequelize);
const ContaCartao = require('./ContaCartao')(sequelize);
const Renda = require('./Renda')(sequelize);
const ParcelamentoAgrupador = require('./ParcelamentoAgrupador')(sequelize);
const Despesa = require('./Despesa')(sequelize);
const Reserva = require('./Reserva')(sequelize);

// Criar objeto com todos os models
const models = {
  Usuario,
  MembroFamilia,
  ContaCartao,
  Renda,
  ParcelamentoAgrupador,
  Despesa,
  Reserva,
  sequelize
};

// Executar as associações
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
