const express = require('express');
const controller = require('../../controllers/nucleoTecnico/gestaoCarimbo');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas CRUD completas
router.post('/gestao-carimbo/cadastrar', controller.post);
router.get('/gestao-carimbo/buscar', controller.get);
router.get('/gestao-carimbo/buscar/:ta', controller.getByTa);
router.put('/gestao-carimbo/editar/:ta', controller.put);
router.delete('/gestao-carimbo/excluir/:ta', controller.delete);
router.put('/gestao-carimbo/escalonar/:ta', controller.marcarEscalonamentoWhatsApp);

module.exports = router;