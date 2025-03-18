const express = require('express');
const controller = require('../../controllers/nucleoTecnico/oltIsolada');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas CRUD completas
router.post('/olt-isolada/cadastrar', controller.post); // Cadastrar uma nova OLT Isolada
router.get('/olt-isolada/buscar', controller.get); // Listar todas as OLTs Isoladas
router.get('/olt-isolada/buscar/:TA', controller.getByTA); // Buscar uma OLT Isolada por TA
router.put('/olt-isolada/editar/:TA', controller.put); // Editar uma OLT Isolada por TA
router.delete('/olt-isolada/excluir/:TA', controller.delete); // Excluir uma OLT Isolada por TA

module.exports = router;