const Model = require('../../models/usuario/sessao');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Valida a sessão do usuário
const validarSessao = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extrai o token do header

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    // Busca o usuário pelo token
    const user = await Model.buscarUsuarioSessao(token);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retorna os dados do usuário (sem a senha)
    const { SENHA, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    handleDatabaseError(res, error);
  }
};

module.exports = {
  validarSessao,
};