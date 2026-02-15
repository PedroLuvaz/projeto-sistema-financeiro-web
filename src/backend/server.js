const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");

let server;

async function startServer() {
  try {
    // Testar conexão com banco de dados
    await sequelize.authenticate();
    console.log("[backend] Conexão com PostgreSQL estabelecida com sucesso.");

    // Sincronizar models (não altera estrutura em produção)
    if (env.nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      console.log("[backend] Models sincronizados.");
    }

    server = app.listen(env.port, () => {
      console.log(
        `[backend] Servidor rodando em http://localhost:${env.port} (${env.nodeEnv})`
      );
    });
  } catch (error) {
    console.error("[backend] Falha ao conectar no PostgreSQL:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  try {
    console.log(`[backend] Recebido ${signal}. Encerrando servidor...`);

    if (server) {
      server.close();
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("[backend] Erro no encerramento:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
