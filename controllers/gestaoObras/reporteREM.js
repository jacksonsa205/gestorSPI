const Model = require('../../models/gestaoObras/reporteREM');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
    console.error('Erro no banco de dados:', error);
    return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
    const cacheKey = 'reportes_rem_lista';

    try {
        const resultado = await Model.cadastrarReporteREM(req.body);

        // Invalida o cache
        await redisClient.del(cacheKey);

        // Busca o registro recém-criado
        const reporteCriado = await Model.listarReportesREM({ rem: resultado.insertId || req.body.rem });

        res.status(201).json(reporteCriado[0]); // Retorna o registro completo
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

// Operação de listagem
const get = async (req, res) => {
    const cacheKey = 'reportes_rem_lista';

    try {
        // Verifica cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Dados de reportes REM retornados do cache');
            return res.json(JSON.parse(cachedData));
        }

        // Busca no banco
        const reportes = await Model.listarReportesREM();

        // Armazena no cache (1 hora)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(reportes));

        console.log('Dados de reportes REM retornados do banco');
        res.json(reportes);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

// Operação de edição
const put = async (req, res) => {
  const cacheKey = 'reportes_rem_lista';

  try {
      const { rem } = req.params; // Extrai o REM da URL
      const dados = req.body; // Extrai os dados do corpo da requisição

      // Verifica se o REM e os dados foram recebidos corretamente
      if (!rem || !dados) {
          return res.status(400).json({ error: 'REM ou dados não fornecidos' });
      }

      const resultado = await Model.editarReporteREM(rem, dados);

      // Invalida cache
      await redisClient.del(cacheKey);

      res.json({
          affectedRows: resultado.affectedRows,
          message: 'Reporte REM atualizado com sucesso!'
      });
  } catch (error) {
      handleDatabaseError(res, error);
  }
};

// Operação de exclusão
const del = async (req, res) => {
    const cacheKey = 'reportes_rem_lista';

    try {
        const { rem } = req.params;
        await Model.excluirReporteREM(rem);

        // Invalida cache
        await redisClient.del(cacheKey);

        res.status(204).send();
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

// Buscar um registro por ID OBRA
const getByIdObra = async (req, res) => {
    const { rem } = req.params;

    try {
        const reportes = await Model.listarReportesREM({ rem });
        if (reportes.length === 0) {
            return res.status(404).json({ error: 'Reporte não encontrado' });
        }
        res.json(reportes[0]); // Retorna apenas o primeiro item
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports = {
    post,
    get,
    getByIdObra,
    put,
    delete: del
};