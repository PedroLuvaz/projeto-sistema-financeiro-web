const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Dashboard e relatórios (protegidos)
router.get('/usuario/:idUsuario/resumo-mensal', auth, dashboardController.resumoMensal);
router.get('/usuario/:idUsuario/relatorio-anual', auth, dashboardController.relatorioAnual);
router.get('/usuario/:idUsuario/relatorio-anual/csv', auth, dashboardController.exportarRelatorioAnualCSV);

module.exports = router;
