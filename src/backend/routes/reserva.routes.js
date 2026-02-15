const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const auth = require('../middleware/auth');

// Rotas de reservas (protegidas)
router.post('/', auth, reservaController.criar);
router.get('/usuario/:idUsuario', auth, reservaController.listarPorUsuario);
router.get('/:id', auth, reservaController.buscarPorId);
router.put('/:id', auth, reservaController.atualizar);
router.put('/:id/adicionar', auth, reservaController.adicionarValor);
router.put('/:id/retirar', auth, reservaController.retirarValor);
router.delete('/:id', auth, reservaController.deletar);

module.exports = router;
