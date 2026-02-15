const express = require('express');
const router = express.Router();
const despesaController = require('../controllers/despesaController');
const auth = require('../middleware/auth');

// Rotas de despesas (protegidas)
router.post('/', auth, despesaController.criar);
router.get('/usuario/:idUsuario', auth, despesaController.listarPorUsuario);
router.get('/usuario/:idUsuario/total', auth, despesaController.calcularTotal);
router.get('/usuario/:idUsuario/categorias', auth, despesaController.calcularPorCategoria);
router.get('/usuario/:idUsuario/top', auth, despesaController.topDespesas);
router.get('/usuario/:idUsuario/exportar-csv', auth, despesaController.exportarCSV);
router.get('/:id', auth, despesaController.buscarPorId);
router.put('/:id', auth, despesaController.atualizar);
router.delete('/:id', auth, despesaController.deletar);

module.exports = router;
