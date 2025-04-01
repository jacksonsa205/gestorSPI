const Model = require('../../models/logs/logs');

const registrarLogController = async (req, res) => {
    try {
      const { usuarioID, acao, detalhes, ip } = req.body;
      
      if (!usuarioID || !acao) {
        console.log('Dados incompletos recebidos:', req.body); // Adicione log
        return res.status(400).json({ 
          mensagem: 'usuarioID e acao são obrigatórios' 
        });
      }
  
      await Model.registrarLog(usuarioID, acao, detalhes, ip);
      console.log('Log registrado com sucesso:', { usuarioID, acao }); // Adicione log
      
      res.status(201).json({ mensagem: 'Log registrado com sucesso' });
    } catch (error) {
      console.error('Erro detalhado ao registrar log:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({ 
        mensagem: 'Erro ao registrar log',
        detalhes: error.message 
      });
    }
  };

  const buscarTodosLogsController = async (req, res) => {
    try {
      const logs = await Model.buscarTodosLogs();
      
      res.status(200).json({
        sucesso: true,
        dados: logs
      });
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      res.status(500).json({ 
        sucesso: false,
        mensagem: 'Erro ao buscar logs',
        erro: error.message 
      });
    }
  };
  

module.exports = {
  registrarLogController,
  buscarTodosLogsController,
};