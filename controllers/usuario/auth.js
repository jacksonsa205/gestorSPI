// controllers/auth/auth.controller.js
const jwt = require('jsonwebtoken');
const Model = require('../../models/usuario/auth');
const { generateToken, comparePassword, hashPassword } = require('../../helpers/auth');
const { redisClient } = require('../../config/redis');
const logMiddleware = require('../../middleware/logMiddleware');
const { getClientIP } = require('../../helpers/ipUtils'); 

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de login
const login = async (req, res) => {
  const { email, senha } = req.body;
  const ip = getClientIP(req);

  try {
    // Verifica se o usuário existe
    const user = await Model.buscarUsuarioPorEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Compara a senha
    const isPasswordValid = await comparePassword(senha, user.SENHA);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    // Gera o token JWT
    const token = generateToken(user.ID);

    // Salva o token no banco de dados
    await Model.atualizarTokenUsuario(user.ID, token);

    // Registra o log de login
    await logMiddleware(user.RE, 'Login', `Usuário fez login`, ip)(req, res, () => {});

    // Retorna o token e os dados do usuário (sem a senha)
    const { SENHA, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });

  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de logout (opcional)
const logout = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrai o token do header
  
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
  
    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Adiciona o token à lista negra no Redis
      await redisClient.set(`blacklist:${token}`, 'true', 'EX', 3600);
  
      // Remove o token do banco de dados
      await Model.atualizarTokenUsuario(decoded.id, null);
  
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({ error: 'Erro durante o logout' });
    }
  };

module.exports = {
  login,
  logout,
};