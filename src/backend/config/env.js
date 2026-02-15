const dotenv = require("dotenv");

dotenv.config();

function toBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return String(value).toLowerCase() === "true";
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || "financeiro_web",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: toBoolean(process.env.DB_SSL, false),
  },
};

module.exports = env;
