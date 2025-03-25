const axios = require('axios');
const https = require('https');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const WZAP_API_URL = process.env.WZAP_API_URL || 'https://api.wzap.chat/v1';
const WZAP_API_TOKEN = process.env.WZAP_API_TOKEN;

// Configuração do agente HTTPS para evitar problemas com certificados
const agent = new https.Agent({  
  rejectUnauthorized: false
});

/**
 * Envia mensagem com mídia para WhatsApp
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @body {string} phone - Número de telefone com código do país
 * @body {string} message - Mensagem/caption
 * @body {Object} media - Objeto com dados da mídia
 * @body {string} media.url - URL da mídia
 * @body {string} [media.expiration] - Expiração da mídia (opcional)
 * @body {boolean} [media.viewOnce] - Se é view once (opcional)
 */
const sendGroupMessage = async (req, res) => {
    const { groupId, message } = req.body;

    if (!groupId || !message) {
        return res.status(400).json({ 
            success: false,
            error: 'groupId e message são obrigatórios.' 
        });
    }

    try {
        const response = await axios.post(
            `${WZAP_API_URL}/messages`,
            {
                group: `${groupId}@g.us`,
                message: message
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Token': WZAP_API_TOKEN
                },
                httpsAgent: agent,
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500; // Rejeita apenas erros de servidor
                }
            }
        );

        // Verifica se a resposta contém algum bloqueio ou erro específico
        if (typeof response.data === 'string' && response.data.includes('blocked')) {
            console.warn('Possível bloqueio na rede');
            return res.status(200).json({ 
                success: true, 
                warning: 'Mensagem enviada, mas pode ter sido bloqueada' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: response.data 
        });
    } catch (error) {
        // Tratamento específico para erros de bloqueio
        if (error.response && typeof error.response.data === 'string' && 
            error.response.data.includes('blocked')) {
            console.warn('Acesso bloqueado pela rede');
            return res.status(200).json({ 
                success: true, 
                warning: 'Mensagem provavelmente enviada, mas rede bloqueou resposta' 
            });
        }
        
        console.error('Erro ao enviar mensagem via Wzap:', error);
        res.status(500).json({ 
            success: false, 
            error: "Erro ao enviar mensagem",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Envia arquivo/documento para um grupo do WhatsApp
 */
const sendFileToGroup = async (req, res) => {
    try {
      const { groupId, caption } = req.body;
      
      if (!groupId) {
        return res.status(400).json({ 
          success: false,
          error: 'groupId é obrigatório.' 
        });
      }
  
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'Arquivo é obrigatório.' 
        });
      }

      console.log('Preparando upload do arquivo:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // 1. Upload do arquivo
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname || 'relatorio.png',
        contentType: req.file.mimetype || 'image/png',
        knownLength: req.file.size
      });

      const uploadResponse = await axios.post(
        `${WZAP_API_URL}/files`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Token': WZAP_API_TOKEN,
            'Content-Length': formData.getLengthSync()
          },
          httpsAgent: agent,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      // Obter o ID do arquivo (considerando resposta como array)
      const fileId = uploadResponse.data[0]?.id;
      if (!fileId) {
        throw new Error('ID do arquivo não encontrado na resposta');
      }

      console.log('ID do arquivo obtido:', fileId);
  
      // 2. Enviar mensagem com a mídia - FORMATO CORRETO SEGUNDO A DOCUMENTAÇÃO
      const messagePayload = {
        group: `${groupId}@g.us`,
        message: caption || 'Relatório OLT Uplink',
        media: {
          file: fileId  // Campo correto é 'file' conforme documentação
          // Removido o 'type' pois não é necessário segundo o exemplo
        }
      };

      console.log('Enviando mensagem com mídia:', messagePayload);
      const messageResponse = await axios.post(
        `${WZAP_API_URL}/messages`,
        messagePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': WZAP_API_TOKEN
          },
          httpsAgent: agent,
          timeout: 10000
        }
      );
  
      res.status(200).json({ 
        success: true, 
        data: messageResponse.data 
      });
    } catch (error) {
      console.error('Erro detalhado:', {
        message: error.message,
        responseData: error.response?.data,
        requestPayload: error.config?.data
      });
      
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data?.errors || undefined
      });
    }
};

module.exports = {
    sendGroupMessage,
    sendFileToGroup
    
};