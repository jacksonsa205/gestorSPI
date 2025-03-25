import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Modal,
  Alert,
} from 'react-bootstrap';
import {
  faSearch,
  faEdit,
  faSync,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthValidation from '../../../hooks/useAuthValidation';
import Layout from "../../../components/Layout/Layout";
import TabelaPaginada from "../../../components/Table/TabelaPaginada";
import WhatsAppSender from "../../../components/WhatsAppSender/WhatsAppSender";
import Loading from '../../../components/Loading/Loading';
import './ConsultaPrioritaria.css';

const ConsultaPrioritaria = () => {
  const [consultas, setConsultas] = useState([]);
  const [consultasIniciais, setConsultasIniciais] = useState([]); // Armazena os dados iniciais
  const [filtro, setFiltro] = useState({
    pesquisa: '', // Mantemos o campo de pesquisa único
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [consultaDetalhada, setConsultaDetalhada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [pesquisando, setPesquisando] = useState(false); // Estado para indicar que está pesquisando

  // Validações: módulo 3 (Núcleo Técnico), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(3, 7, 1);

  useEffect(() => {
    const carregarConsultas = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar?limit=5000`);
        if (!response.ok) throw new Error('Erro ao carregar consultas');
        
        const data = await response.json();
        setConsultas(data);
        setConsultasIniciais(data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarConsultas();
  }, []);

  const handlePesquisar = async () => {
    setPesquisando(true);
    try {
      const queryParams = new URLSearchParams({ 
        pesquisa: filtro.pesquisa,
        isSearch: true // Adiciona flag para indicar que é uma pesquisa
      }).toString();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar?${queryParams}`);
      if (!response.ok) throw new Error('Erro ao carregar consultas');
      
      const data = await response.json();
      setConsultas(data);
    } catch (error) {
      setErro(error.message);
    } finally {
      setPesquisando(false);
    }
  };

  const handleLimparPesquisa = () => {
    setFiltro({ pesquisa: '' });
    setConsultas(consultasIniciais);
  };

  const abrirModalEdicao = async (consulta) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar/${consulta.ID}`); // Usando ID
      if (!response.ok) throw new Error('Erro ao carregar consulta para edição');
      
      const dadosConsulta = await response.json();
      setConsultaEditando(dadosConsulta);
      setShowEditarModal(true);
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleSalvarEdicao = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/editar/${consultaEditando.ID}`, { // Usando ID
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaEditando),
      });
  
      if (!response.ok) throw new Error('Erro ao salvar edição');
  
      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
      setConsultas(consultasAtualizadas);
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleExcluirConsulta = async (id) => { // Usando ID
    if (!window.confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/excluir/${id}`, { // Usando ID
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir consulta');

      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
      setConsultas(consultasAtualizadas);
    } catch (error) {
      setErro(error.message);
    }
  };

  const consultasFiltradas = consultas.filter(consulta => {
    // Verifica se o objeto consulta é válido
    if (!consulta) return false;
  
    // Cria campos seguros (trata null/undefined)
    const camposPesquisa = [
      consulta.GBE || '', // Converte null para string vazia
      consulta.SWO || '',
      consulta.FIBRA || '',
      consulta.CABO || '',
      consulta.FABRICANTE || '',
      consulta.EQUIP || '',
    ];
  
    // Converte o termo de pesquisa para minúsculas uma única vez
    const termoPesquisa = filtro.pesquisa.toLowerCase();
  
    return camposPesquisa.some(campo => 
      campo.toLowerCase().includes(termoPesquisa)
    );
  });

  const colunas = [
    { 
      chave: 'GBE', 
      titulo: 'GBE',
    },
    { 
      chave: 'SWO', 
      titulo: 'SWO',
    },
    { 
      chave: 'FIBRA', 
      titulo: 'Fibra',
    },
    { 
      chave: 'CABO', 
      titulo: 'Cabo',
    },
    { 
      chave: 'FABRICANTE', 
      titulo: 'Fabricante',
    },
    { 
      chave: 'EQUIP', 
      titulo: 'Equipamento',
    },
  ];

  const formatarDataHoraAtual = () => {
    const agora = new Date();
    return agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };
  
  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Consultas Prioritárias"
      content={
        <Container fluid className="consulta-prioritaria-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-4 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Pesquisar por GBE, SWO, Fibra, Cabo, Fabricante ou Equipamento"
                  value={filtro.pesquisa}
                  onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button
                variant="primary"
                onClick={handlePesquisar}
                disabled={pesquisando} // Desabilita o botão durante a pesquisa
              >
                {pesquisando ? (
                  <>
                    <FontAwesomeIcon icon={faSync} spin className="me-2" /> {/* Ícone de carregamento */}
                    Pesquisando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    Pesquisar
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleLimparPesquisa}
                className="ms-2"
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" /> {/* Novo ícone */}
                Limpar
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <TabelaPaginada
                dados={consultasFiltradas}
                colunas={colunas}
                onEditar={abrirModalEdicao}
                onExcluir={(item) => handleExcluirConsulta(item.ID)} // Usando ID
                onDetalhes={(item) => {
                  setConsultaDetalhada(item);
                  setShowDetalhesModal(true);
                }}
                permissoes={permissions}
              />
            </Col>
          </Row>

          {/* Modal Detalhes */}
          <Modal show={showDetalhesModal} onHide={() => setShowDetalhesModal(false)} size="lg" className="modal-detalhes">
          <Modal.Header closeButton>
            <div className="d-flex justify-content-between w-100 align-items-center">
              <Modal.Title className="m-0">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Detalhes da Consulta - {consultaDetalhada ? consultaDetalhada.GBE : "N/A"}
              </Modal.Title>
              <div className="d-flex align-items-center">
                {permissions.canEnviar && (
                    <WhatsAppSender
                      elementSelector=".modal-detalhes .modal-content"
                      fileName={`detalhe_consulta_${consultaDetalhada?.ID || 'desconhecida'}.png`}
                      caption={`Consulta Prioritária - GBE ${consultaDetalhada?.GBE || ''} - Data: ${formatarDataHoraAtual()}`}
                      variant="link"
                      className="text-success p-1 me-2"
                    />
                )}
              </div>
            </div>
          </Modal.Header>
            <Modal.Body>
              {consultaDetalhada ? (
                <div>
                  <Row>
                    <Col md={6}>
                      <p><strong>GBE:</strong> {consultaDetalhada.GBE || "N/A"}</p>
                      <p><strong>SWO:</strong> {consultaDetalhada.SWO || "N/A"}</p>
                      <p><strong>Fibra:</strong> {consultaDetalhada.FIBRA || "N/A"}</p>
                      <p><strong>Cabo:</strong> {consultaDetalhada.CABO || "N/A"}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Fabricante:</strong> {consultaDetalhada.FABRICANTE || "N/A"}</p>
                      <p><strong>Equipamento:</strong> {consultaDetalhada.EQUIP || "N/A"}</p>
                      <p><strong>Especificação:</strong> {consultaDetalhada.ESP_CADASTRO || "N/A"}</p>
                      <p><strong>Data de Alteração:</strong> {consultaDetalhada.DATA_ALTERACAO || "N/A"}</p>
                    </Col>
                  </Row>
                </div>
              ) : (
                <p>Nenhuma consulta selecionada.</p>
              )}
            </Modal.Body>
          </Modal>

          {/* Modal de Edição */}
          <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Editar Consulta
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {consultaEditando && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>GBE</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.GBE}
                          readOnly
                          disabled
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>SWO</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.SWO}
                          onChange={(e) => setConsultaEditando({...consultaEditando, SWO: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Fibra</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.FIBRA}
                          onChange={(e) => setConsultaEditando({...consultaEditando, FIBRA: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Cabo</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.CABO}
                          onChange={(e) => setConsultaEditando({...consultaEditando, CABO: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Fabricante</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.FABRICANTE}
                          onChange={(e) => setConsultaEditando({...consultaEditando, FABRICANTE: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Equipamento</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.EQUIP}
                          onChange={(e) => setConsultaEditando({...consultaEditando, EQUIP: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Especificação</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.ESP_CADASTRO}
                          onChange={(e) => setConsultaEditando({...consultaEditando, ESP_CADASTRO: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Data de Alteração</Form.Label>
                        <Form.Control
                          type="text"
                          value={consultaEditando.DATA_ALTERACAO}
                          onChange={(e) => setConsultaEditando({...consultaEditando, DATA_ALTERACAO: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditarModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSalvarEdicao}>
                Salvar Alterações
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      }
    />
  );
};

export default ConsultaPrioritaria;