const sequelize = require("./src/config/database");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com Neon estabelecida com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao conectar:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
