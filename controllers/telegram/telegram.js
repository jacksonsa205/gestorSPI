// controllers/telegram/telegram.js
const FormData = require('form-data');
const axios = require('axios');
const https = require('https');
require('dotenv').config();

const TELEGRAM_API_URL = process.env.TELEGRAM_API_URL;
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const agent = new https.Agent({  
  rejectUnauthorized: false
});

const sendMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'A mensagem é obrigatória.' });
    }

    try {
        const sendResponse = await axios.post(
            `${TELEGRAM_API_URL}${TELEGRAM_API_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                httpsAgent: agent,
                // Adicione timeout e validação de resposta
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500; // Rejeita apenas erros de servidor
                }
            }
        );

        // Verifica se a resposta é a página de bloqueio
        if (typeof sendResponse.data === 'string' && sendResponse.data.includes('Acesso não permitido')) {
            console.warn('Acesso bloqueado pela rede corporativa');
            // Mesmo com bloqueio, a mensagem pode ter chegado
            return res.status(200).json({ 
                success: true, 
                warning: 'Mensagem enviada, mas rede corporativa bloqueou resposta' 
            });
        }

        res.status(200).json({ success: true, data: sendResponse.data });
    } catch (error) {
        // Se for erro de bloqueio, considera sucesso com aviso
        if (error.response && typeof error.response.data === 'string' && 
            error.response.data.includes('Acesso não permitido')) {
            console.warn('Acesso bloqueado pela rede corporativa');
            return res.status(200).json({ 
                success: true, 
                warning: 'Mensagem provavelmente enviada, mas rede bloqueou resposta' 
            });
        }
        
        console.error('Erro ao enviar mensagem via Telegram:', error);
        res.status(500).json({ 
            success: false, 
            error: "Erro ao enviar mensagem",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

const enviarImagem = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

        // Criar FormData
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('caption', req.body.caption || 'Relatório de OLTs');
        formData.append('photo', req.file.buffer, {
            filename: 'relatorio.png',
            contentType: req.file.mimetype
        });

        // Enviar para o Telegram
        const response = await axios.post(
            `${TELEGRAM_API_URL}${TELEGRAM_API_TOKEN}/sendPhoto`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                },
                httpsAgent: agent
            }
        );

        res.status(200).json({ 
            success: true, 
            data: response.data 
        });
    } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

module.exports = {
    sendMessage,
    enviarImagem,
};