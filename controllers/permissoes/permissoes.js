const Model = require('../../models/permissoes/permissoes');

const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

const get = async (req, res) => {
  try {
    // Executa todas as consultas em paralelo
    const [permissoes, modulos, subModulos] = await Promise.all([
      Model.permissoes(),
      Model.modulo(),
      Model.subModulo()
    ]);

    res.json({
      permissoes: permissoes,
      modulos: modulos,
      subModulos: subModulos
    });
    
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

module.exports = {
  get,
};