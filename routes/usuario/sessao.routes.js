const express = require('express');
const controller = require('../../controllers/usuario/sessao');
const router = express.Router();

// Rota para validar sessão
router.get('/sessao', controller.validarSessao);

module.exports = router;