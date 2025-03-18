const express = require('express');
const controller = require('../../controllers/olt/olt');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rota para validar sessão
router.get('/buscar', controller.get);

module.exports = router;