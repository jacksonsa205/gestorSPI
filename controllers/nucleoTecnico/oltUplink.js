const Model = require('../../models/nucleoTecnico/oltUplink');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
    const cacheKey = 'olts_uplinks_lista';
  
    try {
      const resultado = await Model.cadastrarOLTIsolada(req.body);
      
      // Invalida o cache
      await redisClient.del(cacheKey);
  
      // Busca a OLT Isolada recém-criada
      const oltCriada = await Model.listarOLTsIsoladas({ TA: resultado.insertId || req.body.TA });
  
      res.status(201).json(oltCriada[0]); // Retorna a OLT completa
    } catch (error) {
      handleDatabaseError(res, error);
    }
};

// Operação de listagem
const get = async (req, res) => {
  const cacheKey = 'olts_uplinks_lista';

  try {
    // Verifica cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Dados de OLTs Isoladas retornados do cache');
      return res.json(JSON.parse(cachedData));
    }

    // Busca no banco
    const oltsIsoladas = await Model.listarOLTsIsoladas();

    // Armazena no cache (1 hora)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(oltsIsoladas));

    console.log('Dados de OLTs Isoladas retornados do banco');
    res.json(oltsIsoladas);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de edição
const put = async (req, res) => {
    const cacheKey = 'olts_uplinks_lista';
  
    try {
      const { TA } = req.params; // Extrai o TA da URL
      const dados = req.body; // Extrai os dados do corpo da requisição
  
      const resultado = await Model.editarOLTIsolada(TA, dados); // Passa TA e dados
  
      // Invalida cache
      await redisClient.del(cacheKey);
  
      res.json({
        affectedRows: resultado.affectedRows,
        message: 'OLT Isolada atualizada com sucesso!'
      });
    } catch (error) {
      handleDatabaseError(res, error);
    }
};

// Operação de exclusão
const del = async (req, res) => {
  const cacheKey = 'olts_uplinks_lista';

  try {
    const { TA } = req.params;
    await Model.excluirOLTIsolada(TA);

    // Invalida cache
    await redisClient.del(cacheKey);

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de busca por TA
const getByTA = async (req, res) => {
    const { TA } = req.params;
    
    try {
      const oltsIsoladas = await Model.listarOLTsIsoladas({ TA });
      if (oltsIsoladas.length === 0) {
        return res.status(404).json({ error: 'OLT Isolada não encontrada' });
      }
      res.json(oltsIsoladas[0]); // Retorna apenas o primeiro item
    } catch (error) {
      handleDatabaseError(res, error);
    }
};

module.exports = {
  post,
  get,
  getByTA,
  put,
  delete: del
};