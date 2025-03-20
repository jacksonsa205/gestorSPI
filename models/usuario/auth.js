// models/auth/auth.model.js
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

// Busca um usuário por email
const buscarUsuarioPorEmail = async (email) => {
  const query = 'SELECT * FROM TB_GSPI_Usuarios WHERE EMAIL = ?';
  const [rows] = await pool.execute(query, [email]);
  return rows[0] || null;
};

// Atualiza o token do usuário no banco de dados
const atualizarTokenUsuario = async (userId, token) => {
  const query = 'UPDATE TB_GSPI_Usuarios SET TOKEN = ?, ULTIMO_ACESSO = NOW() WHERE ID = ?';
  await pool.execute(query, [token, userId]);
};

module.exports = {
  buscarUsuarioPorEmail,
  atualizarTokenUsuario,
};