// components/WhatsAppSender/WhatsAppSender.jsx
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { toPng } from 'html-to-image';

const WhatsAppSender = ({ 
  elementSelector, 
  fileName, 
  caption,
  groupIds = import.meta.env.VITE_WHATSAPP_GROUP_ID,
  variant = 'link',
  className = '',
  buttonText = '',
  disabled = false
}) => {
  const [sending, setSending] = useState(false);

  const generateUniqueFileName = (baseName) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${baseName.replace('.png', '')}_${timestamp}_${randomString}.png`;
  };

  const handleSend = async () => {
    try {
      setSending(true);
      
      // 1. Capturar o elemento
      const element = document.querySelector(elementSelector);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      // Converter groupIds para array
      const groupsArray = typeof groupIds === 'string' 
        ? groupIds.split(',').map(id => id.trim()).filter(id => id) 
        : Array.isArray(groupIds) 
          ? groupIds 
          : [groupIds];

      if (groupsArray.length === 0) {
        throw new Error('Nenhum grupo especificado para envio');
      }

      console.log('Grupos para enviar:', groupsArray); // Log para debug

      // Enviar para cada grupo
      const results = [];
      for (const groupId of groupsArray) {
        try {
          console.log(`Processando grupo ${groupId}`); // Log para debug
          
          // 2. Converter para imagem PNG (para cada grupo)
          const dataUrl = await toPng(element, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });

          // 3. Converter para blob
          const blob = await fetch(dataUrl).then(res => {
            if (!res.ok) throw new Error('Falha ao criar imagem');
            return res.blob();
          });

          // 4. Gerar nome de arquivo único
          const uniqueFileName = generateUniqueFileName(fileName);

          // 5. Preparar e enviar formData
          const formData = new FormData();
          formData.append('image', blob, uniqueFileName);
          formData.append('groupId', groupId);
          formData.append('caption', caption);

          console.log(`Enviando para grupo ${groupId}`); // Log para debug
          
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/whatsapp/send-file`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              timeout: 30000
            }
          );

          if (!response.data.success) {
            throw new Error(response.data.error || `Erro ao enviar mensagem para o grupo ${groupId}`);
          }

          results.push({ groupId, success: true });
          console.log(`Sucesso no envio para grupo ${groupId}`); // Log para debug
        } catch (error) {
          console.error(`Erro no grupo ${groupId}:`, error); // Log detalhado
          results.push({ 
            groupId, 
            success: false, 
            error: error.response?.data?.message || error.message 
          });
        }
      }

      // Verificar resultados
      const failedGroups = results.filter(r => !r.success);
      if (failedGroups.length === 0) {
        alert('Enviado com sucesso para todos os grupos do WhatsApp!');
      } else if (failedGroups.length < results.length) {
        alert(`Enviado com sucesso para alguns grupos, mas falhou para: ${failedGroups.map(g => g.groupId).join(', ')}`);
      } else {
        throw new Error('Falha ao enviar para todos os grupos: ' + 
          failedGroups.map(g => `${g.groupId}: ${g.error}`).join('; '));
      }
    } catch (error) {
      console.error('Erro geral no envio:', error);
      alert(`Erro ao enviar: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSend}
      className={className}
      disabled={disabled || sending}
      title="Enviar para WhatsApp"
    >
      {sending ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ) : (
        <>
          {buttonText && <span className="me-1">{buttonText}</span>}
          <FontAwesomeIcon icon={faWhatsapp} />
        </>
      )}
    </Button>
  );
};

export default WhatsAppSender;