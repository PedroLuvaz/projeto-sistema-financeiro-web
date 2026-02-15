require('dotenv').config();
const models = require('../models');
const seed = require('../utils/seed');

async function run() {
  try {
    // Testar conexão
    await models.sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida\n');

    // Sincronizar models (criar tabelas se não existirem)
    console.log('🔄 Sincronizando models...');
    await models.sequelize.sync({ alter: false });
    console.log('✅ Models sincronizados\n');

    // Executar seed
    await seed();

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

run();
