import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { registrarLog } from '../../hooks/logs';

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
  const token = localStorage.getItem('token');

  const generateUniqueFileName = (baseName) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${baseName.replace('.png', '')}_${timestamp}_${randomString}.png`;
  };

  const handleSend = async () => {
    if (sending) return;
    setSending(true);

    try {
      const element = document.querySelector(elementSelector);
      if (!element) {
        await registrarLog(token, 'Envio', 'WhatsApp - Elemento não encontrado para captura');
        throw new Error('Elemento não encontrado');
      }

      const groupsArray = typeof groupIds === 'string' 
        ? groupIds.split(',').map(id => id.trim()).filter(id => id) 
        : Array.isArray(groupIds) 
          ? groupIds 
          : [groupIds];

      if (groupsArray.length === 0) {
        await registrarLog(token, 'Envio', 'WhatsApp - Nenhum grupo especificado para envio');
        throw new Error('Nenhum grupo especificado para envio');
      }

      // Registrar início do processo
      await registrarLog(
        token,
        'Envio',
        `WhatsApp - Iniciando envio para ${groupsArray.length} grupo(s)`
      );

      const results = [];
      for (const [index, groupId] of groupsArray.entries()) {
        try {
          const dataUrl = await toPng(element, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });

          const blob = await fetch(dataUrl).then(res => res.blob());
          const uniqueFileName = generateUniqueFileName(fileName);

          const formData = new FormData();
          formData.append('image', blob, uniqueFileName);
          formData.append('groupId', groupId);
          formData.append('caption', caption);

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/whatsapp/send-file`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              },
              timeout: 30000
            }
          );

          // Registrar sucesso por grupo
          await registrarLog(
            token,
            'Envio',
            `WhatsApp - Sucesso no envio para grupo ${groupId}`,
            {
              fileName: uniqueFileName,
              groupId,
              position: index + 1,
              total: groupsArray.length
            }
          );

          results.push({ groupId, success: true });
        } catch (error) {
          // Registrar erro específico por grupo
          await registrarLog(
            token,
            'Envio',
            `WhatsApp - Falha no envio para grupo ${groupId}`,
            {
              error: error.message,
              groupId,
              position: index + 1
            }
          );
          
          results.push({ 
            groupId, 
            success: false, 
            error: error.response?.data?.message || error.message 
          });
        }
      }

      // Registrar resumo final
      const successfulSends = results.filter(r => r.success).length;
      await registrarLog(
        token,
        'Envio',
        `Processo concluído - ${successfulSends}/${groupsArray.length} enviados com sucesso`,
        {
          totalGroups: groupsArray.length,
          successfulSends,
          failedSends: groupsArray.length - successfulSends
        }
      );

      if (successfulSends === 0) {
        throw new Error('Falha ao enviar para todos os grupos');
      }

      alert(successfulSends === groupsArray.length
        ? 'Enviado com sucesso para todos os grupos!'
        : `Enviado com sucesso para ${successfulSends} de ${groupsArray.length} grupos`);

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