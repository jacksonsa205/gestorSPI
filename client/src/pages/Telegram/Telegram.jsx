import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Layout from "../../components/Layout/Layout";
import useAuthValidation from '../../hooks/useAuthValidation';
import Loading from '../../components/Loading/Loading';
import { useState } from 'react';
import axios from 'axios';
import './Telegram.css';

const Telegram = () => {
  const { loading, user, permissions } = useAuthValidation(8, null, 1);
  const [message, setMessage] = useState('');

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

  if (loading) {
    return <Loading />;
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão...</div>;
  }

  return (
    <Layout
      title="Envio de Mensagens no Telegram"
      content={
        <Container fluid>
          <Row className="justify-content-center mt-4">
            <Col md={6}>
              <Form>
                <Form.Group controlId="formMessage" className="mb-3">
                  <Form.Label>Mensagem</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Digite a mensagem"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" onClick={handleSendMessage}>
                  Enviar Mensagem
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      }
    />
  );
};

export default Telegram;