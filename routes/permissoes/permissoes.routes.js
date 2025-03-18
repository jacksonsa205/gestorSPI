const express = require('express');
const controller = require('../../controllers/permissoes/permissoes');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

router.get('/permissoes', controller.get);

module.exports = router;