// routes/whatsapp/whatsapp.routes.js
const express = require('express');
const controller = require('../../controllers/telegram/telegram');
const router = express.Router();
const upload = require('../../config/multer');
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

// Middleware para bloquear acesso via navegador
router.use(blockBrowserAccess);

// Rota para enviar mensagem via WhatsApp
router.post('/enviar-mensagem', controller.sendMessage);
router.post('/enviar-imagem', upload.single('image'), controller.enviarImagem);

module.exports = router;