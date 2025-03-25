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
  groupId = import.meta.env.VITE_WHATSAPP_GROUP_ID,
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

      // 2. Converter para imagem PNG
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

      try {
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
          throw new Error(response.data.error || 'Erro ao enviar mensagem');
        }

        alert('Enviado com sucesso para o WhatsApp!');
      } catch (error) {
        if (error.response?.status === 409) {
          // Se o erro for por arquivo existente, tentamos novamente com nome único
          return handleSend();
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro ao enviar para WhatsApp:', error);
      alert(`Erro ao enviar: ${error.response?.data?.message || error.message}`);
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