// middlewares/authMiddleware.js
const { verifyToken } = require('../helpers/auth');
const { redisClient } = require('../config/redis');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    // Verifica se o token está na lista negra (logout)
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token inválido (logout)' });
    }

    // Valida o token JWT
    const decoded = verifyToken(token);

    // Adiciona o usuário decodificado ao objeto `req`
    req.user = decoded;

    // Passa para o próximo middleware ou rota
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

module.exports = authMiddleware;