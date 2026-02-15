const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);

// Rotas protegidas
router.get('/', auth, usuarioController.listarTodos);
router.get('/:id', auth, usuarioController.buscarPorId);
router.put('/:id', auth, usuarioController.atualizar);
router.delete('/:id', auth, usuarioController.deletar);

module.exports = router;
