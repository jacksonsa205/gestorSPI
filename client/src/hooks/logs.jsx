// src/hooks/logs.js
import axios from 'axios';

const fetchUserData = async (token) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/usuario/sessao`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });

    if (!response.data) {
      throw new Error('Nenhum dado de usuário encontrado');
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }
};

export const registrarLog = async (token, acao, detalhes = null) => {
  try {
    // 1. Obter dados do usuário usando o token
    const userData = await fetchUserData(token);
    
    if (!userData?.ID) {
      throw new Error('ID do usuário não encontrado nos dados retornados');
    }

    // 2. Preparar dados para o log
    const ip = window.location.hostname;
    const logData = {
      usuarioID: userData.RE,
      acao,
      detalhes: detalhes || null,
      ip,
      token: token.slice(-6) + '...' // Armazena apenas parte do token para registro
    };

    // 3. Enviar para o endpoint de logs
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/logs/registrar`, logData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Log registrado com sucesso:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Erro no processo de registro de log:', {
      acao,
      detalhes,
      error: error.response?.data || error.message
    });
    
    throw error;
  }
};