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

const getClientIP = async () => {
  try {
    // Tentativa 1: Usar serviço externo para pegar IP
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.warn('Erro ao obter IP público:', error);
    
    // Tentativa 2: Usar WebRTC (pode não funcionar em todos os navegadores)
    try {
      const peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection 
        || window.webkitRTCPeerConnection;
      
      if (peerConnection) {
        const pc = new peerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(pc.setLocalDescription.bind(pc));
        
        return new Promise(resolve => {
          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
            const ipMatch = ipRegex.exec(ice.candidate.candidate);
            if (ipMatch) {
              resolve(ipMatch[1]);
              pc.onicecandidate = () => {};
              pc.close();
            }
          };
        });
      }
    } catch (e) {
      console.warn('Erro ao obter IP via WebRTC:', e);
    }
    
    // Fallback: Usar o IP que chega no backend (se disponível)
    return 'IP-indisponível-no-frontend';
  }
};

export const registrarLog = async (token, acao, detalhes = null) => {
  try {
    // 1. Obter dados do usuário
    const userData = await fetchUserData(token);
    
    if (!userData?.ID) {
      throw new Error('ID do usuário não encontrado');
    }

    // 2. Obter IP do cliente
    const ip = await getClientIP();

    // 3. Preparar dados do log
    const logData = {
      usuarioID: userData.RE,
      acao,
      detalhes: detalhes || null,
      ip: ip || 'IP-desconhecido',
      token: token.slice(-6) + '...'
    };

    // 4. Enviar para o endpoint de logs
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/logs/registrar`, logData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Log registrado com sucesso:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Erro no registro de log:', {
      acao,
      detalhes,
      error: error.response?.data || error.message
    });
    
    // Envia log de erro mesmo sem IP
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logs/erro`, {
        acao: 'ERRO_REGISTRO_LOG',
        detalhes: error.message,
        usuarioID: 'SISTEMA'
      });
    } catch (e) {
      console.error('Falha ao registrar log de erro:', e);
    }
    
    throw error;
  }
};