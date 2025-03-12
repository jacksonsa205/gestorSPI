const Model = require('../../models/nucleoTecnico/consultaOLT');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
    const cacheKey = 'consultas_olt_lista';
  
    try {
      const resultado = await Model.cadastrarConsultaOLT(req.body);
      
      // Invalida o cache
      await redisClient.del(cacheKey);
  
      // Busca a consulta recém-criada
      const consultaCriada = await Model.listarConsultasOLT({ codigo: resultado.insertId || req.body.codigo });
  
      res.status(201).json(consultaCriada[0]); // Retorna a consulta completa
    } catch (error) {
      handleDatabaseError(res, error);
    }
  };

// Operação de listagem
const get = async (req, res) => {
  const cacheKey = 'consultas_olt_lista';

  try {
    // Verifica cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Dados de consultas OLT retornados do cache');
      return res.json(JSON.parse(cachedData));
    }

    // Busca no banco
    const consultas = await Model.listarConsultasOLT();

    // Armazena no cache (1 hora)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(consultas));

    console.log('Dados de consultas OLT retornados do banco');
    res.json(consultas);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de edição
const put = async (req, res) => {
    const cacheKey = 'consultas_olt_lista';
  
    try {
      const { codigo } = req.params; // Extrai o código da URL
      const dados = req.body; // Extrai os dados do corpo da requisição
  
      console.log('Código recebido no controller:', codigo); // Verifique o código
      console.log('Dados recebidos no controller:', dados);  // Verifique os dados
  
      const resultado = await Model.editarConsultaOLT(codigo, dados); // Passa codigo e dados
  
      // Invalida cache
      await redisClient.del(cacheKey);
  
      res.json({
        affectedRows: resultado.affectedRows,
        message: 'Consulta OLT atualizada com sucesso!'
      });
    } catch (error) {
      handleDatabaseError(res, error);
    }
  };

// Operação de exclusão
const del = async (req, res) => {
  const cacheKey = 'consultas_olt_lista';

  try {
    const { codigo } = req.params;
    await Model.excluirConsultaOLT(codigo);

    // Invalida cache
    await redisClient.del(cacheKey);

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

const getByCodigo = async (req, res) => {
    const { codigo } = req.params;
    
    try {
      const consultas = await Model.listarConsultasOLT({ codigo });
      if (consultas.length === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }
      res.json(consultas[0]); // Retorna apenas o primeiro item
    } catch (error) {
      handleDatabaseError(res, error);
    }
  };

module.exports = {
  post,
  get,
  getByCodigo,
  put,
  delete: del
};