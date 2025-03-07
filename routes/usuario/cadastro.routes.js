const express = require('express');
const controller = require('../../controllers/usuario/cadastro');
const router = express.Router();

// Rotas CRUD completas
router.post('/cadastrar', controller.post);
router.get('/buscar', controller.get);
router.put('/editar/:id', controller.put);
router.delete('/excluir/:id', controller.delete);

module.exports = router;