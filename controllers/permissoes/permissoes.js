const Model = require('../../models/permissoes/permissoes');
const { redisClient } = require('../../config/redis');

const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

const get = async (req, res) => {
  const cacheKey = 'permissoes_data'; // Chave única para o cache

  try {
    // 1. Verifica se o cache existe no Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Dados retornados do cache');
      return res.json(JSON.parse(cachedData)); // Retorna os dados do cache
    }

    // 2. Se não houver cache, consulta o banco de dados
    const [permissoes, modulos, subModulos] = await Promise.all([
      Model.permissoes(),
      Model.modulo(),
      Model.subModulo()
    ]);

    const data = { permissoes, modulos, subModulos };

    // 3. Armazena os dados no Redis com tempo de expiração (ex: 1 hora)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    console.log('Dados retornados do banco de dados e armazenados no cache');
    res.json(data);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

module.exports = {
  get,
};