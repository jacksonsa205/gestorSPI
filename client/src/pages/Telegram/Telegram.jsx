import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap';
import Layout from "../../components/Layout/Layout";
import useAuthValidation from '../../hooks/useAuthValidation';
import Loading from '../../components/Loading/Loading';
import { useState } from 'react';
import axios from 'axios';
import './Telegram.css';

const Telegram = () => {
  const { loading, user, permissions } = useAuthValidation(8, null, 1);
  const [message, setMessage] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [activeTab, setActiveTab] = useState('telegram');

  const handleSendMessage = async () => {
    if (!message) {
      alert('Por favor, preencha a mensagem.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/telegram/enviar-mensagem`, {
        message,
      });
      alert('Mensagem enviada com sucesso!');
      console.log('Resposta da API:', response.data);
    } catch (error) {
      alert('Erro ao enviar mensagem.');
      console.error('Erro:', error.response ? error.response.data : error.message);
    }
  };

  const handleSendWhatsappMessage = async () => {
    if (!whatsappMessage) {
      alert('Por favor, preencha a mensagem para o WhatsApp.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/whatsapp/send-message`, {
        message: whatsappMessage,
        groupId: `${import.meta.env.VITE_WHATSAPP_GROUP_ID}`
      });
      
      if (response.data.success) {
        alert('Mensagem enviada com sucesso para o grupo do WhatsApp!');
        setWhatsappMessage('');
      } else {
        alert(response.data.warning || 'Mensagem enviada, mas houve um aviso.');
      }
      
      console.log('Resposta da API:', response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Erro ao enviar mensagem';
      alert(errorMsg);
      console.error('Erro:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão...</div>;
  }

  return (
    <Layout
      title="Envio de Mensagens"
      content={
        <Container fluid>
          <Row className="justify-content-center mt-4">
            <Col md={8}>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="telegram" title="Telegram">
                  <Form className="mt-3">
                    <Form.Group controlId="formMessage" className="mb-3">
                      <Form.Label>Mensagem para Telegram</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Digite a mensagem para o Telegram"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </Form.Group>

                    <Button variant="primary" onClick={handleSendMessage}>
                      Enviar para Telegram
                    </Button>
                  </Form>
                </Tab>
                
                <Tab eventKey="whatsapp" title="WhatsApp">
                  <Form className="mt-3">
                    <Form.Group controlId="formWhatsappMessage" className="mb-3">
                      <Form.Label>Mensagem para WhatsApp</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Digite a mensagem para o grupo do WhatsApp"
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        Mensagem será enviada para o grupo ID: 120363417407875888
                      </Form.Text>
                    </Form.Group>

                    <Button 
                      variant="success" 
                      onClick={handleSendWhatsappMessage}
                      style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                    >
                      Enviar para WhatsApp
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      }
    />
  );
};

export default Telegram;