function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message =
    err.message || "Erro interno no servidor. Tente novamente mais tarde.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
