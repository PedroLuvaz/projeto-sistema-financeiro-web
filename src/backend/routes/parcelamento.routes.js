const express = require('express');
const router = express.Router();
const parcelamentoAgrupadorController = require('../controllers/parcelamentoAgrupadorController');
const auth = require('../middleware/auth');

// Rotas de parcelamentos (protegidas)
router.post('/', auth, parcelamentoAgrupadorController.criar);
router.get('/usuario/:idUsuario', auth, parcelamentoAgrupadorController.listarPorUsuario);
router.get('/usuario/:idUsuario/dividas-futuras', auth, parcelamentoAgrupadorController.dividasFuturas);
router.get('/usuario/:idUsuario/cronograma', auth, parcelamentoAgrupadorController.cronograma);
router.get('/usuario/:idUsuario/faturas', auth, parcelamentoAgrupadorController.faturaPorCartao);
router.get('/:id', auth, parcelamentoAgrupadorController.buscarPorId);
router.put('/:id', auth, parcelamentoAgrupadorController.atualizar);
router.delete('/:id', auth, parcelamentoAgrupadorController.deletar);

module.exports = router;
