const Model = require('../../models/usuario/cadastro');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
  const cacheKey = 'usuarios_lista'; // Chave única para o cache

  try {
    const resultado = await Model.cadastrarUsuario(req.body);
    
    // Invalida o cache após a inserção
    await redisClient.del(cacheKey);

    res.status(201).json({
      id: resultado.insertId,
      message: 'Usuário cadastrado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: error.message });
  }
};
// Operação de listagem
const get = async (req, res) => {
  const cacheKey = 'usuarios_lista'; // Chave única para o cache

  try {
    // 1. Verifica se o cache existe no Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Dados retornados do cache');
      return res.json(JSON.parse(cachedData));
    }

    // 2. Se não houver cache, consulta o banco de dados
    const usuarios = await Model.listarUsuarios();

    // 3. Armazena os dados no Redis com tempo de expiração (ex: 1 hora)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(usuarios));

    console.log('Dados retornados do banco de dados e armazenados no cache');
    res.json(usuarios);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de edição
const put = async (req, res) => {
  const cacheKey = 'usuarios_lista'; // Chave única para o cache

  try {
    const { id } = req.params;
    const resultado = await Model.editarUsuario(id, req.body);

    // Invalida o cache após a edição
    await redisClient.del(cacheKey);

    res.json(resultado);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de exclusão
const del = async (req, res) => {
  const cacheKey = 'usuarios_lista'; // Chave única para o cache

  try {
    const { id } = req.params;
    await Model.excluirUsuario(id);

    // Invalida o cache após a exclusão
    await redisClient.del(cacheKey);

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

module.exports = {
  post,
  get,
  put,
  delete: del
};