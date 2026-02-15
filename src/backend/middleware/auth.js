const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Use: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.usuarioId = decoded.id;
    req.usuarioEmail = decoded.email;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
}

module.exports = authMiddleware;
