const express = require('express');
const router = express.Router();
const controller = require('../../controllers/logs/logs');

// Rota para registrar logs (sem auth para facilitar, mas você pode adicionar se necessário)
router.post('/registrar', controller.registrarLogController);
router.get('/buscar', controller.buscarTodosLogsController);

module.exports = router;