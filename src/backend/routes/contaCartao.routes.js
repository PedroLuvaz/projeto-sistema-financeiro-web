const express = require('express');
const router = express.Router();
const contaCartaoController = require('../controllers/contaCartaoController');
const auth = require('../middleware/auth');

// Rotas de contas e cartões (protegidas)
router.post('/', auth, contaCartaoController.criar);
router.get('/usuario/:idUsuario', auth, contaCartaoController.listarPorUsuario);
router.get('/:id', auth, contaCartaoController.buscarPorId);
router.put('/:id', auth, contaCartaoController.atualizar);
router.delete('/:id', auth, contaCartaoController.deletar);

module.exports = router;
