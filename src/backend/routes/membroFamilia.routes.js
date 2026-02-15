const express = require('express');
const router = express.Router();
const membroFamiliaController = require('../controllers/membroFamiliaController');
const auth = require('../middleware/auth');

// Rotas de membros da família (protegidas)
router.post('/', auth, membroFamiliaController.criar);
router.get('/usuario/:idUsuario', auth, membroFamiliaController.listarPorUsuario);
router.get('/:id', auth, membroFamiliaController.buscarPorId);
router.put('/:id', auth, membroFamiliaController.atualizar);
router.delete('/:id', auth, membroFamiliaController.deletar);

module.exports = router;
