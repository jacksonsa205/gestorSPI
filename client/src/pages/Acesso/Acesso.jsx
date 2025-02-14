import { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Modal,
  Badge
} from 'react-bootstrap';
import { 
  faUser, 
  faLock,
  faSearch,
  faEdit,
  faTrash,
  faUserPlus,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from "../../components/Layout/Layout";
import './Acesso.css';

const Acesso = () => {
  // Dados mockados
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nome: "Carlos Silva",
      email: "carlos@assistec.com.br",
      cargo: "Técnico Sênior",
      perfil: "tecnico",
      status: "ativo",
      permissoes: ["os-criar", "estoque-ver"],
      ultimoAcesso: "2023-08-15 14:30"
    }
  ]);

  // Estados do filtro
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    perfil: 'todos',
    status: 'todos'
  });

  // Estados para modais
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    cargo: '',
    perfil: 'tecnico',
    status: 'ativo',
    permissoes: []
  });

  // Filtragem de usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchPesquisa = usuario.nome.toLowerCase().includes(filtro.pesquisa.toLowerCase()) ||
                          usuario.email.toLowerCase().includes(filtro.pesquisa.toLowerCase());
    const matchPerfil = filtro.perfil === 'todos' || usuario.perfil === filtro.perfil;
    const matchStatus = filtro.status === 'todos' || usuario.status === filtro.status;
    
    return matchPesquisa && matchPerfil && matchStatus;
  });

  // Funções de manipulação
  const handleStatusChange = (userId) => {
    setUsuarios(usuarios.map(usuario => 
      usuario.id === userId 
        ? {...usuario, status: usuario.status === 'ativo' ? 'inativo' : 'ativo'} 
        : usuario
    ));
  };

  const handleSalvarEdicao = () => {
    setUsuarios(usuarios.map(user => 
      user.id === usuarioEditando.id ? usuarioEditando : user
    ));
    setShowEditarModal(false);
  };

  const handleCriarUsuario = () => {
    const newUser = {
      ...novoUsuario,
      id: usuarios.length + 1,
      ultimoAcesso: new Date().toLocaleString()
    };
    setUsuarios([...usuarios, newUser]);
    setShowNovoModal(false);
    setNovoUsuario({
      nome: '',
      email: '',
      cargo: '',
      perfil: 'tecnico',
      status: 'ativo',
      permissoes: []
    });
  };

  const handleExcluirUsuario = (userId) => {
    setUsuarios(usuarios.filter(user => user.id !== userId));
  };

  return (
    <Layout
      title="Controle de Acessos"
      content={
        <Container fluid className="acesso-container">
          {/* Filtros e Busca */}
          <Row className="mb-4 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Pesquisar por nome ou email"
                  value={filtro.pesquisa}
                  onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filtro.perfil}
                onChange={(e) => setFiltro({...filtro, perfil: e.target.value})}
              >
                <option value="todos">Todos os perfis</option>
                <option value="tecnico">Técnico</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filtro.status}
                onChange={(e) => setFiltro({...filtro, status: e.target.value})}
              >
                <option value="todos">Todos status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Tabela de Usuários */}
          <Row>
            <Col>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Perfil</th>
                      <th>Status</th>
                      <th>Último Acesso</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(usuario => (
                      <tr key={usuario.id}>
                        <td>{usuario.nome}</td>
                        <td>{usuario.email}</td>
                        <td>
                          <Badge bg={
                            usuario.perfil === 'admin' ? 'danger' : 
                            usuario.perfil === 'supervisor' ? 'warning' : 'secondary'
                          }>
                            {usuario.perfil}
                          </Badge>
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            checked={usuario.status === 'ativo'}
                            onChange={() => handleStatusChange(usuario.id)}
                            label={usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          />
                        </td>
                        <td>{usuario.ultimoAcesso}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => {
                              setUsuarioEditando(usuario);
                              setShowEditarModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="ms-2"
                            onClick={() => handleExcluirUsuario(usuario.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

          {/* Botão de Novo Usuário */}
          <div className="floating-action">
            <Button variant="primary" size="lg" onClick={() => setShowNovoModal(true)}>
              <FontAwesomeIcon icon={faUserPlus} />
            </Button>
          </div>

          {/* Modal de Edição */}
          <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Editar Usuário - {usuarioEditando?.nome}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {usuarioEditando && (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      value={usuarioEditando.nome}
                      onChange={(e) => setUsuarioEditando({...usuarioEditando, nome: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={usuarioEditando.email}
                      onChange={(e) => setUsuarioEditando({...usuarioEditando, email: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Cargo</Form.Label>
                    <Form.Control
                      value={usuarioEditando.cargo}
                      onChange={(e) => setUsuarioEditando({...usuarioEditando, cargo: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Perfil</Form.Label>
                    <Form.Select
                      value={usuarioEditando.perfil}
                      onChange={(e) => setUsuarioEditando({...usuarioEditando, perfil: e.target.value})}
                    >
                      <option value="tecnico">Técnico</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Administrador</option>
                    </Form.Select>
                  </Form.Group>

                  <PermissoesEditor 
                    permissoes={usuarioEditando.permissoes}
                    onPermissoesChange={(permissoes) => 
                      setUsuarioEditando({...usuarioEditando, permissoes})
                    }
                  />
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditarModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSalvarEdicao}>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Salvar Alterações
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de Novo Usuário */}
          <Modal show={showNovoModal} onHide={() => setShowNovoModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                Novo Usuário
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    value={novoUsuario.nome}
                    onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={novoUsuario.email}
                    onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cargo</Form.Label>
                  <Form.Control
                    value={novoUsuario.cargo}
                    onChange={(e) => setNovoUsuario({...novoUsuario, cargo: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Perfil</Form.Label>
                  <Form.Select
                    value={novoUsuario.perfil}
                    onChange={(e) => setNovoUsuario({...novoUsuario, perfil: e.target.value})}
                  >
                    <option value="tecnico">Técnico</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={novoUsuario.status}
                    onChange={(e) => setNovoUsuario({...novoUsuario, status: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowNovoModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCriarUsuario}>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Criar Usuário
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      }
    />
  );
};

const PermissoesEditor = ({ permissoes, onPermissoesChange }) => {
  const togglePermissao = (permissao) => {
    const novasPermissoes = permissoes.includes(permissao)
      ? permissoes.filter(p => p !== permissao)
      : [...permissoes, permissao];
    onPermissoesChange(novasPermissoes);
  };

  return (
    <div className="permissoes-grid">
      <h5>Permissões de Acesso</h5>
      <Row>
        <Col md={4}>
          <div className="permissao-categoria">
            <h6>Ordens de Serviço</h6>
            <Form.Check
              label="Criar OS"
              checked={permissoes.includes('os-criar')}
              onChange={() => togglePermissao('os-criar')}
            />
            <Form.Check
              label="Editar OS"
              checked={permissoes.includes('os-editar')}
              onChange={() => togglePermissao('os-editar')}
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="permissao-categoria">
            <h6>Estoque</h6>
            <Form.Check
              label="Visualizar"
              checked={permissoes.includes('estoque-ver')}
              onChange={() => togglePermissao('estoque-ver')}
            />
            <Form.Check
              label="Gerenciar"
              checked={permissoes.includes('estoque-gerenciar')}
              onChange={() => togglePermissao('estoque-gerenciar')}
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="permissao-categoria">
            <h6>Administração</h6>
            <Form.Check
              label="Gerenciar Usuários"
              checked={permissoes.includes('admin-usuarios')}
              onChange={() => togglePermissao('admin-usuarios')}
            />
            <Form.Check
              label="Relatórios"
              checked={permissoes.includes('admin-relatorios')}
              onChange={() => togglePermissao('admin-relatorios')}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Acesso;