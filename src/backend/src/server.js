const app = require("./app");
const env = require("./config/env");
const { pool, checkDatabaseConnection } = require("./config/database");

let server;

async function startServer() {
  try {
    await checkDatabaseConnection();
    console.log("[backend] Conexao com PostgreSQL estabelecida com sucesso.");

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

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("[backend] Erro no encerramento:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
