// middlewares/logMiddleware.js
const { registrarLog } = require('../models/logs/logs');

const logMiddleware = (usuarioID, acao, detalhes, ip) => {
  return async (req, res, next) => {
    try {
      await registrarLog(usuarioID, acao, detalhes, ip);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }

    next(); 
  };
};

module.exports = logMiddleware;