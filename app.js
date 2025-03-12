require("dotenv").config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { redisClient } = require('./config/redis');
const RedisStore = require('connect-redis').default;
const { auth,permissoes, sessao,cadastro,consultaOLT,olt } = require('./routes/index.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da sessão
app.use(session({
  store: new RedisStore({ client: redisClient }),
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 1800000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Resto do seu código (CORS, rotas, etc.)
const corsOption = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));
app.use(bodyParser.json());

// Configuração do ambiente (produção/desenvolvimento)
if (process.env.NODE_ENV === 'production') {
  app.use('/usuario', auth, permissoes, sessao,cadastro);
  app.use('/nucleo-tecnico', consultaOLT);
  app.use('/olt', olt);
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  app.use('/usuario', cadastro);
  app.use('/nucleo-tecnico', consultaOLT);
  app.use('/olt', olt);
}

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}/`);
});