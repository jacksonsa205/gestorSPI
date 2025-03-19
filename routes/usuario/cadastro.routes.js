const express = require('express');
const router = express.Router();

const validateOrigin = require('../../middleware/blockBrowserAccess');
const blockBrowserAccess = require('../../middleware/blockBrowserAccess'); // Importe o middleware
const controller = require('../../controllers/usuario/cadastro');

// Aplica os middlewares
router.use(blockBrowserAccess);
// router.use(validateOrigin);


// Rotas protegidas
router.get('/buscar', controller.get);
router.post('/cadastrar', controller.post);
router.put('/editar/:id', controller.put);
router.delete('/excluir/:id', controller.delete);

module.exports = router;