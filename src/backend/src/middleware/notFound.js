function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: "Rota nao encontrada.",
  });
}

module.exports = notFound;
