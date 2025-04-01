import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,

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
import Select from 'react-select';
import { registrarLog } from '../../../hooks/logs';
import './ConsultaPrioritaria.css';

const ConsultaPrioritaria = () => {
  // Estados principais
  const [consultas, setConsultas] = useState([]);
  const [consultasIniciais, setConsultasIniciais] = useState([]);
  const [filtro, setFiltro] = useState({
    gbe: '',
    swo: '',
    fibra: '',
    cabo: ''
  });
  const [opcoesFiltro, setOpcoesFiltro] = useState({
    gbe: [],
    swo: [],
    fibra: [],
    cabo: []
  });
  const [buscaSelect, setBuscaSelect] = useState({
    gbe: '',
    swo: '',
    fibra: '',
    cabo: ''
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [consultaDetalhada, setConsultaDetalhada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [pesquisando, setPesquisando] = useState(false);
  const token = localStorage.getItem('token'); 

  // Validações de permissão
  const { loading, user, permissions } = useAuthValidation(3, 7, 1);

  // Carrega os dados iniciais
  useEffect(() => {
    const carregarConsultas = async () => {
      try {

        await registrarLog(
          token,
          'Consulta',
          'Núcleo Técnico - Consulta Prioritária - Página carregada com sucesso'
        );

        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar?limit=30000`);
        if (!response.ok) throw new Error('Erro ao carregar consultas');
        
        const data = await response.json();
        setConsultas(data);
        setConsultasIniciais(data);
        
        // Extrai opções únicas para os selects
        const extrairOpcoesUnicas = (campo) => [...new Set(data.map(item => item[campo]).filter(Boolean))];
        
        setOpcoesFiltro({
          gbe: extrairOpcoesUnicas('GBE'),
          swo: extrairOpcoesUnicas('SWO'),
          fibra: extrairOpcoesUnicas('FIBRA'),
          cabo: extrairOpcoesUnicas('CABO')
        });
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarConsultas();
  }, []);

  // Atualiza as opções dos selects com base nos filtros aplicados
  useEffect(() => {
    const consultasFiltradas = consultasIniciais.filter(consulta => {
      if (filtro.gbe && consulta.GBE !== filtro.gbe) return false;
      if (filtro.swo && consulta.SWO !== filtro.swo) return false;
      if (filtro.fibra && consulta.FIBRA !== filtro.fibra) return false;
      if (filtro.cabo && consulta.CABO !== filtro.cabo) return false;
      return true;
    });

    const extrairOpcoesUnicas = (campo) => [...new Set(consultasFiltradas.map(item => item[campo]).filter(Boolean))];
    
    setOpcoesFiltro({
      gbe: filtro.gbe ? [filtro.gbe] : extrairOpcoesUnicas('GBE'),
      swo: filtro.swo ? [filtro.swo] : extrairOpcoesUnicas('SWO'),
      fibra: filtro.fibra ? [filtro.fibra] : extrairOpcoesUnicas('FIBRA'),
      cabo: filtro.cabo ? [filtro.cabo] : extrairOpcoesUnicas('CABO')
    });
  }, [filtro, consultasIniciais]);

  // Filtra as opções com base no texto de busca
  const filtrarOpcoes = (campo) => {
    return opcoesFiltro[campo]
      .filter(opcao => opcao.toLowerCase().includes(buscaSelect[campo].toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  };

  // Manipuladores de eventos
  const handlePesquisar = async () => {
    setPesquisando(true);
    try {
      await registrarLog(
        token,
        'Consulta',
        'Núcleo Técnico - Consulta Prioritária - Realizando pesquisa com filtros'
      );
      const params = {
        gbe: filtro.gbe || '',
        swo: filtro.swo || '',
        fibra: filtro.fibra || '',
        cabo: filtro.cabo || '',
        isSearch: true
      };

      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar?${queryParams}`);
      
      if (!response.ok) throw new Error('Erro ao carregar consultas');
      
      const data = await response.json();
      setConsultas(data);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - Consulta Prioritária - Erro na pesquisa: ${error.message}`
      );
    } finally {
      setPesquisando(false);
    }
  };

  const handleLimparPesquisa = () => {
    setFiltro({
      gbe: '',
      swo: '',
      fibra: '',
      cabo: ''
    });
    setBuscaSelect({
      gbe: '',
      swo: '',
      fibra: '',
      cabo: ''
    });
    setConsultas(consultasIniciais);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltro(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Limpa a busca quando seleciona um valor
    setBuscaSelect(prev => ({
      ...prev,
      [campo]: ''
    }));
  };

  const handleBuscaSelectChange = (campo, valor) => {
    setBuscaSelect(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const abrirModalEdicao = async (consulta) => {
    try {
      await registrarLog(
        token,
        'Consulta',
        `Núcleo Técnico - Consulta Prioritária - Acessando detalhes para edição ID: ${consulta.ID}`
      );
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar/${consulta.ID}`);
      if (!response.ok) throw new Error('Erro ao carregar consulta para edição');
      
      const dadosConsulta = await response.json();
      setConsultaEditando(dadosConsulta);
      setShowEditarModal(true);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - Consulta Prioritária - Erro ao carregar para edição: ${error.message}`
      );
    }
  };

  const handleSalvarEdicao = async () => {
    try {

      await registrarLog(
        token,
        'Editar',
        `Núcleo Técnico - Consulta Prioritária - Tentativa de edição ID: ${consultaEditando.ID}`
      );
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/editar/${consultaEditando.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaEditando),
      });
  
      if (!response.ok) throw new Error('Erro ao salvar edição');

      await registrarLog(
        token,
        'Editar',
        `Núcleo Técnico - Consulta Prioritária - Edição realizada com sucesso ID: ${consultaEditando.ID}`);
  
      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
      setConsultas(consultasAtualizadas);
      setConsultasIniciais(consultasAtualizadas);
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - Consulta Prioritária - Erro ao editar: ${error.message}`
      );
    }
  };

  const handleExcluirConsulta = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    try {
      await registrarLog(
        token,
        'Excluir',
        `Núcleo Técnico - Consulta Prioritária - Tentativa de exclusão ID: ${id}`
      );
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/excluir/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir consulta');

      await registrarLog(
        token,
        'Excluir',
        `Núcleo Técnico - Consulta Prioritária - Exclusão realizada com sucesso ID: ${id}`
      );

      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/consulta-prioritaria/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
      setConsultas(consultasAtualizadas);
      setConsultasIniciais(consultasAtualizadas);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - Consulta Prioritária - Erro ao excluir: ${error.message}`
      );
    }
  };

  // Configuração da tabela
  const colunas = [
    { chave: 'GBE', titulo: 'GBE' },
    { chave: 'SWO', titulo: 'SWO' },
    { chave: 'FIBRA', titulo: 'Fibra' },
    { chave: 'CABO', titulo: 'Cabo' },
    { chave: 'FABRICANTE', titulo: 'Fabricante' },
    { chave: 'EQUIP', titulo: 'Equipamento' },
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

  const formatOptions = (options) => {
    return options.map(option => ({
      value: option,
      label: option
    }));
  };

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Consulta Prioritária"
      content={
        <Container fluid className="consulta-prioritaria-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          {/* Seção de Filtros */}
          <Row className="mb-4 filtros-section">
            <Col md={12}>
              <Row>
                {/* Filtro GBE */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>GBE</Form.Label>
                    <Select
                      options={formatOptions(opcoesFiltro.gbe)}
                      value={filtro.gbe ? { value: filtro.gbe, label: filtro.gbe } : null}
                      onChange={(selected) => handleFiltroChange('gbe', selected ? selected.value : '')}
                      onInputChange={(input) => handleBuscaSelectChange('gbe', input)}
                      placeholder="Todos"
                      isClearable
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </Form.Group>
                </Col>

                {/* Filtro SWO */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>SWO</Form.Label>
                    <Select
                      options={formatOptions(opcoesFiltro.swo)}
                      value={filtro.swo ? { value: filtro.swo, label: filtro.swo } : null}
                      onChange={(selected) => handleFiltroChange('swo', selected ? selected.value : '')}
                      onInputChange={(input) => handleBuscaSelectChange('swo', input)}
                      placeholder="Todos"
                      isClearable
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </Form.Group>
                </Col>

                {/* Filtro Fibra */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fibra</Form.Label>
                    <Select
                      options={formatOptions(opcoesFiltro.fibra)}
                      value={filtro.fibra ? { value: filtro.fibra, label: filtro.fibra } : null}
                      onChange={(selected) => handleFiltroChange('fibra', selected ? selected.value : '')}
                      onInputChange={(input) => handleBuscaSelectChange('fibra', input)}
                      placeholder="Todos"
                      isClearable
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </Form.Group>
                </Col>

                {/* Filtro Cabo */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Cabo</Form.Label>
                    <Select
                      options={formatOptions(opcoesFiltro.cabo)}
                      value={filtro.cabo ? { value: filtro.cabo, label: filtro.cabo } : null}
                      onChange={(selected) => handleFiltroChange('cabo', selected ? selected.value : '')}
                      onInputChange={(input) => handleBuscaSelectChange('cabo', input)}
                      placeholder="Todos"
                      isClearable
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Botões de ação - Agora centralizados */}
              <Row className="mt-3">
                <Col className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    onClick={handlePesquisar}
                    disabled={pesquisando}
                    className="me-2"
                    style={{ minWidth: '180px' }}  // Largura mínima aumentada
                  >
                    {pesquisando ? (
                      <>
                        <FontAwesomeIcon icon={faSync} spin className="me-2" />
                        Pesquisando...
                      </>
                    ) : (
                      'Pesquisar'
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleLimparPesquisa}
                    style={{ minWidth: '180px' }}  // Largura mínima aumentada
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Limpar
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Tabela de resultados */}
          <Row>
            <Col>
              {carregando ? (
                <Loading />
              ) : (
                <TabelaPaginada
                  dados={consultas}
                  colunas={colunas}
                  onEditar={abrirModalEdicao}
                  onExcluir={(item) => handleExcluirConsulta(item.ID)}
                  onDetalhes={(item) => {
                    setConsultaDetalhada(item);
                    setShowDetalhesModal(true);
                  }}
                  permissoes={permissions}
                />
              )}
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