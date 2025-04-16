const Model = require('../../models/nucleoTecnico/ocorrenciasGV');
const { redisClient } = require('../../config/redis');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de listagem de ocorrências com coordenadas
const get = async (req, res) => {
    const cacheKey = 'ocorrencias_com_coordenadas';
    
    try {
        // Tenta obter do cache primeiro
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            console.log('Dados de ocorrências retornados do cache');
            return res.json(JSON.parse(cachedData));
        }

        // Busca no banco de dados se não tiver em cache
        const ocorrencias = await Model.listarOcorrencias(req.query);
        
        // Armazena no cache por 1 hora (3600 segundos)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(ocorrencias));
        
        console.log('Dados de ocorrências retornados do banco e armazenados em cache');
        res.json(ocorrencias);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

// Operação para obter uma ocorrência específica
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const ocorrencias = await Model.listarOcorrencias({ ocorrencia: id });
        
        if (ocorrencias.length === 0) {
            return res.status(404).json({ error: 'Ocorrência não encontrada' });
        }
        
        res.json(ocorrencias[0]);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

const updateAcao = async (req, res) => {
    try {
        const { ocorrencia } = req.params;
        const { acao } = req.body;

        if (!acao) {
            return res.status(400).json({ error: 'O campo "acao" é obrigatório' });
        }

        // Verifica se a ocorrência existe
        const ocorrencias = await Model.listarOcorrencias({ ocorrencia });
        if (ocorrencias.length === 0) {
            return res.status(404).json({ error: 'Ocorrência não encontrada' });
        }

        // Atualiza a ação
        await Model.atualizarAcao(ocorrencia, acao);

        // Invalida o cache para garantir que os próximos requests tragam dados atualizados
        await redisClient.del('ocorrencias_com_coordenadas');

        res.json({ success: true, message: 'Ação atualizada com sucesso' });
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports = {
    get,
    getById,
    updateAcao
};