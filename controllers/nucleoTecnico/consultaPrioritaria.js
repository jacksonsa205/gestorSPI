const Model = require('../../models/nucleoTecnico/consultaPrioritaria');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
  const cacheKey = 'consultas_prioritarias_lista';

  try {
    const resultado = await Model.cadastrarConsultaPrioritaria(req.body);
    
    // Invalida o cache
    await redisClient.del(cacheKey);

    // Busca a consulta recém-criada
    const consultaCriada = await Model.listarConsultasPrioritarias({ id: resultado.insertId });

    res.status(201).json(consultaCriada[0]); // Retorna a consulta completa
  } catch (error) {
    handleDatabaseError(res, error);
  }
};


// Operação de listagem
// No método get do controller, já estamos recebendo os parâmetros corretamente
const get = async (req, res) => {
  const { pesquisa, gbe, swo, fibra, cabo, isSearch } = req.query;
  const cacheKey = `consultas_${JSON.stringify(req.query)}`;

  try {
    const consultas = await Model.listarConsultasPrioritarias({ 
      pesquisa, 
      gbe, 
      swo, 
      fibra, 
      cabo,
      limite: isSearch ? null : 40000
    });

    res.json(consultas);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de edição
const put = async (req, res) => {
  const cacheKey = 'consultas_prioritarias_lista';

  try {
    const { id } = req.params; // Extrai o ID da URL
    const dados = req.body; // Extrai os dados do corpo da requisição

    console.log(`Editando consulta com ID: ${id}`); // Log do ID
    console.log('Dados recebidos para edição:', dados); // Log dos dados

    const resultado = await Model.editarConsultaPrioritaria(id, dados);

    // Invalida cache
    await redisClient.del(cacheKey);

    res.json({
      affectedRows: resultado.affectedRows,
      message: 'Consulta prioritária atualizada com sucesso!'
    });
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de exclusão
const del = async (req, res) => {
  const cacheKey = 'consultas_prioritarias_lista';

  try {
    const { id } = req.params; // Extrai o ID da URL

    console.log(`Excluindo consulta com ID: ${id}`); // Log do ID

    await Model.excluirConsultaPrioritaria(id);

    // Invalida cache
    await redisClient.del(cacheKey);

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Buscar por ID
const getById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = 'consultas_prioritarias_lista';

  try {
    console.log(`Buscando consulta com ID: ${id}`); // Log do ID

    const consultas = await Model.listarConsultasPrioritarias({ id });

    // Invalida cache
    await redisClient.del(cacheKey);

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
  getById, // Atualizado para buscar por ID
  put,
  delete: del
};