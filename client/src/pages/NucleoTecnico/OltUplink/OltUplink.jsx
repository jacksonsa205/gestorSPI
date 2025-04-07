import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Modal,
  Badge,
  Alert,
} from 'react-bootstrap';
import {
  faSearch,
  faEdit,
  faPlus,
  faSave,
  faExclamationTriangle,
  faDownload,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthValidation from '../../../hooks/useAuthValidation';
import Layout from "../../../components/Layout/Layout";
import TabelaPaginada from "../../../components/Table/TabelaPaginada";
import WhatsAppSender from "../../../components/WhatsAppSender/WhatsAppSender";
import Loading from '../../../components/Loading/Loading';
import { registrarLog } from '../../../hooks/logs';
import './OltUplink.css';

const OltUplink = () => {
  const [oltsIsoladas, setOltsIsoladas] = useState([]);
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    TA: '',
    OLT: ''
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [oltEditando, setOltEditando] = useState(null);
  const [oltDetalhada, setOltDetalhada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [novaOltIsolada, setNovaOltIsolada] = useState({
    TA: '',
    OLT: '',
    AFETACAO: 0,
    EPS: '',
    DATA_CRIACAO: '', // Data inicial no formato ISO
    SLA: '',
    STATUS: '',
    OBSERVACAO: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [olts, setOlts] = useState([]);
  const [oltOk, setOltOk] = useState(165);
  const [oltNok, setOltNok] = useState(0);
  const [menosDe8Hrs, setMenosDe8Hrs] = useState(0);
  const [maisDe8Hrs, setMaisDe8Hrs] = useState(0);
  const [showGraficoModal, setShowGraficoModal] = useState(false);
  const token = localStorage.getItem('token'); 

  // Validações: módulo 3 (Núcleo Técnico), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(3, 5, 1);

  // Carregar OLTs disponíveis
  useEffect(() => {
    const carregarOLTs = async () => {
      try {
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/olt/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar OLTs');
        const data = await response.json();
        setOlts(data);
      } catch (error) {
        setErro(error.message);
        
      }
    };

    if (showNovoModal || showEditarModal) {
      carregarOLTs();
    }
  }, [showNovoModal, showEditarModal]);

  // Carregar OLTs Isoladas
  useEffect(() => {
    const carregarOltsIsoladas = async () => {
      try {
        await registrarLog(
          token,
          'Consulta',
          'Núcleo Técnico - OLT Uplink - Página carregada com sucesso'
        );
        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar OLTs Isoladas');
        
        const data = await response.json();
        setOltsIsoladas(data);
      } catch (error) {
        setErro(error.message);
        await registrarLog(
          token,
          'Erro',
          `Núcleo Técnico - OLT Uplink - Erro ao carregar dados: ${error.message}`
        );
      } finally {
        setCarregando(false);
      }
    };
  
    carregarOltsIsoladas();
  }, []);


  const prepararDadosGrafico = () => {
    const dadosOltStatus = [
      { name: 'OLT OK', value: oltOk },
      { name: 'OLT NOK', value: oltNok },
    ];
  
    const dadosTempoAfetacao = [
      { name: 'Menor 8 HRS', value: menosDe8Hrs },
      { name: 'Maior 8 HRS', value: maisDe8Hrs },
    ];
  
    return { dadosOltStatus, dadosTempoAfetacao };
  };

  const limparFormulario = () => {
    setNovaOltIsolada({
      TA: '',
      OLT: '',
      AFETACAO: 0,
      EPS: '',
      DATA_CRIACAO: '',
      SLA: '',
      STATUS: '',
      OBSERVACAO: ''
    });
  };
  

  const handleCriarOltIsolada = async () => {
    try {

      await registrarLog(
        token,
        'Cadastrar',
        `Núcleo Técnico - OLT Uplink - Tentativa de cadastro TA: ${novaOltIsolada.TA}`
      );
      // Ajustar a data para o formato ISO (UTC)
      const dataFormatada = new Date(novaOltIsolada.DATA_CRIACAO).toISOString().slice(0, 16);
  
      const dadosParaEnviar = {
        ...novaOltIsolada,
        DATA_CRIACAO: dataFormatada
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      });
  
      if (!response.ok) throw new Error('Erro ao cadastrar OLT Isolada');

      await registrarLog(
        token,
        'Cadastrar',
        `Núcleo Técnico - OLT Uplink - Cadastro realizado com sucesso TA: ${novaOltIsolada.TA}`
      );
  
      const responseOlts = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/buscar`);
      if (!responseOlts.ok) throw new Error('Erro ao carregar OLTs Isoladas');
  
      const novaOltCriada = await responseOlts.json();
      setOltsIsoladas(novaOltCriada);
      setShowNovoModal(false);
      limparFormulario();
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - OLT Uplink - Erro ao cadastrar: ${error.message}`
      );
    }
  };

  const handleSalvarEdicao = async () => {
    try {
      await registrarLog(
        token,
        'Editar',
        `Núcleo Técnico - OLT Uplink - Tentativa de edição TA: ${oltEditando.TA}`
      );
      // Ajustar o formato da data para o fuso horário local
      const dataLocal = new Date(oltEditando.DATA_CRIACAO);
      const dataFormatada = new Date(dataLocal.getTime() - dataLocal.getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');
  
      const dadosParaEnviar = {
        ...oltEditando,
        DATA_CRIACAO: dataFormatada
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/editar/${oltEditando.TA}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      });
  
      if (!response.ok) throw new Error('Erro ao salvar edição');

      await registrarLog(
        token,
        'Editar',
        `Núcleo Técnico - OLT Uplink - Edição realizada com sucesso TA: ${oltEditando.TA}`
      );
  
      const responseOlts = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/buscar`);
      if (!responseOlts.ok) throw new Error('Erro ao carregar OLTs Isoladas');
  
      const oltsAtualizadas = await responseOlts.json();
      setOltsIsoladas(oltsAtualizadas);
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - OLT Uplink - Erro ao editar: ${error.message}`
      );
    }
  };

  const abrirModalEdicao = async (olt) => {
    try {

      await registrarLog(
        token,
        'Consulta',
        `Núcleo Técnico - OLT Uplink - Acessando detalhes para edição TA: ${olt.TA}`
      );
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/buscar/${olt.TA}`);
      if (!response.ok) throw new Error('Erro ao carregar OLT Isolada para edição');
      
      const dadosOlt = await response.json();
      const dataLocal = new Date(dadosOlt.DATA_CRIACAO);
      const dataFormatada = new Date(dataLocal.getTime() - dataLocal.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      
      setOltEditando({
        ...dadosOlt,
        DATA_CRIACAO: dataFormatada
      });
      setShowEditarModal(true);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - OLT Uplink - Erro ao carregar para edição: ${error.message}`
      );
    }
  };

  const handleExcluirOltIsolada = async (TA) => {
    if (!window.confirm('Tem certeza que deseja excluir esta OLT Isolada?')) return;
    
    try {
      await registrarLog(
        token,
        'Excluir',
        `Núcleo Técnico - OLT Uplink - Tentativa de exclusão TA: ${TA}`
      );
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/excluir/${TA}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir OLT Isolada');

      await registrarLog(
        token,
        'Excluir',
        `Núcleo Técnico - OLT Uplink - Exclusão realizada com sucesso TA: ${TA}`
      );

      const responseOlts = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/buscar`);
      if (!responseOlts.ok) throw new Error('Erro ao carregar OLTs Isoladas');

      const oltsAtualizadas = await responseOlts.json();
      setOltsIsoladas(oltsAtualizadas);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - OLT Uplink - Erro ao excluir: ${error.message}`
      );
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/olt-uplink/buscar`);
      if (!response.ok) throw new Error('Erro ao carregar OLTs Isoladas');
  
      const data = await response.json();
  
      if (data.length === 0) {
        alert('Nenhum dado disponível para download.');
        return;
      }
  
      const csv = Papa.unparse(data, {
        delimiter: ";",
        quotes: true,
        header: true,
        encoding: "UTF-8"
      });
  
      const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'olts_uplink.csv';
      link.click();
      URL.revokeObjectURL(link.href);

      await registrarLog(
        token,
        'Download',
        'Núcleo Técnico - OLT Uplink - CSV baixado com sucesso'
      );
    } catch (error) {
      setErro(error.message);
    }
  };

  const oltsFiltradas = oltsIsoladas.filter(olt => {
    if (!olt) return false;

    if (filtro.pesquisa) {
      const campos = [
        olt.TA || '',
        olt.OLT || '',
        olt.EPS || '',
        olt.STATUS || ''
      ];
  
      const pesquisaMatch = campos.some(campo => 
        campo.toLowerCase().includes(filtro.pesquisa.toLowerCase())
      );
  
      if (!pesquisaMatch) return false;
    }
  
    if (filtro.TA && olt.TA !== filtro.TA) {
      return false;
    }
  
    if (filtro.OLT && olt.OLT !== filtro.OLT) {
      return false;
    }
  
    return true;
  });

  const formatarDataHoraAtual = () => {
    const agora = new Date();
    return agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Formato 24 horas
    });
  };

  const resetarInputs = () => {
    setOltOk(165);
    setOltNok(0);
    setMenosDe8Hrs(0);
    setMaisDe8Hrs(0);
  };

  const colunas = [
    { chave: 'TA', titulo: 'TA', formato: (valor) => <Badge bg="secondary">{valor || "N/A"}</Badge> },
    { chave: 'OLT', titulo: 'OLT' },
    { chave: 'AFETACAO', titulo: 'Afetação' },
    { chave: 'EPS', titulo: 'EPS' },
    { chave: 'DATA_CRIACAO', titulo: 'Data de Criação', formato: (valor) => {
        const data = new Date(valor);
        return isNaN(data) ? "N/A" : data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      }},
    { chave: 'SLA', titulo: 'SLA' },
    { chave: 'STATUS', titulo: 'Status',formato: (valor) => (
        <Badge bg={valor === 'ATIVO' ? 'success' : valor === 'PRÉ-BAIXA' ? 'warning' : 'secondary'}>
          {valor || "N/A"}
        </Badge>
      ),
    },
  ];

  // Opções para os selects
  const opcoesEPS = [
    { value: 'ABILITY', label: 'ABILITY' },
    { value: 'TEL-REDE', label: 'TEL-REDE' },
    { value: 'TEL-N1', label: 'TEL-N1' },
    { value: 'ICOMON', label: 'ICOMON' }
  ];

  const opcoesStatus = [
    { value: 'ATIVO', label: 'ATIVO' },
    { value: 'PRÉ-BAIXA', label: 'PRÉ-BAIXA' },
    { value: 'FECHADO', label: 'FECHADO' }
  ];


  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Gestão OLT Uplink"
      content={
        <Container fluid className="olt-isolada-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-4 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Pesquisar por TA, OLT ou EPS"
                    value={filtro.pesquisa}
                    onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
            {permissions.canCadastro && (
              <Button variant="primary" onClick={() => setShowNovoModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Cadastrar
              </Button>
            )}
              <Button variant="success" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Baixar CSV
              </Button>
            </Col>
          </Row>

          {/* Adicionar os novos inputs e o botão */}
          <Row className=" filtros-section mb-3 justify-content-between">
            <Col md={2}>
                <Form.Group>
                <Form.Label>OLT OK</Form.Label>
                <Form.Control
                    type="number"
                    value={oltOk}
                    readOnly
                    disabled
                    className="input-pequeno"
                />
                </Form.Group>
            </Col>
            <Col md={2}>
                <Form.Group>
                <Form.Label>OLT NOK</Form.Label>
                <Form.Control
                    type="number"
                    value={oltNok}
                    onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setOltNok(value);
                    setOltOk(165 - value);
                    }}
                    className="input-pequeno"
                />
                </Form.Group>
            </Col>
            <Col md={2}>
                <Form.Group>
                <Form.Label>Menos de 8 HRS</Form.Label>
                <Form.Control
                    type="number"
                    value={menosDe8Hrs}
                    onChange={(e) => setMenosDe8Hrs(parseInt(e.target.value, 10))}
                    className="input-pequeno"
                />
                </Form.Group>
            </Col>
            <Col md={2}>
                <Form.Group>
                <Form.Label>Mais de 8 HRS</Form.Label>
                <Form.Control
                    type="number"
                    value={maisDe8Hrs}
                    onChange={(e) => setMaisDe8Hrs(parseInt(e.target.value, 10))}
                    className="input-pequeno"
                />
                </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
                <Button variant="primary" onClick={() => setShowGraficoModal(true)}>
                Gerar Gráfico
                </Button>
            </Col>
            </Row>

          <Row>
            <Col>
              <TabelaPaginada
                dados={oltsFiltradas}
                colunas={colunas}
                onEditar={abrirModalEdicao}
                onExcluir={(item) => handleExcluirOltIsolada(item.TA)}
                onDetalhes={(item) => {
                  setOltDetalhada(item);
                  setShowDetalhesModal(true);
                }}
                permissoes={permissions}
              />
            </Col>
          </Row>

          {/* Modal para exibir o gráfico */}
          <Modal
            show={showGraficoModal}
            onHide={() => { setShowGraficoModal(false); resetarInputs(); }}
            size="lg"
            className="grafico-modal" // Adiciona a classe personalizada
            >
            <Modal.Header closeButton>
              <div className="d-flex justify-content-between w-100 align-items-center">
                <Modal.Title>
                  NT - Gestão de Uplinks e OLTs Remotas - 
                  <span className="data-atualizacao">Atualização:{" "}{formatarDataHoraAtual()}</span>
                </Modal.Title>
                <div className="d-flex align-items-center">
                  {permissions.canEnviar && (
                    <WhatsAppSender
                      elementSelector=".grafico-modal .modal-content"
                      fileName="relatorio_olts.png"
                      caption={`Relatório Gestão OLT Uplink - ${formatarDataHoraAtual()}`}
                      variant="link"
                      className="text-success p-1 me-2"
                    />
                  )}
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
                <Row>
                <Col md={6}>
                    <div className="grafico-container">
                    <h5>OLTs Uplink fora</h5>
                    <PieChart width={300} height={300}>
                        <Pie
                        data={prepararDadosGrafico().dadosOltStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        innerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        >
                        {prepararDadosGrafico().dadosOltStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#0C769E' : '#E97132'} /> // Verde para OK, Vermelho para NOK
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                        formatter={(value, entry) => (
                          <span>
                            {value}: <span style={{ fontSize: '18px', fontWeight: 'bold' }}> {entry.payload.value}</span>
                          </span>
                        )}
                        />
                    </PieChart>
                    </div>
                </Col>

                <Col md={6}>
                    <div className="grafico-container">
                    <h5>SLA dos TAs Ativos</h5>
                    <PieChart width={300} height={300}>
                        <Pie
                        data={prepararDadosGrafico().dadosTempoAfetacao}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        >
                        {prepararDadosGrafico().dadosTempoAfetacao.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#0C769E' : '#E97132'} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                        formatter={(value, entry) => (
                          <span>
                          {value}: <span style={{ fontSize: '18px', fontWeight: 'bold' }}> {entry.payload.value}</span>
                        </span>
                        )}
                        />
                    </PieChart>
                    </div>
                </Col>
                </Row>
            </Modal.Body>
            </Modal>


          {/* Modal Detalhes */}
          <Modal show={showDetalhesModal} onHide={() => setShowDetalhesModal(false)} size="lg" className="modal-detalhes">
          <Modal.Header closeButton>
            <div className="d-flex justify-content-between w-100 align-items-center">
              <Modal.Title className="m-0">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Detalhes da OLT Isolada - {oltDetalhada ? oltDetalhada.TA : "N/A"}
              </Modal.Title>
              <div className="d-flex align-items-center">
                {permissions.canEnviar && (
                  <WhatsAppSender
                    elementSelector=".modal-detalhes .modal-content"
                    fileName={`detalhes_ta_${oltDetalhada?.TA || 'desconhecida'}.png`}
                    caption={`Detalhes da TA ${oltDetalhada?.TA || ''} - ${formatarDataHoraAtual()}`}
                    variant="link"
                    className="text-success p-1 me-2"
                  />
                )}
              </div>
            </div>
          </Modal.Header>
            <Modal.Body>
                {oltDetalhada ? (
                <div>
                    <Row>
                    <Col md={6}>
                        <p><strong>TA:</strong> {oltDetalhada.TA || "N/A"}</p>
                        <p><strong>OLT:</strong> {oltDetalhada.OLT || "N/A"}</p>
                        <p><strong>Afetação:</strong> {oltDetalhada.AFETACAO || "N/A"}</p>
                        <p><strong>EPS:</strong> {oltDetalhada.EPS || "N/A"}</p>
                    </Col>
                    <Col md={6}>
                    <p><strong>Data de Criação:</strong> {new Date(oltDetalhada.DATA_CRIACAO).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || "N/A"}</p>
                        <p><strong>SLA:</strong> {oltDetalhada.SLA || "N/A"}</p>
                        <p><strong>Status:</strong> {oltDetalhada.STATUS || "N/A"}</p>
                    </Col>
                    </Row>
                    <Row>
                    <Col>
                        <h6 className="observacao-title"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Observação</h6>
                        <p className="descricao">{oltDetalhada.OBSERVACAO || "N/A"}</p>
                    </Col>
                    </Row>
                </div>
                ) : (
                <p>Nenhuma OLT Isolada selecionada.</p>
                )}
            </Modal.Body>
          </Modal>

          {/* Modal de Edição */}
          <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Editar OLT Isolada
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {oltEditando && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>TA</Form.Label>
                        <Form.Control
                            type="text"
                            value={oltEditando.TA}
                            readOnly
                            disabled
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>OLT</Form.Label>
                        <Select
                            options={olts.map((olt) => ({ value: olt.OLT, label: olt.OLT }))}
                            value={{ value: oltEditando.OLT, label: oltEditando.OLT }}
                            onChange={(selectedOption) =>
                            setOltEditando({ ...oltEditando, OLT: selectedOption.value })
                            }
                            placeholder="Selecione uma OLT"
                            isSearchable
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Afetação</Form.Label>
                        <Form.Control
                            type="number"
                            value={oltEditando.AFETACAO}
                            onChange={(e) => setOltEditando({ ...oltEditando, AFETACAO: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>EPS</Form.Label>
                        <Select
                            options={opcoesEPS}
                            value={{ value: oltEditando.EPS, label: oltEditando.EPS }}
                            onChange={(selectedOption) =>
                            setOltEditando({ ...oltEditando, EPS: selectedOption.value })
                            }
                            placeholder="Selecione um EPS"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Data de Criação</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={oltEditando.DATA_CRIACAO}
                            onChange={(e) => setOltEditando({ ...oltEditando, DATA_CRIACAO: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>SLA</Form.Label>
                        <Form.Control
                            type="time"
                            value={oltEditando.SLA}
                            onChange={(e) => setOltEditando({ ...oltEditando, SLA: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Select
                            options={opcoesStatus}
                            value={{ value: oltEditando.STATUS, label: oltEditando.STATUS }}
                            onChange={(selectedOption) =>
                            setOltEditando({ ...oltEditando, STATUS: selectedOption.value })
                            }
                            placeholder="Selecione um Status"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Observação</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={oltEditando.OBSERVACAO}
                            onChange={(e) => setOltEditando({ ...oltEditando, OBSERVACAO: e.target.value })}
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
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Salvar Alterações
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de Cadastro */}
          <Modal show={showNovoModal} onHide={() => { setShowNovoModal(false); limparFormulario(); }} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Cadastrar OLT Isolada
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>TA</Form.Label>
                      <Form.Control
                          type="text"
                          value={novaOltIsolada.TA}
                          onChange={(e) => setNovaOltIsolada({ ...novaOltIsolada, TA: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>OLT</Form.Label>
                      <Select
                          options={olts.map((olt) => ({ value: olt.OLT, label: olt.OLT }))}
                          value={{ value: novaOltIsolada.OLT, label: novaOltIsolada.OLT }}
                          onChange={(selectedOption) =>
                          setNovaOltIsolada({ ...novaOltIsolada, OLT: selectedOption.value })
                          }
                          placeholder="Selecione uma OLT"
                          isSearchable
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Afetação</Form.Label>
                      <Form.Control
                          type="number"
                          value={novaOltIsolada.AFETACAO}
                          onChange={(e) => setNovaOltIsolada({ ...novaOltIsolada, AFETACAO: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>EPS</Form.Label>
                      <Select
                          options={opcoesEPS}
                          value={{ value: novaOltIsolada.EPS, label: novaOltIsolada.EPS }}
                          onChange={(selectedOption) =>
                          setNovaOltIsolada({ ...novaOltIsolada, EPS: selectedOption.value })
                          }
                          placeholder="Selecione um EPS"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Data de Criação</Form.Label>
                      <Form.Control
                            type="datetime-local"
                            value={novaOltIsolada.DATA_CRIACAO}
                            onChange={(e) => setNovaOltIsolada({ ...novaOltIsolada, DATA_CRIACAO: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>SLA</Form.Label>
                      <Form.Control
                          type="time"
                          value={novaOltIsolada.SLA}
                          onChange={(e) => setNovaOltIsolada({ ...novaOltIsolada, SLA: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Select
                          options={opcoesStatus}
                          value={{ value: novaOltIsolada.STATUS, label: novaOltIsolada.STATUS }}
                          onChange={(selectedOption) =>
                          setNovaOltIsolada({ ...novaOltIsolada, STATUS: selectedOption.value })
                          }
                          placeholder="Selecione um Status"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Observação</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows={3}
                          value={novaOltIsolada.OBSERVACAO}
                          onChange={(e) => setNovaOltIsolada({ ...novaOltIsolada, OBSERVACAO: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => { setShowNovoModal(false); limparFormulario(); }}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCriarOltIsolada}>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Cadastrar
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      }
    />
  );
};

export default OltUplink;