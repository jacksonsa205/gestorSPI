const Model = require('../../models/municipios/municipios');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de listagem
const get = async (req, res) => {
  const cacheKey = 'consultas_municipios';

  try {
    // Verifica cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Dados de consultas municipios retornados do cache');
      return res.json(JSON.parse(cachedData));
    }

    // Busca no banco
    const consultas = await Model.listarMunicipios();

    // Armazena no cache (1 hora)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(consultas));

    console.log('Dados de consultas municipios retornados do banco');
    res.json(consultas);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};


module.exports = {
  get,
};