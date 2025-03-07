require("dotenv").config();

const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const {permissoes, cadastro } = require('./routes/index.routes');
const app = express();
const PORT = process.env.PORT || 3000;


// No seu app.js, substitua o TIME_SESSION por:
const TIME_SESSION = process.env.SESSION_MAX_AGE || 1800000;

// E na configuração do CORS:
const corsOption = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));

const IN_PROD = process.env.NODE_ENV === 'production';

// session config
app.use(session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  resave: false, // Alterado para false
  saveUninitialized: false, // Alterado para false
  rolling: true,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 1800000, // Convert para número
    sameSite: true,
    secure: process.env.NODE_ENV === 'production' // Secure apenas em produção
  }
}));

app.use(bodyParser.json());

// Serve static files from the "public" directory
if (process.env.NODE_ENV === 'production') {
  // Primeiro: Configurações de API
  app.use('/usuario', permissoes);
  app.use('/usuario', cadastro);
  
  // Depois: Arquivos estáticos e rota catch-all
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  // Configuração para desenvolvimento
  app.use('/usuario', cadastro);
}

// Use the router for handling routes


app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}/`);
});