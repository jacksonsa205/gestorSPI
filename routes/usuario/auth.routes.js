// routes/auth/auth.routes.js
const express = require('express');
const controller = require('../../controllers/usuario/auth');
const router = express.Router();
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

router.use(blockBrowserAccess);

// Rota de login
router.post('/login', controller.login);

// Rota de logout (opcional)
router.post('/logout', controller.logout);

module.exports = router;