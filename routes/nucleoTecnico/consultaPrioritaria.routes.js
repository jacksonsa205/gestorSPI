const express = require('express');
const controller = require('../../controllers/nucleoTecnico/consultaPrioritaria');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rotas CRUD completas
router.post('/consulta-prioritaria/cadastrar', controller.post);
router.get('/consulta-prioritaria/buscar', controller.get);
router.get('/consulta-prioritaria/buscar/:id', controller.getById);
router.put('/consulta-prioritaria/editar/:id', controller.put);
router.delete('/consulta-prioritaria/excluir/:id', controller.delete);

module.exports = router;