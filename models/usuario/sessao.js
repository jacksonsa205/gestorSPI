const pool = require('../../config/db');

// Busca um usuário por token
const buscarUsuarioSessao = async (token) => {
  const query = 'SELECT * FROM TB_GSPI_Usuarios WHERE TOKEN = ?';
  const [rows] = await pool.execute(query, [token]);
  return rows[0] || null;
};

module.exports = {
  buscarUsuarioSessao,
};