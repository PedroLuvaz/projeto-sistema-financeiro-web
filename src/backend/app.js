const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger.json");

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend do sistema financeiro online.",
  });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
