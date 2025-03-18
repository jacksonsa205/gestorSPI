const express = require('express');
const controller = require('../../controllers/gestaoObras/reporteREM');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas CRUD completas
router.post('/cadastrar', controller.post);
router.get('/buscar', controller.get);
router.get('/buscar/:rem', controller.getByIdObra);
router.put('/editar/:rem', controller.put);
router.delete('/excluir/:rem', controller.delete);

module.exports = router;