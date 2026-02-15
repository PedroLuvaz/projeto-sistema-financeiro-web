const express = require('express');
const router = express.Router();
const rendaController = require('../controllers/rendaController');
const auth = require('../middleware/auth');

// Rotas de rendas (protegidas)
router.post('/', auth, rendaController.criar);
router.get('/usuario/:idUsuario', auth, rendaController.listarPorUsuario);
router.get('/usuario/:idUsuario/total', auth, rendaController.calcularTotal);
router.get('/:id', auth, rendaController.buscarPorId);
router.put('/:id', auth, rendaController.atualizar);
router.delete('/:id', auth, rendaController.deletar);

module.exports = router;
