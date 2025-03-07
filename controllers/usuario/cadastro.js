const Model = require('../../models/usuario/cadastro');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
  try {
    // Adicione este log para debug
    
    const resultado = await Model.cadastrarUsuario(req.body);
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
  try {
    const transacoes = await Model.listarUsuarios();
    res.json(transacoes);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

const put = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await Model.editarUsuario(id, req.body);
    res.json(resultado);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

const del = async (req, res) => {
  try {
    const { id } = req.params;
    await Model.excluirUsuario(id);
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