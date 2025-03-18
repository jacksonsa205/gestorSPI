const express = require('express');
const controller = require('../../controllers/nucleoTecnico/oltUplink');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas CRUD completas
router.post('/olt-uplink/cadastrar', controller.post); // Cadastrar uma nova OLT Isolada
router.get('/olt-uplink/buscar', controller.get); // Listar todas as OLTs Isoladas
router.get('/olt-uplink/buscar/:TA', controller.getByTA); // Buscar uma OLT Isolada por TA
router.put('/olt-uplink/editar/:TA', controller.put); // Editar uma OLT Isolada por TA
router.delete('/olt-uplink/excluir/:TA', controller.delete); // Excluir uma OLT Isolada por TA

module.exports = router;