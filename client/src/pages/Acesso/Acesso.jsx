import { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Modal,
  Badge,
  Alert
} from 'react-bootstrap';
import { 
  faSearch,
  faEdit,
  faTrash,
  faUserPlus,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthValidation from '../../hooks/useAuthValidation';
import Layout from "../../components/Layout/Layout";
import './Acesso.css';

const Acesso = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [permissoesList, setPermissoesList] = useState([]);
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    perfil: 'todos',
    status: 'todos'
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    re: '',
    celular: '',
    email: '',
    senha: '',
    empresa: '',
    regional: '',
    divisao: '',
    contrato: '',
    cargo: 'generico',
    perfil: 'tecnico',
    status: 0,
    permissoes: [],
    permissoes_modulo: [],
    permissoes_submodulo: []
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [usuariosResponse, permissoesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/usuario/buscar`),
          fetch(`${import.meta.env.VITE_API_URL}/usuario/permissoes`)
        ]);

        if (!usuariosResponse.ok) throw new Error('Erro ao carregar usuários');
        if (!permissoesResponse.ok) throw new Error('Erro ao carregar permissões');

        const usuariosData = await usuariosResponse.json();
        const permissoesData = await permissoesResponse.json();

        setModules(permissoesData.modulos);
        setSubmodules(permissoesData.subModulos);
        setPermissoesList(permissoesData.permissoes);

        const usuariosFormatados = usuariosData.map(usuario => ({
          id: usuario.ID,
          nome: usuario.NOME,
          re: usuario.RE,
          celular: usuario.CELULAR,
          email: usuario.EMAIL,
          empresa: usuario.EMPRESA,
          regional: usuario.REGIONAL,
          divisao: usuario.DIVISAO,
          contrato: usuario.CONTRATO,
          cargo: usuario.CARGO,
          perfil: usuario.PERFIL,
          status: usuario.STATUS,
          permissoes: JSON.parse(usuario.PERMISSOES),
          permissoes_modulo: JSON.parse(usuario.PERMISSOES_MODULO),
          permissoes_submodulo: JSON.parse(usuario.PERMISSOES_SUBMODULO),
          ultimoAcesso: usuario.ULTIMO_ACESSO ? 
            new Date(usuario.ULTIMO_ACESSO).toLocaleString() : 'Nunca acessou'
        }));

        setUsuarios(usuariosFormatados);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  

  const groupedSubmodules = useMemo(() => {
    return submodules.reduce((agrupado, submodulo) => {
      if (!agrupado[submodulo.ID_MODULO]) {
        agrupado[submodulo.ID_MODULO] = [];
      }
      agrupado[submodulo.ID_MODULO].push(submodulo);
      return agrupado;
    }, {});
  }, [submodules]);

  const handleCriarUsuario = async () => {
    try {
      if (!novoUsuario.senha) throw new Error('Senha é obrigatória');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...novoUsuario,
          permissoes: JSON.stringify(novoUsuario.permissoes),
          permissoes_modulo: JSON.stringify(novoUsuario.permissoes_modulo),
          permissoes_submodulo: JSON.stringify(novoUsuario.permissoes_submodulo),
          status: novoUsuario.status
        }),
      });

      if (!response.ok) throw new Error('Erro ao cadastrar usuário');
      
      await carregarUsuarios();
      setShowNovoModal(false);
      setNovoUsuario({
        nome: '',
        re: '',
        celular: '',
        email: '',
        senha: '',
        empresa: '',
        regional: '',
        divisao: '',
        contrato: '',
        cargo: '',
        perfil: 'tecnico',
        status: 0,
        permissoes: [],
        permissoes_modulo: [],
        permissoes_submodulo: []
      });
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleSalvarEdicao = async () => {
    try {
      // Garantir que campos opcionais tenham null se estiverem undefined
      const dadosCorrigidos = {
        ...usuarioEditando,
        cargo: usuarioEditando.cargo || null,
        divisao: usuarioEditando.divisao || null,
        contrato: usuarioEditando.contrato || null,
        regional: usuarioEditando.regional || null,
        empresa: usuarioEditando.empresa || null,
        permissoes: JSON.stringify(usuarioEditando.permissoes),
        permissoes_modulo: JSON.stringify(usuarioEditando.permissoes_modulo),
        permissoes_submodulo: JSON.stringify(usuarioEditando.permissoes_submodulo)
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/editar/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCorrigidos),
      });
  
      if (!response.ok) throw new Error('Erro ao salvar edição');
      
      await carregarUsuarios();
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleExcluirUsuario = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/excluir/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir usuário');
      
      setUsuarios(usuarios.filter(usuario => usuario.id !== userId));
    } catch (error) {
      setErro(error.message);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/buscar`);
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      
      const data = await response.json();
      const usuariosFormatados = data.map(usuario => ({
        id: usuario.ID,
        nome: usuario.NOME,
        re: usuario.RE,
        celular: usuario.CELULAR,
        email: usuario.EMAIL,
        empresa: usuario.EMPRESA,
        regional: usuario.REGIONAL,
        divisao: usuario.DIVISAO,
        contrato: usuario.CONTRATO,
        cargo: usuario.CARGO,
        perfil: usuario.PERFIL,
        status: usuario.STATUS,
        permissoes: JSON.parse(usuario.PERMISSOES),
        permissoes_modulo: JSON.parse(usuario.PERMISSOES_MODULO),
        permissoes_submodulo: JSON.parse(usuario.PERMISSOES_SUBMODULO),
        ultimoAcesso: usuario.ULTIMO_ACESSO ? 
          new Date(usuario.ULTIMO_ACESSO).toLocaleString() : 'Nunca acessou'
      }));
      
      setUsuarios(usuariosFormatados);
    } catch (error) {
      setErro(error.message);
    }
  };


  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchPesquisa = usuario.nome.toLowerCase().includes(filtro.pesquisa.toLowerCase()) ||
                          usuario.email.toLowerCase().includes(filtro.pesquisa.toLowerCase());
    const matchPerfil = filtro.perfil === 'todos' || usuario.perfil === filtro.perfil;
    const matchStatus = filtro.status === 'todos' || usuario.status === parseInt(filtro.status);
  return matchPesquisa && matchPerfil && matchStatus;
  });

  // Validações: módulo 1 (Dashboard), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(4, null, 1,);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Controle de Acessos"
      content={
        <Container fluid className="acesso-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-4 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Pesquisar por nome ou email"
                  value={filtro.pesquisa}
                  onChange={(evento) => setFiltro({...filtro, pesquisa: evento.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filtro.perfil}
                onChange={(evento) => setFiltro({...filtro, perfil: evento.target.value})}
              >
                <option value="todos">Todos os perfis</option>
                <option value="tecnico">Técnico</option>
                <option value="assistente">Assistente</option>
                <option value="analista">Analista</option>
                <option value="coordenador">Coordenador</option>
                <option value="gerente">Gerente</option>
                <option value="administrador">Administrador</option>
              </Form.Select>
            </Col>
            <Col md={2}>
            <Form.Select
              value={filtro.status}
              onChange={(e) => setFiltro({...filtro, status: e.target.value})}
            >
              <option value="todos">Todos status</option>
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
              <option value={3}>Bloqueado</option>
            </Form.Select>
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>RE</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Cargo</th>
                      <th>Status</th>
                      <th>Último Acesso</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(usuario => (
                      <tr key={usuario.id}>
                        <td>{usuario.re}</td>
                        <td>{usuario.nome}</td>
                        <td>{usuario.email}</td>
                        <td>
                          <Badge bg={
                            usuario.perfil === 'administrador' ? 'danger' : 
                            usuario.perfil === 'gerente' ? 'warning' : 'secondary'
                          }>
                            {usuario.perfil}
                          </Badge>
                        </td>
                        <td>
                        <td>
                          <Badge bg={
                            usuario.status === 1 ? 'success' : 
                            usuario.status === 3 ? 'danger' : 'secondary'
                          }>
                            {usuario.status === 1 ? 'Ativo' : usuario.status === 3 ? 'Bloqueado' : 'Inativo'}
                          </Badge>
                        </td>
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

          <div className="floating-action">
            <Button variant="primary" size="lg" onClick={() => setShowNovoModal(true)}>
              <FontAwesomeIcon icon={faUserPlus} />
            </Button>
          </div>

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
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome Completo</Form.Label>
                        <Form.Control
                          value={usuarioEditando.nome}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, nome: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>RE</Form.Label>
                        <Form.Control
                          value={usuarioEditando.re}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, re: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Celular</Form.Label>
                        <Form.Control
                          value={usuarioEditando.celular}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, celular: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={usuarioEditando.email}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, email: evento.target.value})}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Empresa</Form.Label>
                        <Form.Control
                          value={usuarioEditando.empresa}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, empresa: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Regional</Form.Label>
                        <Form.Control
                          value={usuarioEditando.regional}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, regional: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Divisão</Form.Label>
                        <Form.Control
                          value={usuarioEditando.divisao}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, divisao: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Contrato</Form.Label>
                        <Form.Control
                          value={usuarioEditando.contrato}
                          onChange={(evento) => setUsuarioEditando({...usuarioEditando, contrato: evento.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={usuarioEditando?.status}
                          onChange={(e) => setUsuarioEditando({...usuarioEditando, status: parseInt(e.target.value)})}
                        >
                          <option value={1}>Ativo</option>
                          <option value={0}>Inativo</option>
                          <option value={3}>Bloqueado</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <PermissoesEditor 
                    usuario={usuarioEditando}
                    atualizarUsuario={setUsuarioEditando}
                    modulos={modules}
                    submodulosAgrupados={groupedSubmodules}
                    permissoes={permissoesList}
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

          <Modal show={showNovoModal} onHide={() => setShowNovoModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                Novo Usuário
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome Completo</Form.Label>
                      <Form.Control
                        value={novoUsuario.nome}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, nome: evento.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>RE</Form.Label>
                      <Form.Control
                        value={novoUsuario.re}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, re: evento.target.value})}
                        placeholder="Digite o RE"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Celular</Form.Label>
                      <Form.Control
                        value={novoUsuario.celular}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, celular: evento.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={novoUsuario.email}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, email: evento.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        value={novoUsuario.senha}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, senha: evento.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Empresa</Form.Label>
                      <Form.Control
                        value={novoUsuario.empresa}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, empresa: evento.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Regional</Form.Label>
                      <Form.Control
                        value={novoUsuario.regional}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, regional: evento.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Divisão</Form.Label>
                      <Form.Control
                        value={novoUsuario.divisao}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, divisao: evento.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Contrato</Form.Label>
                      <Form.Control
                        value={novoUsuario.contrato}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, contrato: evento.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={novoUsuario.status}
                        onChange={(e) => setNovoUsuario({...novoUsuario, status: parseInt(e.target.value)})}
                      >
                        <option value={1}>Ativo</option>
                        <option value={0}>Inativo</option>
                        <option value={3}>Bloqueado</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Perfil</Form.Label>
                      <Form.Select
                        value={novoUsuario.perfil}
                        onChange={(evento) => setNovoUsuario({...novoUsuario, perfil: evento.target.value})}
                      >
                        <option value="tecnico">Técnico</option>
                        <option value="assistente">Assistente</option>
                        <option value="analista">Analista</option>
                        <option value="coordenador">Coordenador</option>
                        <option value="gerente">Gerente</option>
                        <option value="administrador">Administrador</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <PermissoesEditor 
                  usuario={novoUsuario}
                  atualizarUsuario={setNovoUsuario}
                  modulos={modules}
                  submodulosAgrupados={groupedSubmodules}
                  permissoes={permissoesList}
                />
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

const PermissoesEditor = ({ usuario, atualizarUsuario, modulos, submodulosAgrupados, permissoes }) => {
  const alternarPermissao = (tipo, valor) => {
    const campo = {
      modulo: 'permissoes_modulo',
      submodulo: 'permissoes_submodulo',
      acao: 'permissoes'
    }[tipo];

    // Garante que o campo seja um array
    const valoresAtuais = Array.isArray(usuario[campo]) ? usuario[campo] : [];

    // Cria um novo array com base na seleção/deseleção
    const novosValores = valoresAtuais.includes(valor)
      ? valoresAtuais.filter(v => v !== valor) // Remove o valor se já existir
      : [...valoresAtuais, valor]; // Adiciona o valor se não existir

    // Atualiza o estado do usuário de forma imutável
    const usuarioAtualizado = { 
      ...usuario, 
      [campo]: novosValores 
    };

    console.log('Novos valores:', novosValores); // Log para depuração
    console.log('Usuário atualizado:', usuarioAtualizado); // Log para depuração

    // Atualiza o estado do usuário
    atualizarUsuario(usuarioAtualizado);
  };

  return (
    <div className="permissoes-editor">
      <h5 className="mb-4">Controle de Permissões</h5>

      <div className="modulos-section mb-4">
        <h6>Módulos e Submódulos</h6>
        {modulos.map(modulo => (
          <div key={modulo.ID} className="modulo-item mb-3">
            <Form.Check 
              type="checkbox"
              id={`modulo-${modulo.ID}`}
              label={modulo.MODULO}
              checked={usuario.permissoes_modulo?.includes(modulo.ID)}
              onChange={() => alternarPermissao('modulo', modulo.ID)}
            />

            {submodulosAgrupados[modulo.ID]?.map(submodulo => (
              <div key={submodulo.ID} className="submodulo-item ms-4 mt-2">
                <Form.Check
                  type="checkbox"
                  id={`submodulo-${submodulo.ID}`}
                  label={submodulo.SUBMODULO}
                  checked={usuario.permissoes_submodulo?.includes(submodulo.ID)}
                  onChange={() => alternarPermissao('submodulo', submodulo.ID)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="permissoes-section">
        <h6 className="mb-3">Permissões de Ação</h6>
        <Row>
          {permissoes.map(permissao => (
            <Col md={4} key={permissao.ID} className="mb-2">
              <Form.Check
                type="checkbox"
                id={`permissao-${permissao.ID}`}
                label={permissao.PERMISSAO}
                checked={usuario.permissoes?.includes(permissao.ID)} 
                onChange={() => alternarPermissao('acao', permissao.ID)} 
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Acesso;