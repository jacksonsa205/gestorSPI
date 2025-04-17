const express = require('express');
const router = express.Router();
const controller = require('../../controllers/clima/clima');
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rota para atualizar os dados no banco via botão
router.post('/atualizar-clima', controller.atualizarClima);

// Rota para buscar os dados e exibir no frontend
router.get('/buscar', controller.buscarClima);

module.exports = router;
