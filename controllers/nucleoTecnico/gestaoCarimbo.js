const Model = require('../../models/nucleoTecnico/gestaoCarimbo');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
    const cacheKey = 'carimbos_lista';
  
    try {
      const resultado = await Model.cadastrarCarimbo(req.body);
      
      // Invalida o cache
      await redisClient.del(cacheKey);
  
      // Busca o carimbo recém-criado
      const carimboCriado = await Model.listarCarimbos({ ta: resultado.insertId || req.body.ta });
  
      res.status(201).json(carimboCriado[0]); // Retorna o carimbo completo
    } catch (error) {
      handleDatabaseError(res, error);
    }
};

// Operação de listagem
const get = async (req, res) => {
    try {
      // Busca direto no banco de dados
      const carimbos = await Model.listarCarimbos();
      
      console.log('Dados de carimbos retornados do banco');
      res.json(carimbos);
    } catch (error) {
      handleDatabaseError(res, error);
    }
  };

// Operação de edição
const put = async (req, res) => {
    const cacheKey = 'carimbos_lista';
  
    try {
      const { ta } = req.params; // Extrai o TA da URL
      const dados = req.body; // Extrai os dados do corpo da requisição
  
      const resultado = await Model.editarCarimbo(ta, dados); // Passa ta e dados
  
      // Invalida cache
      await redisClient.del(cacheKey);
  
      res.json({
        affectedRows: resultado.affectedRows,
        message: 'Carimbo atualizado com sucesso!'
      });
    } catch (error) {
      handleDatabaseError(res, error);
    }
};

// Operação de exclusão
const del = async (req, res) => {
  const cacheKey = 'carimbos_lista';

  try {
    const { ta } = req.params;
    await Model.excluirCarimbo(ta);

    // Invalida cache
    await redisClient.del(cacheKey);

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Obter carimbo por TA
const getByTa = async (req, res) => {
    const { ta } = req.params;
    
    try {
      const carimbos = await Model.listarCarimbos({ ta });
      if (carimbos.length === 0) {
        return res.status(404).json({ error: 'Carimbo não encontrado' });
      }
      res.json(carimbos[0]); // Retorna apenas o primeiro item
    } catch (error) {
      handleDatabaseError(res, error);
    }
};

const marcarEscalonamentoWhatsApp = async (req, res) => {
  const { ta } = req.params;
  const cacheKey = 'carimbos_lista';

  try {
    const result = await Model.atualizarEscalonamentoWhatsApp(ta);
    await redisClient.del(cacheKey);

    res.status(200).json({
      success: true,
      message: `TA ${ta} marcado como escalonado via WhatsApp`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Erro ao atualizar escalonamento WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao atualizar escalonamento WhatsApp' });
  }
};

module.exports = {
  post,
  get,
  getByTa,
  put,
  delete: del,
  marcarEscalonamentoWhatsApp
};