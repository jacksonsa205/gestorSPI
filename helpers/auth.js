// utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '1h', // Token expira em 1 hora
  });
};

// Função para verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Função para comparar senhas
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Função para criptografar senhas
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = {
  generateToken,
  verifyToken,
  comparePassword,
  hashPassword,
};