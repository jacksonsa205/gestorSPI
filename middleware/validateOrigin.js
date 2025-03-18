const validateOrigin = (req, res, next) => {
    const allowedOrigins = [
      'http://localhost:5173', // URL do seu frontend em desenvolvimento
      'https://gesterspi-production-d6c9.up.railway.app' // URL do seu frontend em produção
    ];
  
    const origin = req.headers.origin || req.headers.referer;
  
    if (allowedOrigins.includes(origin)) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado. Origem não permitida.' });
    }
  };
  
  module.exports = validateOrigin;