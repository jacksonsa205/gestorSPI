// config/multer.js
const multer = require('multer');

const storage = multer.memoryStorage(); // Usar memoryStorage em vez de diskStorage

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  }
});

module.exports = upload;