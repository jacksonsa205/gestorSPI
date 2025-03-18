const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');

const authMiddleware = (requiredPermissions = []) => {
  return async (req, res, next) => {
    // Verifica se o token está presente no cabeçalho da requisição
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    try {
      // Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário no Redis ou no banco de dados
      const user = await redisClient.get(`user:${decoded.id}`);

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      const userData = JSON.parse(user);

      // Verifica se o usuário tem as permissões necessárias
      if (requiredPermissions.length > 0) {
        const userPermissions = userData.permissoes || [];
        const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

        if (!hasPermission) {
          return res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
        }
      }

      // Adiciona os dados do usuário à requisição para uso posterior
      req.user = userData;
      next();
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
  };
};

module.exports = authMiddleware;