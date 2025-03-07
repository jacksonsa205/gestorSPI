const express = require('express');
const controller = require('../../controllers/permissoes/permissoes');
const router = express.Router();

router.get('/permissoes', controller.get);

module.exports = router;