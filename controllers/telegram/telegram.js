const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_API_TOKEN, {
    polling: false
});

const sendMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'A mensagem é obrigatória.' });
    }

    try {
        const result = await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
            parse_mode: 'HTML'
        });
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Erro ao enviar mensagem via Telegram:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.response?.body
        });
    }
};

module.exports = {
    sendMessage,
};