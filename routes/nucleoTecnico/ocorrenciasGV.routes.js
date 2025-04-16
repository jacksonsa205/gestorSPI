const express = require('express');
const controller = require('../../controllers/nucleoTecnico/ocorrenciasGV');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas para consulta de ocorrências com coordenadas
router.get('/ocorrencia-grande-vulto/buscar', controller.get);
router.get('/ocorrencia-grande-vulto/:id', controller.getById);
router.put('/ocorrencia-grande-vulto/:ocorrencia/acao', controller.updateAcao);

module.exports = router;