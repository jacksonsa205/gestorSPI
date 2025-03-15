import { useState } from 'react';
import { Container, Row, Col, Button, ListGroup, Form, Badge } from 'react-bootstrap';
import { 
  faUser, 
  faShieldHalved,
  faBell,
  faKey,
  faEnvelope,
  faSms,
  faUserShield,
  faLock,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from "../../components/Layout/Layout";
import useAuthValidation from '../../hooks/useAuthValidation';
import Loading from '../../components/Loading/Loading';
import './Usuario.css';

const Usuario = () => {
  // Estados
  const [editMode, setEditMode] = useState(false);
  const [doisFatoresAtivo, setDoisFatoresAtivo] = useState(true);
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    sms: false,
    app: true
  });
  
  // Estados editáveis
  const [userData, setUserData] = useState({
    nome: "Carlos Oliveira",
    email: "c.oliveira@assistec.com.br",
    cargo: "Técnico Nível III"
  });

  // Estados temporários para edição
  const [editedData, setEditedData] = useState({ ...userData });
  
  // Estados para alteração de senha
  const [senha, setSenha] = useState({
    atual: '',
    nova: '',
    confirmacao: ''
  });

  // Estados das permissões (exemplo)
  const [permissoes] = useState([
    { nome: "Gestor de Obras", nivel: "Completo" },
    { nome: "Núcleo Técnico ", nivel: "Parcial" },
    { nome: "Escala de Plantão", nivel: "Completo" },
    
  ]);

  // Handlers
  const handleEditToggle = () => {
    if (editMode) {
      // Simular salvamento dos dados
      setUserData(editedData);
    }
    setEditMode(!editMode);
  };

  const handleCancelEdit = () => {
    setEditedData(userData);
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  const handleSenhaChange = (e) => {
    setSenha({
      ...senha,
      [e.target.name]: e.target.value
    });
  };

  const handle2FAToggle = () => {
    setDoisFatoresAtivo(!doisFatoresAtivo);
  };

  const handleNotificacoesChange = (type) => {
    setNotificacoes({
      ...notificacoes,
      [type]: !notificacoes[type]
    });
  };

  const handleSubmitSenha = (e) => {
    e.preventDefault();
    // Lógica para alterar senha
    console.log('Senha alterada:', senha);
    setSenha({ atual: '', nova: '', confirmacao: '' });
  };

  // Validações: módulo 1 (Dashboard), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(7, null, 1);

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão...</div>;
  }

  return (
    <Layout
      title="Perfil do Colaborador"
      content={
        <Container className="usuario-container">
          {/* Cabeçalho */}
          <Row className="profile-header mb-4 align-items-center">
            <Col md={8} className="d-flex align-items-center">
              <div className="avatar-circle me-3">
                <FontAwesomeIcon icon={faUserShield} size="2x" className="text-light" />
              </div>
              <div>
                {editMode ? (
                  <>
                    <Form.Control
                      name="nome"
                      value={editedData.nome}
                      onChange={handleInputChange}
                      className="mb-2"
                    />
                    <Form.Control
                      name="cargo"
                      value={editedData.cargo}
                      onChange={handleInputChange}
                      className="mb-2"
                    />
                    <Form.Control
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                    />
                  </>
                ) : (
                  <>
                    <h2 className="mb-1">{userData.nome}</h2>
                    <p className="text-muted mb-0">{userData.cargo}</p>
                    <small className="text-muted">{userData.email}</small>
                  </>
                )}
              </div>
            </Col>
            <Col md={4} className="text-end">
              {editMode ? (
                <div className="d-grid gap-2">
                  <Button variant="primary" size="sm" onClick={handleEditToggle}>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Salvar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="outline-primary" size="sm" onClick={handleEditToggle}>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Editar Perfil
                </Button>
              )}
            </Col>
          </Row>

          <Row>
            {/* Coluna Esquerda - Dados e Segurança */}
            <Col md={6}>
              <div className="security-section mb-4 p-4">
                <h4 className="mb-4">
                  <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
                  Segurança
                </h4>
                
                <div className="mb-4">
                  <Form.Group controlId="form2FA">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label>
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        Autenticação em Dois Fatores (2FA)
                      </Form.Label>
                      <Form.Check 
                        type="switch"
                        checked={doisFatoresAtivo}
                        onChange={handle2FAToggle}
                        label={doisFatoresAtivo ? 'Ativo' : 'Inativo'}
                      />
                    </div>
                  </Form.Group>
                </div>

                <Form onSubmit={handleSubmitSenha}>
                  <h5 className="mb-3"><FontAwesomeIcon icon={faKey} className="me-2" />Alterar Senha</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Senha Atual</Form.Label>
                    <Form.Control
                      type="password"
                      name="atual"
                      value={senha.atual}
                      onChange={handleSenhaChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nova Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="nova"
                      value={senha.nova}
                      onChange={handleSenhaChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar Nova Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmacao"
                      value={senha.confirmacao}
                      onChange={handleSenhaChange}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Atualizar Senha
                  </Button>
                </Form>
              </div>
            </Col>

            {/* Coluna Direita - Permissões e Notificações */}
            <Col md={6}>
              <div className="permissions-section mb-4 p-4">
                <h4 className="mb-4">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" />
                  Permissões de Acesso
                </h4>
                
                <ListGroup variant="flush">
                  {permissoes.map((permissao, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <span>{permissao.nome}</span>
                      <Badge bg={permissao.nivel === 'Completo' ? 'primary' : 'secondary'}>
                        {permissao.nivel}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>

              <div className="notifications-section p-4">
                <h4 className="mb-4">
                  <FontAwesomeIcon icon={faBell} className="me-2" />
                  Preferências de Notificação
                </h4>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="switch"
                      id="email-notifications"
                      label="Notificações por E-mail"
                      checked={notificacoes.email}
                      onChange={() => handleNotificacoesChange('email')}
                      icon={<FontAwesomeIcon icon={faEnvelope} />}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="switch"
                      id="sms-notifications"
                      label="Notificações por SMS"
                      checked={notificacoes.sms}
                      onChange={() => handleNotificacoesChange('sms')}
                      icon={<FontAwesomeIcon icon={faSms} />}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Check 
                      type="switch"
                      id="app-notifications"
                      label="Notificações no Aplicativo"
                      checked={notificacoes.app}
                      onChange={() => handleNotificacoesChange('app')}
                    />
                  </Form.Group>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      }
    />
  );
};

export default Usuario;