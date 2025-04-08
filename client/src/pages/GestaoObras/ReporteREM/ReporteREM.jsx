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
  faDownload,
  faFileAlt,
  faStickyNote
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthValidation from '../../../hooks/useAuthValidation';
import Layout from "../../../components/Layout/Layout";
import TabelaPaginada from "../../../components/Table/TabelaPaginada";
import WhatsAppSender from "../../../components/WhatsAppSender/WhatsAppSender";
import Loading from '../../../components/Loading/Loading';
import CardEtapas from '../../../components/Cards/CardEtapas/CardEtapas';
import { registrarLog } from '../../../hooks/logs';
import './ReporteREM.css';

const ReporteREM = () => {
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    rem: '',
    idObra: '',
    municipio: '',
    cluster: '',
    contratada:'',
    etapa: ''
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState({
    REM: '',
    idObra: '',
    municipio: '',
    cluster: '',
    contratada: '',
    grupo: '',
    valor: '',
    criticidade: '',
    descricao: '',
    etapa: '',
    inicio: '',
    entrega: '',
    observacoes: '',
    lat: '',
    long: ''
  });
  const [consultaDetalhada, setConsultaDetalhada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [municipios, setMunicipios] = useState([]);
  const [olts, setOlts] = useState([]);
  const [novaConsulta, setNovaConsulta] = useState({
    REM: '',
    idObra: '',
    municipio: '',
    cluster: '',
    contratada: '',
    grupo: '',
    valor: '',
    criticidade: '',
    descricao: '',
    etapa: '',
    inicio: new Date().toISOString().slice(0, 16), // Formato yyyy-MM-ddThh:mm
    entrega: '',
    observacoes: '',
    lat: '',
    long: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const token = localStorage.getItem('token'); 

  // Validações: módulo 2 (Reporte REM), submodulo 1, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(2, 1, 1);

  useEffect(() => {
    const carregarConsultas = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar consultas');
        
        const data = await response.json();
        setConsultas(data);

        await registrarLog(
          token,
          'Consulta',
          'Gestão Obra - Reporte REM - Página carregada com sucesso'
        );
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
  
    carregarConsultas();
  }, []);

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

  useEffect(() => {
    const carregarMunicipios = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/municipios/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar municípios');
        
        const data = await response.json();
        setMunicipios(data.map(m => ({ 
          value: m.MUNICIPIO, 
          label: m.MUNICIPIO,
          lat: m.LAT,
          long: m.LNG 
        })));
      } catch (error) {
        console.error('Erro ao carregar municípios:', error);
      }
    };
  
    carregarMunicipios();
  }, []);

  const opcoesCriticidade = [
    { value: 'CRÍTICA', label: 'CRÍTICA' },
    { value: 'CRÍTICA - P0', label: 'CRÍTICA - P0' },
    { value: 'ALTA', label: 'ALTA' },
    { value: 'BAIXA', label: 'BAIXA' },
  ];
  
  const opcoesContratada = [
    { value: 'TEL', label: 'TEL' },
    { value: 'ICOMON', label: 'ICOMON' },
    { value: 'ABILITY', label: 'ABILITY' },
    { value: 'TELEMONT', label: 'TELEMONT' },
  ];
  
  const opcoesGrupo = [
    { value: 'ARTERIS', label: 'ARTERIS' },
    { value: 'CIA ENERGIA', label: 'CIA ENERGIA' },
    { value: 'DER', label: 'DER' },
    { value: 'EIXO', label: 'EIXO' },
    { value: 'EIXO A.J', label: 'EIXO AÇÃO JUDICIAL' },
    { value: 'ELEKTRO', label: 'ELEKTRO' },
    { value: 'FERROVIA', label: 'FERROVIA' },
    { value: 'FERROVIA - P.O.P', label: 'FERROVIA - P.O PAGO' },
    { value: 'MANUTENÇÃO', label: 'MANUTENÇÃO' },
    { value: 'PREFEITURA', label: 'PREFEITURA' },
    { value: 'PREFEITURA - P.O.P', label: 'PREFEITURA - P.O PAGO' },
    { value: 'RODOVIA', label: 'RODOVIA' },
    { value: 'RODOVIA_TIETE', label: 'RODOVIA TIETÊ' },
    { value: 'RODOVIA A.J', label: 'RODOVIA AÇÃO JUDICIAL' },
    { value: 'RUMO', label: 'RUMO' },
    { value: 'TERCEIROS', label: 'TERCEIROS' },
    { value: 'TERCEIROS - A.J', label: 'TERCEIROS - AÇÃO JUDICIAL' },
    { value: 'TERCEIROS - P.O.P', label: 'TERCEIROS - P.O PAGO ' },
    { value: 'VIA PAULISTA', label: 'VIA PAULISTA' },
    { value: 'VIA RONDON', label: 'VIA RONDON' },
    { value: 'VIVO', label: 'DEMANDA VIVO' }
];
  
  const opcoesCluster = [
    { value: 'JUNDIAI', label: 'JUNDIAI' },
    { value: 'CAMPINAS', label: 'CAMPINAS' },
    { value: 'INTERIOR', label: 'INTERIOR' },
    { value: 'OSASCO', label: 'OSASCO' },
    { value: 'SJC', label: 'SJC' },
    { value: 'PC_SC', label: 'PC_SC' },
  ];
  
  const opcoesEtapa = [
    { value: 'PENDENTE', label: 'PENDENTE' },
    { value: 'PRIORIZADA', label: 'PRIORIZADA' },
    { value: 'CANCELADA', label: 'CANCELADA' },
    { value: 'AVALIAÇÃO', label: 'AVALIAÇÃO' },
    { value: 'PROJETO', label: 'PROJETO' },
    { value: 'APROVACAO-CUSTO', label: 'APROVAÇÃO CUSTO' },
    { value: 'EXECUÇÃO', label: 'EXECUÇÃO' },
    { value: 'CONCLUÍDAS', label: 'CONCLUÍDAS' },
  ];
  
  

  const limparFormulario = () => {
    setNovaConsulta({
      REM: '',
      idObra: '',
      municipio: '',
      cluster: '',
      contratada: '',
      grupo: '',
      valor: '',
      criticidade: '',
      descricao: '',
      etapa: '',
      inicio: new Date().toISOString().slice(0, 16),
      entrega: '',
      observacoes: '',
      lat: '',
      long: ''
    });
  };

  const handleCriarConsulta = async () => {
    try {
      // Obter latitude e longitude do município selecionado
      const municipioSelecionado = municipios.find(opcao => opcao.value === novaConsulta.municipio);
      const latLong = {
        lat: municipioSelecionado?.lat || null,
        long: municipioSelecionado?.long || null,
      };
  
      const dadosParaEnviar = {
        ...novaConsulta,
        lat: latLong.lat,
        long: latLong.long,
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      });
  
      if (!response.ok) throw new Error('Erro ao cadastrar obra');
  
      await registrarLog(
        token,
        'Cadastrar',
        `Gestão Obra - Reporte REM - Nova obra cadastrada: ${novaConsulta.REM}`
      );
  
      const responseObras = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
      if (!responseObras.ok) throw new Error('Erro ao carregar obras');
  
      const obrasAtualizadas = await responseObras.json();
      setConsultas(obrasAtualizadas);
      setShowNovoModal(false);
      limparFormulario();
    } catch (error) {
      setErro(error.message);
    }
  };
  

  const formatDateTimeForInput = (datetime) => {
    if (!datetime) return ''; 
    return datetime.replace(' ', 'T').slice(0, 16); 
  };

  const formatarDataParaBackend = (data) => {
    if (!data) return null;
    return data.split('T')[0];
  };

  const handleSalvarEdicao = async () => {
    try {
      // Obter latitude e longitude do município selecionado
      const municipioSelecionado = municipios.find(opcao => opcao.value === consultaEditando.municipio);
      const latLong = {
        lat: municipioSelecionado?.lat || null,
        long: municipioSelecionado?.long || null,
      };
  
      const dadosFormatados = {
        ...consultaEditando,
        lat: latLong.lat,
        long: latLong.long,
        inicio: formatarDataParaBackend(consultaEditando.inicio),
        entrega: formatarDataParaBackend(consultaEditando.entrega),
      };
  
      if (!consultaEditando.REM) {
        throw new Error('REM não definido');
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/editar/${consultaEditando.REM}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosFormatados),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar edição');
      }
  
      await registrarLog(
        token,
        'Editar',
        `Gestão Obra - Reporte REM - Obra editada: ${consultaEditando.REM}`
      );
  
      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
      setConsultas(consultasAtualizadas);
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
    }
  };

const abrirModalEdicao = async (consulta) => {
    try {
        const rem = consulta.REM; // Extrai o REM da consulta
        const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar/${rem}`);
        
        if (!response.ok) throw new Error('Erro ao carregar consulta para edição');
        
        const dadosConsulta = await response.json();
        
        // Mapeamento dos campos
        setConsultaEditando({
            REM: dadosConsulta.REM,
            idObra: dadosConsulta.ID_OBRA,
            municipio: dadosConsulta.MUNICIPIO,
            cluster: dadosConsulta.CLUSTER,
            contratada: dadosConsulta.CONTRATADA,
            grupo: dadosConsulta.GRUPO,
            valor: dadosConsulta.VALOR,
            criticidade: dadosConsulta.CRITICIDADE,
            descricao: dadosConsulta.DESCRICAO,
            etapa: dadosConsulta.ETAPA,
            inicio: dadosConsulta.INICIO,
            entrega: dadosConsulta.ENTREGA,
            observacoes: dadosConsulta.OBSERVACOES,
            lat: dadosConsulta.LAT,
            long: dadosConsulta.LONG
        });
        
        setShowEditarModal(true);
    } catch (error) {
        setErro(error.message);
    }
};

const handleExcluirConsulta = async (rem) => {
    if (!window.confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/excluir/${rem}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir consulta');
        }

        await registrarLog(
          token,
          'Excluir',
          `Gestão Obra - Reporte REM - Obra excluída: ${rem}`
        );

        const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
        if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');

        const consultasAtualizadas = await responseConsultas.json();
        setConsultas(consultasAtualizadas);
    } catch (error) {
        setErro(error.message);
    }
};

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
      if (!response.ok) throw new Error('Erro ao carregar obras');
  
      const data = await response.json();
  
      if (data.length === 0) {
        alert('Nenhum dado disponível para download.');
        return;
      }

      await registrarLog(
        token,
        'Download',
        'Gestão Obra - Reporte REM - Download do CSV realizado'
      );
  
      const csv = Papa.unparse(data, {
        delimiter: ";",
        quotes: true,
        header: true,
        encoding: "UTF-8"
      });
  
      const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'obras.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      setErro(error.message);
    }
  };

  const consultasFiltradas = consultas.filter(consulta => {
    if (!consulta) return false;
  
    // Filtro por pesquisa geral
    if (filtro.pesquisa) {
      const campos = [
        consulta.REM ? String(consulta.REM) : '',
        consulta.ID_OBRA ? String(consulta.ID_OBRA) : '',
        consulta.MUNICIPIO ? String(consulta.MUNICIPIO) : '',
        consulta.CLUSTER ? String(consulta.CLUSTER) : '',
        consulta.CONTRATADA ? String(consulta.CONTRATADA) : '',
        consulta.GRUPO ? String(consulta.GRUPO) : '',
        consulta.VALOR ? String(consulta.VALOR) : '',
        consulta.CRITICIDADE ? String(consulta.CRITICIDADE) : '',
        consulta.DESCRICAO ? String(consulta.DESCRICAO) : '',
        consulta.ETAPA ? String(consulta.ETAPA) : '',
        consulta.PRAZO ? String(consulta.PRAZO) : '',
        consulta.INICIO ? String(consulta.INICIO) : '',
        consulta.ENTREGA ? String(consulta.ENTREGA) : '',
        consulta.OBSERVACOES ? String(consulta.OBSERVACOES) : '',
        consulta.LAT ? String(consulta.LAT) : '',
        consulta.LONG ? String(consulta.LONG) : ''
      ];
  
      const pesquisaMatch = campos.some(campo => 
        campo.toLowerCase().includes(filtro.pesquisa.toLowerCase())
      );
  
      if (!pesquisaMatch) return false;
    }
  
    // Restante dos filtros (REM, idObra, etc.)
    if (filtro.rem && consulta.REM !== filtro.rem) return false;
    if (filtro.idObra && consulta.ID_OBRA !== filtro.idObra) return false;
    if (filtro.municipio && consulta.MUNICIPIO !== filtro.municipio) return false;
    if (filtro.cluster && consulta.CLUSTER !== filtro.cluster) return false;
    if (filtro.contratada && consulta.CONTRATADA !== filtro.contratada) return false;
    if (filtro.etapa && consulta.ETAPA !== filtro.etapa) return false;
  
    return true;
  });


  const colunas = [
    { chave: 'REM', titulo: 'REM' },
    { chave: 'ID_OBRA', titulo: 'ID Obra' },
    { chave: 'MUNICIPIO', titulo: 'Município' },
    { chave: 'CLUSTER', titulo: 'Cluster' },
    { chave: 'CONTRATADA', titulo: 'Contratada' },
    { chave: 'GRUPO', titulo: 'Grupo' },
    // { chave: 'VALOR', titulo: 'Valor', formato: (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { chave: 'CRITICIDADE', titulo: 'Criticidade', formato: (valor) => (
        <Badge bg={
            valor === 'CRÍTICA' ? 'danger' :
            valor === 'CRÍTICA - P0' ? 'dark' :
            valor === 'ALTA' ? 'warning' :
            valor === 'BAIXA' ? 'success' :
            'secondary'
        }>
            {valor || "N/A"}
        </Badge>
    )},
    {
    chave: 'ETAPA',
    titulo: 'Etapa',
    formato: (valor) => {

        // Define a classe CSS com base na etapa
        const classeEtapa = valor ? `badge-etapa badge-etapa-${valor}` : 'badge-etapa';

        return (
        <div className={classeEtapa}>
            {valor === "APROVACAO-CUSTO" ? "APROV-CUSTO" : valor || "N/A"}
        </div>
        );
    }
    },
    { chave: 'PRAZO', titulo: 'Prazo' },
    { chave: 'ENTREGA', titulo: 'Entrega', formato: (valor) => new Date(valor).toLocaleDateString('pt-BR') },
    
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

  const abrirModalDetalhes = (item) => {
    setConsultaDetalhada(item);
    setShowDetalhesModal(true);
    
    // Registro de log para visualização de detalhes
    registrarLog(
      token,
      'Consulta',
      `Gestão Obra - Reporte REM - Detalhes visualizados: ${item.REM}`
    );
  };


  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Reporte REM"
      content={
        <Container fluid className="consulta-olt-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-3 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Pesquisar por REM e ID Obra"
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
          <Row className="mb-3 filtros-section">
            <Col md={3}>
              <Select
                options={opcoesEtapa}
                placeholder="Filtrar por etapa"
                isClearable
                onChange={(selectedOption) => 
                  setFiltro({...filtro, etapa: selectedOption ? selectedOption.value : ''})
                }
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100%',
                    minHeight: '38px'
                  })
                }}
              />
            </Col>

            <Col md={3}>
              <Select
                options={opcoesCluster}
                placeholder="Filtrar por cluster"
                isClearable
                onChange={(selectedOption) => 
                  setFiltro({...filtro, cluster: selectedOption ? selectedOption.value : ''})
                }
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100%',
                    minHeight: '38px'
                  })
                }}
              />
            </Col>

            <Col md={3}>
              <Select
                options={municipios}
                placeholder="Filtrar por município"
                isClearable
                onChange={(selectedOption) => 
                  setFiltro({...filtro, municipio: selectedOption ? selectedOption.value : ''})
                }
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100%',
                    minHeight: '38px'
                  })
                }}
              />
              </Col>

            <Col md={3}>
              <Select
                options={opcoesContratada}
                placeholder="Filtrar por contratada"
                isClearable
                onChange={(selectedOption) => 
                  setFiltro({...filtro, contratada: selectedOption ? selectedOption.value : ''})
                }
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100%',
                    minHeight: '38px'
                  })
                }}
              />
            </Col>
          </Row>
          <CardEtapas obras={consultasFiltradas} />
          
          <Row>
          <Col>
            <TabelaPaginada
              dados={consultasFiltradas}
              colunas={colunas}
              onEditar={abrirModalEdicao}
              onExcluir={(item) => handleExcluirConsulta(item.REM)}
              onDetalhes={abrirModalDetalhes}
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
              Detalhes da Obra - {consultaDetalhada ? consultaDetalhada.REM : "N/A"}
            </Modal.Title>
            <div className="d-flex align-items-center">
              {permissions.canEnviar && (
                <WhatsAppSender
                  elementSelector=".modal-detalhes .modal-content"
                  fileName={`detalhe_obra_${consultaDetalhada?.REM || 'desconhecida'}.png`}
                  caption={`Reporte REM - Detalhes da Obra: ${consultaDetalhada?.REM || 'N/A'} - Data: ${formatarDataHoraAtual()}`}
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
                    {/* Informações Gerais */}
                    <Row>
                    <Col md={6}>
                        <p><strong>REM:</strong> {consultaDetalhada.REM || "N/A"}</p>
                        <p><strong>ID Obra:</strong> {consultaDetalhada.ID_OBRA || "N/A"}</p>
                        <p><strong>Município:</strong> {consultaDetalhada.MUNICIPIO || "N/A"}</p>
                        <p><strong>Cluster:</strong> {consultaDetalhada.CLUSTER || "N/A"}</p>
                        <p><strong>Contratada:</strong> {consultaDetalhada.CONTRATADA || "N/A"}</p>
                        <p><strong>Grupo:</strong> {consultaDetalhada.GRUPO || "N/A"}</p>
                    </Col>
                    <Col md={6}>
                        <p><strong>Valor:</strong> {consultaDetalhada.VALOR ? `R$ ${consultaDetalhada.VALOR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "N/A"}</p>
                        <p><strong>Criticidade: </strong> 
                        <Badge bg={consultaDetalhada.CRITICIDADE === 'BAIXA' ? 'success' : consultaDetalhada.CRITICIDADE === 'CRÍTICA' ? 'danger' : 'secondary'}>
                            {consultaDetalhada.CRITICIDADE || "N/A"}
                        </Badge>
                        </p>
                        <p><strong>Etapa: </strong> 
                        <div className={`badge-etapa-detalhe badge-etapa-${consultaDetalhada.ETAPA}`}>
                            {consultaDetalhada.ETAPA || "N/A"}
                        </div>
                        </p>
                        <p><strong>Início:</strong> {consultaDetalhada.INICIO ? new Date(consultaDetalhada.INICIO).toLocaleDateString('pt-BR') : "N/A"}</p>
                        <p><strong>Entrega:</strong> {consultaDetalhada.ENTREGA ? new Date(consultaDetalhada.ENTREGA).toLocaleDateString('pt-BR') : "N/A"}</p>
                        <p><strong>Prazo (Dias):</strong> {consultaDetalhada.PRAZO || "N/A"}</p>
                    </Col>
                    </Row>

                    {/* Descrição e Observações */}
                    <Row className="mt-3">
                    <Col md={6}>
                        <h6 className='descricao-title'><FontAwesomeIcon icon={faFileAlt} className="me-2" /> Descrição</h6>
                        <p className="descricao">{consultaDetalhada.DESCRICAO || "N/A"}</p>
                    </Col>
                    <Col md={6}>
                        <h6 className='observacao-title'><FontAwesomeIcon icon={faStickyNote} className="me-2" /> Observações</h6>
                        <p className="descricao">{consultaDetalhada.OBSERVACOES || "N/A"}</p>
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
                Editar Obra
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {consultaEditando && (
                <Form>
                    <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>REM</Form.Label>
                        <Form.Control
                            value={consultaEditando.REM}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, REM: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>ID Obra</Form.Label>
                        <Form.Control
                            type="number"
                            value={consultaEditando.idObra}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, idObra: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Município</Form.Label>
                        <Select
                            options={municipios}
                            value={municipios.find(opcao => opcao.value === consultaEditando.municipio)}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, municipio: selectedOption.value })
                            }
                            placeholder="Selecione um município"
                            isSearchable
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Cluster</Form.Label>
                        <Select
                            options={opcoesCluster}
                            value={opcoesCluster.find(opcao => opcao.value === consultaEditando.cluster)}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, cluster: selectedOption.value })
                            }
                            placeholder="Selecione um cluster"
                            isSearchable
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Contratada</Form.Label>
                        <Select
                            options={opcoesContratada}
                            value={opcoesContratada.find(opcao => opcao.value === consultaEditando.contratada)}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, contratada: selectedOption.value })
                            }
                            placeholder="Selecione uma contratada"
                            isSearchable
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={consultaEditando.descricao}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, descricao: e.target.value })}
                        />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Grupo</Form.Label>
                        <Select
                            options={opcoesGrupo}
                            value={opcoesGrupo.find(opcao => opcao.value === consultaEditando.grupo)}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, grupo: selectedOption.value })
                            }
                            placeholder="Selecione um grupo"
                            isSearchable
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Valor</Form.Label>
                        <Form.Control
                            type="number"
                            value={consultaEditando.valor}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, valor: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Criticidade</Form.Label>
                        <Select
                            options={opcoesCriticidade}
                            value={opcoesCriticidade.find(opcao => opcao.value === consultaEditando.criticidade)}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, criticidade: selectedOption.value })
                            }
                            placeholder="Selecione uma criticidade"
                            isSearchable
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Etapa</Form.Label>
                        <Select
                            options={opcoesEtapa}
                            value={opcoesEtapa.find(opcao => opcao.value === consultaEditando.etapa)}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, etapa: selectedOption.value })
                            }
                            placeholder="Selecione uma etapa"
                            isSearchable
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Início</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={formatDateTimeForInput(consultaEditando.inicio)}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, inicio: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Entrega</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={formatDateTimeForInput(consultaEditando.entrega)}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, entrega: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={consultaEditando.observacoes}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, observacoes: e.target.value })}
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

          {/* Modal de cadastro */}
          <Modal show={showNovoModal} onHide={() => { setShowNovoModal(false); limparFormulario(); }} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Cadastrar Obra
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                <Row>
                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>REM</Form.Label>
                        <Form.Control
                        value={novaConsulta.REM}
                        onChange={(e) => setNovaConsulta({ ...novaConsulta, REM: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>ID Obra</Form.Label>
                        <Form.Control
                        type="number"
                        value={novaConsulta.idObra}
                        onChange={(e) => setNovaConsulta({ ...novaConsulta, idObra: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Município</Form.Label>
                      <Select
                        options={municipios}
                        value={municipios.find(opcao => opcao.value === novaConsulta.municipio)}
                        onChange={(selectedOption) =>
                          setNovaConsulta({ ...novaConsulta, municipio: selectedOption.value })
                        }
                        placeholder="Selecione um município"
                        isSearchable
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cluster</Form.Label>
                        <Select
                        options={opcoesCluster}
                        value={opcoesCluster.find(opcao => opcao.value === novaConsulta.cluster)}
                        onChange={(selectedOption) =>
                            setNovaConsulta({ ...novaConsulta, cluster: selectedOption.value })
                        }
                        placeholder="Selecione um cluster"
                        isSearchable
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Contratada</Form.Label>
                        <Select
                        options={opcoesContratada}
                        value={opcoesContratada.find(opcao => opcao.value === novaConsulta.contratada)}
                        onChange={(selectedOption) =>
                            setNovaConsulta({ ...novaConsulta, contratada: selectedOption.value })
                        }
                        placeholder="Selecione uma contratada"
                        isSearchable
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaConsulta.descricao}
                        onChange={(e) => setNovaConsulta({ ...novaConsulta, descricao: e.target.value })}
                        />
                    </Form.Group>
                    </Col>

                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Grupo</Form.Label>
                        <Select
                        options={opcoesGrupo}
                        value={opcoesGrupo.find(opcao => opcao.value === novaConsulta.grupo)}
                        onChange={(selectedOption) =>
                            setNovaConsulta({ ...novaConsulta, grupo: selectedOption.value })
                        }
                        placeholder="Selecione um grupo"
                        isSearchable
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Valor</Form.Label>
                        <Form.Control
                        type="number"
                        value={novaConsulta.valor}
                        onChange={(e) => setNovaConsulta({ ...novaConsulta, valor: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Criticidade</Form.Label>
                        <Select
                        options={opcoesCriticidade}
                        value={opcoesCriticidade.find(opcao => opcao.value === novaConsulta.criticidade)}
                        onChange={(selectedOption) =>
                            setNovaConsulta({ ...novaConsulta, criticidade: selectedOption.value })
                        }
                        placeholder="Selecione uma criticidade"
                        isSearchable
                        />
                    </Form.Group>

                   

                    <Form.Group className="mb-3">
                        <Form.Label>Etapa</Form.Label>
                        <Select
                        options={opcoesEtapa}
                        value={opcoesEtapa.find(opcao => opcao.value === novaConsulta.etapa)}
                        onChange={(selectedOption) =>
                            setNovaConsulta({ ...novaConsulta, etapa: selectedOption.value })
                        }
                        placeholder="Selecione uma etapa"
                        isSearchable
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Início</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={novaConsulta.inicio}
                            onChange={(e) => setNovaConsulta({ ...novaConsulta, inicio: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Entrega</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={novaConsulta.entrega}
                            onChange={(e) => setNovaConsulta({ ...novaConsulta, entrega: e.target.value })}
                        />
                        </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaConsulta.observacoes}
                        onChange={(e) => setNovaConsulta({ ...novaConsulta, observacoes: e.target.value })}
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
                <Button variant="primary" onClick={handleCriarConsulta}>
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

export default ReporteREM;