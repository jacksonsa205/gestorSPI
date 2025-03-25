const express = require('express');
const controller = require('../../controllers/whatsapp/whatsapp');
const router = express.Router();
const upload = require('../../config/multer');
const blockBrowserAccess = require('../../middleware/blockBrowserAccess');

// Middleware para bloquear acesso via navegador (se necessário)
router.use(blockBrowserAccess);

/**
 * @route POST /whatsapp/send-message
 * @description Envia mensagem para grupo do WhatsApp
 * @body {string} groupId - ID do grupo (sem @g.us)
 * @body {string} message - Mensagem a ser enviada
 * @returns {object} Resultado da operação
 */
router.post('/send-message', controller.sendGroupMessage);

/**
 * @route POST /whatsapp/send-file
 * @description Envia arquivo para grupo do WhatsApp
 * @body {string} groupId - ID do grupo (sem @g.us)
 * @body {string} caption - Legenda do arquivo (opcional)
 * @file {file} file - Arquivo a ser enviado
 * @returns {object} Resultado da operação
 */
router.post('/send-file', upload.single('image'), controller.sendFileToGroup);


module.exports = router;