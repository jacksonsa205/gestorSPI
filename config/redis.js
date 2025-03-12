const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: false, 
      rejectUnauthorized: false,
      connectTimeout: 10000,
    }
  });
  
  redisClient.connect()
    .then(() => console.log('Conectado ao Redis!'))
    .catch((err) => console.error('Erro no Redis:', err));
  
  // Exporte o redisClient
  module.exports = { redisClient };