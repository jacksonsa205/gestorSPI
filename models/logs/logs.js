// models/logModel.js
const pool = require('../../config/db');

const registrarLog = async (usuarioID, acao, detalhes = null, ip = null) => {
  const query = `
    INSERT INTO TB_GSPI_Logs (UsuarioID, Acao, Detalhes, IP)
    VALUES (?, ?, ?, ?)
  `;
  const params = [usuarioID, acao, detalhes, ip];

  try {
    const [result] = await pool.execute(query, params);
    console.log('Log Registrado com Sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao registrar log:', error);
    throw error;
  }
};

module.exports = {
  registrarLog,
};