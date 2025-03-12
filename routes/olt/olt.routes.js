const express = require('express');
const controller = require('../../controllers/olt/olt');
const router = express.Router();

// Rota para validar sessão
router.get('/buscar', controller.get);

module.exports = router;