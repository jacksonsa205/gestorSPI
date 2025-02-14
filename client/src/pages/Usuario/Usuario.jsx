import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faEnvelope,
  faPhone,
  faIdCard,
  faLock,
  faShieldHalved,
  faClockRotateLeft,
  faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import Layout from "../../components/Layout/Layout";
import './Usuario.css';

const Usuario = () => {
  const userData = {
    name: "João da Silva",
    role: "Administrador",
    email: "joao.silva@empresa.com",
    phone: "(11) 99999-9999",
    Cargo: "Deselvolvedor FullStack",
    lastLogin: "2024-03-15 14:30:00"
  };

  const activities = [
    { id: 1, title: "Senha alterada", date: "2024-03-10 09:15", description: "Alteração de senha de acesso" },
    { id: 2, title: "Login realizado", date: "2024-03-09 08:45", description: "Acesso pelo navegador Chrome" },
    { id: 3, title: "Perfil atualizado", date: "2024-03-08 16:20", description: "Atualização dos dados cadastrais" },
  ];

  return (
    <Layout
      title="Perfil"
      content={
        <Container fluid className="usuario-container">
          {/* Cabeçalho */}
          <Card className="profile-header mb-4">
            <Card.Body className="text-center">
              <div className="avatar-container mb-3">
                <div className="avatar-placeholder">
                  {userData.name[0]}
                </div>
              </div>
              <h2 className="user-name">{userData.name}</h2>
              <p className="user-role text-muted">{userData.role}</p>
              <Button variant="outline-primary" size="sm">
                Editar Perfil
              </Button>
            </Card.Body>
          </Card>

          <Row>
            {/* Coluna Esquerda - Informações Principais */}
            <Col lg={8} className="mb-4">
              <Card className="mb-4">
                <Card.Header className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faIdCard} className="me-2" />
                  Informações Pessoais
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label><FontAwesomeIcon icon={faUser} className="me-2" />Nome Completo</Form.Label>
                      <Form.Control type="text" value={userData.name} readOnly />
                    </Form.Group>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label><FontAwesomeIcon icon={faEnvelope} className="me-2" />E-mail</Form.Label>
                          <Form.Control type="email" value={userData.email} readOnly />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label><FontAwesomeIcon icon={faPhone} className="me-2" />Telefone</Form.Label>
                          <Form.Control type="tel" value={userData.phone} readOnly />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group>
                      <Form.Label><FontAwesomeIcon icon={faBriefcase} className="me-2" />Cargo</Form.Label>
                      <Form.Control type="text" value={userData.Cargo} readOnly />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  Segurança
                </Card.Header>
                <Card.Body>
                  <div className="security-item mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6>Alterar Senha</h6>
                        <p className="text-muted mb-0">Última alteração: 10/03/2024</p>
                      </div>
                      <Button variant="outline-secondary" size="sm">
                        Alterar
                      </Button>
                    </div>
                  </div>

                  <div className="security-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6>Autenticação de Dois Fatores</h6>
                        <p className="text-muted mb-0">Proteção adicional da conta</p>
                      </div>
                      <Button variant="outline-success" size="sm">
                        Ativar
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Coluna Direita - Atividades Recentes */}
            <Col lg={4}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="me-2" />
                  Atividades Recentes
                </Card.Header>
                <Card.Body>
                  {activities.map(activity => (
                    <div key={activity.id} className="activity-item mb-3">
                      <div className="d-flex">
                        <div className="activity-icon me-3">
                          <FontAwesomeIcon icon={faShieldHalved} />
                        </div>
                        <div>
                          <h6 className="mb-1">{activity.title}</h6>
                          <p className="text-muted mb-0 small">{activity.description}</p>
                          <small className="text-muted">{activity.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      }
    />
  );
};

export default Usuario;