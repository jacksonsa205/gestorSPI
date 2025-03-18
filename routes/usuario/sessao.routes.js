const express = require('express');
const controller = require('../../controllers/usuario/sessao');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rota para validar sessão
router.get('/sessao', controller.validarSessao);

module.exports = router;