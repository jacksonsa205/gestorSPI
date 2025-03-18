const express = require('express');
const controller = require('../../controllers/nucleoTecnico/consultaOLT');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas CRUD completas
router.post('/cadastrar', controller.post);
router.get('/buscar', controller.get);
router.get('/buscar/:codigo', controller.getByCodigo);
router.put('/editar/:codigo', controller.put);
router.delete('/excluir/:codigo', controller.delete);

module.exports = router;