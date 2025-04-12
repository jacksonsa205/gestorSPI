import { useState, useEffect , useMemo} from 'react';
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
    faExclamationTriangle, 
    faCheckCircle, 
    faMap,
    faSearch,
    faTimesCircle,
    faDownload,
    faTable,
    faChartLine,
    faHardHat,
    faHouseSignal, 
    faClipboardCheck,
    faDatabase,
    faUsers,
    faChevronUp,
    faChevronDown
  } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Papa from 'papaparse';
import useAuthValidation from '../../../hooks/useAuthValidation';
import WhatsAppSender from "../../../components/WhatsAppSender/WhatsAppSender";
import BarChartComponent from '../../../components/Charts/BarChartComponent';
import CardExpansivo from '../../../components/Cards/CardExpansivo/CardExpansivo';
import Layout from "../../../components/Layout/Layout";
import TabelaPaginada from "../../../components/Table/TabelaPaginada";
import Loading from '../../../components/Loading/Loading';
import { registrarLog } from '../../../hooks/logs';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './OcorrenciasGV.css';

// Configuração das contratadas com cores específicas
const contratadasConfig = [
  { nome: 'TEL_PC_SC', cor: '#dc3545', label: 'TEL PC/SC' },
  { nome: 'TEL_JI', cor: '#E97132', label: 'TEL JI' },
  { nome: 'TELEMONT', cor: '#6c757d', label: 'TELEMONT' },
  { nome: 'TEL_INTERIOR', cor: '#FA7A6C', label: 'TEL INTERIOR' },
  { nome: 'ABILITY_SJ', cor: '#9900CC', label: 'ABILITY SJ' },
  { nome: 'ABILITY_OS', cor: '#0C769E', label: 'ABILITY OS' },
];

// Configuração de status com cores
const statusConfig = {
  'FECHADO': { cor: '#6c757d', label: 'FECHADO' },
  'ASSOCIADO': { cor: '#17a2b8', label: 'ASSOCIADO' },
  'IMPROCEDIDO': { cor: '#ffc107', label: 'IMPROCEDIDO' },
  'CANCELADO': { cor: '#dc3545', label: 'CANCELADO' },
  'ABERTO': { cor: '#28a745', label: 'ABERTO' }
};


const cardsOcorrenciasConfig = {
    TOTAL: {
      cor: '#4e54c8',
      label: 'Total de Ocorrências',
      icone: faDatabase,
      gradient: ['#4298f5', '#2b6cb0'],
      tipo: 'Ocorrências'
    },
    AFETACAO: {
      cor: '#dc3545',
      label: 'Afetação Total',
      icone: faUsers,
      gradient: ['#9f7aea', '#805ad5'],
      tipo: 'Afetacao'
    },
    PRIMARIAS: {
      cor: '#ffc107',
      label: 'Primárias',
      icone: faHouseSignal,
      gradient: ['#ff9a44', '#ff6e68'],
      tipo: 'Primarias'
    },
    FECHADO: {
      cor: '#6c757d',
      label: 'Fechado',
      icone: faCheckCircle,
      gradient: ['#6c757d', '#5a6268'],
      tipo: 'Fechado',
    },
    ASSOCIADO: {
      cor: '#17a2b8',
      label: 'Associado',
      icone: faClipboardCheck,
      gradient: ['#ffc107', '#e0a800'],
      tipo: 'Associado',
    },
    IMPROCEDIDO: {
      cor: '#ffc107',
      label: 'Improcedente',
      icone: faExclamationTriangle,
      gradient: ['#dc3545', '#c82333'],
      tipo: 'Improcedente',
    },
    CANCELADO: {
      cor: '#dc3545',
      label: 'Cancelado',
      icone: faTimesCircle,
      gradient: ['#868f96', '#596164'],
      tipo: 'Cancelado',
      
    },
    ABERTO: {
      cor: '#28a745',
      label: 'Aberto',
      icone: faHardHat,
      gradient: ['#28a745', '#218838'],
      tipo: 'Aberto',
      
    }
  };
  

const LegendaFixa = () => {
  return (
    <div className="leaflet-fixed-legend">
      <h5>Contratadas</h5>
      <div className="legend-items">
        {contratadasConfig.map((contratada) => (
          <div key={contratada.nome} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: contratada.cor }}></div>
            <span style={{ fontSize: '12px' }}>{contratada.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OcorrenciasGV = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    municipio: '',
    mes: '',
    status: '',
    at: '',
    causa: '',
    contratada: ''
  });
  const [mostrarConteudo, setMostrarConteudo] = useState(true);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [municipios, setMunicipios] = useState([]);
  const [ats, setAts] = useState([]);
  const [causas, setCausas] = useState([]);
  const [meses, setMeses] = useState([]);
  const [contratadas, setContratadas] = useState([]);
  const [showGraficoMensal, setShowGraficoMensal] = useState(true);
  const [ocorrenciaDetalhada, setOcorrenciaDetalhada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const token = localStorage.getItem('token');

  // Validações: módulo 3 (Núcleo Técnico), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(3, 9, 1);

  useEffect(() => {
    const carregarOcorrencias = async () => {
      try {
        await registrarLog(
          token,
          'Consulta',
          'Núcleo Técnico - Ocorrências GV - Página carregada'
        );

        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/ocorrencia-grande-vulto/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar ocorrências');
        
        const data = await response.json();
        setOcorrencias(data);
        
        // Extrai opções para filtros
        const municipiosUnicos = [...new Set(data.map(o => o.MUNICIPIO))]
          .filter(Boolean)
          .map(m => ({ value: m, label: m }));
        
        const atsUnicos = [...new Set(data.map(o => o.AT))]
          .filter(Boolean)
          .map(at => ({ value: at, label: at }));
        
        const causasUnicas = [...new Set(data.map(o => o.CAUSA))]
          .filter(Boolean)
          .map(c => ({ value: c, label: c }));
        
        const mesesUnicos = [...new Set(data.map(o => o.MES))]
          .filter(Boolean)
          .map(m => ({ value: m, label: m }));

        const contratadasUnicas = [...new Set(data.map(o => o.CONTRATADA))]
          .filter(Boolean)
          .map(c => ({ 
            value: c, 
            label: contratadasConfig.find(ct => ct.nome === c)?.label || c 
          }));
        
        setMunicipios(municipiosUnicos);
        setAts(atsUnicos);
        setCausas(causasUnicas);
        setMeses(mesesUnicos);
        setContratadas(contratadasUnicas); 
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
  
    carregarOcorrencias();
  }, []);

  const toggleConteudo = () => {
    setMostrarConteudo(!mostrarConteudo);
  };

  const handleDownloadCSV = async () => {
    try {
      const csvData = ocorrenciasFiltradas.map(oc => ({
        OCORRENCIA: oc.OCORRENCIA,
        MUNICIPIO: oc.MUNICIPIO,
        DATA_OCORRENCIA: oc.DATA_OCORRENCIA,
        MES: oc.MES,
        AT: oc.AT,
        CONTRATADA: oc.CONTRATADA,
        CABO: oc.CABO,
        CAUSA: oc.CAUSA,
        STATUS: oc.STATUS,
        QTD_PRIMARIAS: oc['QTD PRIMARIAS'],
        AFETACAO: oc.AFETACAO,
        LAT: oc.LAT,
        LNG: oc.LNG
      }));

      const csv = Papa.unparse(csvData, {
        delimiter: ";",
        quotes: true,
        header: true,
        encoding: "UTF-8"
      });

      const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ocorrencias_gv.csv';
      link.click();
      URL.revokeObjectURL(link.href);

      await registrarLog(
        token,
        'Download',
        'Núcleo Técnico - Ocorrências GV - CSV baixado'
      );
    } catch (error) {
      setErro(error.message);
    }
  };

  const abrirModalDetalhes = (ocorrencia) => {
    setOcorrenciaDetalhada(ocorrencia);
    setShowDetalhesModal(true);
  };

  const ocorrenciasFiltradas = ocorrencias.filter(ocorrencia => {
    if (!ocorrencia) return false;
    
    // Filtro por pesquisa geral
    if (filtro.pesquisa) {
      const campos = [
        ocorrencia.OCORRENCIA?.toString() || '',
        ocorrencia.MUNICIPIO || '',
        ocorrencia.CONTRATADA || '',
        ocorrencia.CABO || '',
        ocorrencia.CAUSA || '',
        ocorrencia.STATUS || ''
      ];
    
      const pesquisaMatch = campos.some(campo => 
        campo.toLowerCase().includes(filtro.pesquisa.toLowerCase())
      );
    
      if (!pesquisaMatch) return false;
    }
  
    // Filtros específicos
    if (filtro.municipio && ocorrencia.MUNICIPIO !== filtro.municipio) return false;
    if (filtro.mes && ocorrencia.MES !== filtro.mes) return false;
    if (filtro.status && ocorrencia.STATUS !== filtro.status) return false;
    if (filtro.at && ocorrencia.AT !== filtro.at) return false;
    if (filtro.causa && ocorrencia.CAUSA !== filtro.causa) return false;
    if (filtro.contratada && ocorrencia.CONTRATADA !== filtro.contratada) return false; // Adicione esta linha
    
    return true;
  });

  // Agrupa ocorrências por localização para o mapa
  const agruparOcorrenciasPorLocalizacao = () => {
    const grupos = {};
    
    ocorrenciasFiltradas.forEach(ocorrencia => {
      if (!ocorrencia || !ocorrencia.LAT || !ocorrencia.LNG) return;
      
      const chave = `${ocorrencia.LAT},${ocorrencia.LNG}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          lat: ocorrencia.LAT,
          lng: ocorrencia.LNG,
          ocorrencias: [],
          contratadas: {}
        };
      }
      
      grupos[chave].ocorrencias.push(ocorrencia);
      
      // Conta por contratada
      if (!grupos[chave].contratadas[ocorrencia.CONTRATADA]) {
        grupos[chave].contratadas[ocorrencia.CONTRATADA] = 0;
      }
      grupos[chave].contratadas[ocorrencia.CONTRATADA]++;
    });
    
    return grupos;
  };

  const colunas = [
    { chave: 'OCORRENCIA', titulo: 'Ocorrência', formato: (valor) => <Badge bg="secondary">{valor || "N/A"}</Badge> },
    { chave: 'MUNICIPIO', titulo: 'Município' },
    { 
      chave: 'DATA_OCORRENCIA', 
      titulo: 'Data Ocorrência', 
      formato: (valor) => new Date(valor).toLocaleString() 
    },
    { chave: 'AT', titulo: 'AT' },
    { chave: 'CONTRATADA', titulo: 'Contratada' },
    { 
        chave: 'STATUS',
        titulo: 'Status',
        formato: (valor) => (
          <Badge bg={
            valor === 'ATIVO' ? 'success' : 
            valor === 'ASSOCIADO' ? 'warning' : 
            valor === 'IMPROCEDIDO' ? 'danger' :
            valor === 'CANCELADO' ? 'dark' :
            'secondary'
          }>
            {valor || "N/A"}
          </Badge>
        )
    },
    { chave: 'QTD PRIMARIAS', titulo: 'Primárias' },
    { chave: 'AFETACAO', titulo: 'Afetação' },
  ];

  const criarIcone = (cor, quantidade) => {
    const tamanho = Math.min(20 + Math.sqrt(quantidade) * 5, 40);
    
    return L.divIcon({
      className: 'custom-icon',
      iconSize: [tamanho, tamanho],
      html: `
        <div style="
          background: ${cor}; 
          width: ${tamanho}px; 
          height: ${tamanho}px; 
          border-radius: 50%; 
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.max(tamanho/3, 10)}px;
        ">
          ${quantidade}
        </div>
      `
    });
  };

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

// Estatísticas para os cards de ocorrências
const estatisticasOcorrencias = useMemo(() => {
  const totalOcorrencias = ocorrenciasFiltradas.length;
  
  // Calcula totais por contratada
  const porContratada = ocorrenciasFiltradas.reduce((acc, ocorrencia) => {
    const contratada = ocorrencia.CONTRATADA || 'Sem Contratada';
    
    if (!acc[contratada]) {
      acc[contratada] = {
        total: 0,
        afetacao: 0,
        primarias: 0,
        status: {
          FECHADO: 0,
          ASSOCIADO: 0,
          IMPROCEDIDO: 0,
          CANCELADO: 0,
          ABERTO: 0
        }
      };
    }
    
    acc[contratada].total++;
    acc[contratada].afetacao += parseFloat(ocorrencia.AFETACAO) || 0;
    acc[contratada].primarias += parseInt(ocorrencia['QTD PRIMARIAS']) || 0;
    
    if (ocorrencia.STATUS && acc[contratada].status[ocorrencia.STATUS] !== undefined) {
      acc[contratada].status[ocorrencia.STATUS]++;
    }
    
    return acc;
  }, {});

  // Calcula totais gerais
  const afetacaoTotal = Object.values(porContratada).reduce((sum, item) => sum + item.afetacao, 0);
  const primariasTotal = Object.values(porContratada).reduce((sum, item) => sum + item.primarias, 0);
  
  // Prepara dados para os cards
  const contratadasData = Object.entries(porContratada).map(([nome, dados]) => ({
    nome,
    total: dados.total,
    afetacao: dados.afetacao,
    primarias: dados.primarias,
    status: Object.entries(dados.status).map(([statusNome, qtd]) => ({
      nome: statusNome,
      quantidade: qtd
    }))
  }));

  // Calcula totais por status
  const statusTotais = {
    FECHADO: 0,
    ASSOCIADO: 0,
    IMPROCEDIDO: 0,
    CANCELADO: 0,
    ABERTO: 0
  };

  ocorrenciasFiltradas.forEach(ocorrencia => {
    if (ocorrencia.STATUS && statusTotais[ocorrencia.STATUS] !== undefined) {
      statusTotais[ocorrencia.STATUS]++;
    }
  });

  return {
    total: totalOcorrencias,
    afetacao: afetacaoTotal,
    primarias: primariasTotal,
    contratadas: contratadasData,
    status: Object.entries(statusTotais).map(([nome, quantidade]) => ({
      nome,
      quantidade
    }))
  };
}, [ocorrenciasFiltradas]);


// Processar dados para o gráfico mensal
const processarDadosGraficoMensal = useMemo(() => {
    const contagemPorMes = ocorrenciasFiltradas.reduce((acc, ocorrencia) => {
      const mes = ocorrencia.MES;
      if (mes) {
        acc[mes] = (acc[mes] || 0) + 1;
      }
      return acc;
    }, {});
  
    return Object.entries(contagemPorMes).map(([mes, quantidade]) => ({
      name: mes,
      value: quantidade
    })).sort((a, b) => {
      // Ordena os meses cronologicamente (assumindo formato "MM/YYYY")
      const [mesA, anoA] = a.name.split('/');
      const [mesB, anoB] = b.name.split('/');
      return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
    });
  }, [ocorrenciasFiltradas]);

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página.</div>;
  }

  return (
    <Layout
      title="Ocorrências Grande Vulto"
      content={
        <Container fluid className="ocorrencias-gv-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-3 align-items-center">
            <Col>
                <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    {mostrarConteudo ? 'Lista de Ocorrências' : 'Mapa das Ocorrências'} 
                </h5>
                <div className="d-flex align-items-center gap-2">
                    {!mostrarConteudo && permissions.canEnviar && (
                    <WhatsAppSender
                        elementSelector=".leaflet-container"
                        fileName={`mapa_ocorrencias_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
                        caption={`Mapa de Ocorrências Grande Vulto - ${formatarDataHoraAtual()}`}
                        className="botao-whatsapp d-flex align-items-center justify-content-center"
                        variant="success"
                    />
                    )}
                    <Button 
                    variant="secondary" 
                    onClick={toggleConteudo}
                    className="d-flex align-items-center"
                    >
                    <FontAwesomeIcon 
                        icon={mostrarConteudo ? faMap : faTable} 
                        className="me-2" 
                    />
                    {mostrarConteudo ? 'Mostrar Mapa' : 'Mostrar Tabela'} 
                    </Button>
                </div>
                </div>
            </Col>
          </Row>

          {mostrarConteudo ? (
            <>
              <Row className="mb-4 filtros-section">
                <Col md={8}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Pesquisar ocorrências"
                      value={filtro.pesquisa}
                      onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                    />
                  </InputGroup>
                </Col>
                <Col md={4} className="d-flex justify-content-end">
                  <Button variant="success" onClick={handleDownloadCSV}>
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Baixar CSV
                  </Button>
                </Col>
              </Row>

              <Row className="mb-3 filtros-section">
                <Col md={2}>
                  <Select
                    options={meses}
                    placeholder="Mês"
                    isClearable
                    onChange={(selected) => 
                      setFiltro({...filtro, mes: selected ? selected.value : ''})
                    }
                  />
                </Col>
                <Col md={2}>
                  <Select
                    options={Object.entries(statusConfig).map(([value, config]) => ({
                      value,
                      label: config.label
                    }))}
                    placeholder="Status"
                    isClearable
                    onChange={(selected) => 
                      setFiltro({...filtro, status: selected ? selected.value : ''})
                    }
                  />
                </Col>
                <Col md={2}>
                    <Select
                    options={contratadas}
                    placeholder="Contratada"
                    isClearable
                    onChange={(selected) => 
                        setFiltro({...filtro, contratada: selected ? selected.value : ''})
                    }
                    />
                </Col>
                <Col md={2}>
                  <Select
                    options={municipios}
                    placeholder="Município"
                    isClearable
                    onChange={(selected) => 
                      setFiltro({...filtro, municipio: selected ? selected.value : ''})
                    }
                  />
                </Col>
                <Col md={2}>
                  <Select
                    options={ats}
                    placeholder="AT"
                    isClearable
                    onChange={(selected) => 
                      setFiltro({...filtro, at: selected ? selected.value : ''})
                    }
                  />
                </Col>
                <Col md={2}>
                  <Select
                    options={causas}
                    placeholder="Causa"
                    isClearable
                    onChange={(selected) => 
                      setFiltro({...filtro, causa: selected ? selected.value : ''})
                    }
                  />
                </Col>
              </Row>

              <Container className="mt-4">
                <Row className="custom-cards-row">
                    {/* Card Total de Ocorrências */}
                    <CardExpansivo 
                    etapa={cardsOcorrenciasConfig.TOTAL.tipo}
                    titulo={cardsOcorrenciasConfig.TOTAL.label}
                    icone={cardsOcorrenciasConfig.TOTAL.icone}
                    total={estatisticasOcorrencias.total}
                    contratos={estatisticasOcorrencias.contratadas.map(c => ({
                        nome: c.nome,
                        quantidade: c.total
                    }))}
                    gradient={cardsOcorrenciasConfig.TOTAL.gradient}
                    />

                    {/* Card Afetação */}
                    <CardExpansivo 
                    etapa={cardsOcorrenciasConfig.AFETACAO.tipo}
                    titulo={cardsOcorrenciasConfig.AFETACAO.label}
                    icone={cardsOcorrenciasConfig.AFETACAO.icone}
                    total={estatisticasOcorrencias.afetacao}
                    contratos={estatisticasOcorrencias.contratadas.map(c => ({
                        nome: c.nome,
                        quantidade: c.afetacao
                    }))}
                    gradient={cardsOcorrenciasConfig.AFETACAO.gradient}
                    />

                    {/* Card Primárias */}
                    <CardExpansivo 
                    etapa={cardsOcorrenciasConfig.PRIMARIAS.tipo}
                    titulo={cardsOcorrenciasConfig.PRIMARIAS.label}
                    icone={cardsOcorrenciasConfig.PRIMARIAS.icone}
                    total={estatisticasOcorrencias.primarias}
                    contratos={estatisticasOcorrencias.contratadas.map(c => ({
                        nome: c.nome,
                        quantidade: c.primarias
                    }))}
                    gradient={cardsOcorrenciasConfig.PRIMARIAS.gradient}
                    />

                    {/* Cards por Status */}
                    {estatisticasOcorrencias.status.map((status, index) => {
                    const statusKey = status.nome.toUpperCase();
                    const config = cardsOcorrenciasConfig[statusKey];
                    
                    if (!config) return null;
                    
                    return (
                        <CardExpansivo 
                        key={index}
                        etapa={config.tipo}
                        titulo={config.label}
                        icone={config.icone}
                        total={status.quantidade}
                        contratos={estatisticasOcorrencias.contratadas.map(c => ({
                            nome: c.nome,
                            quantidade: c.status.find(s => s.nome === status.nome)?.quantidade || 0
                        }))}
                        gradient={config.gradient}
                        />
                    );
                    })}
                </Row>
                </Container>

                {/* Seção do Gráfico Mensal */}
                <div className="container-subtitle d-flex align-items-center justify-content-between w-100 p-3 position-relative">
                <div className="d-flex align-items-center">
                    <h5 className="resumo-obras-title mb-0">Evolução Mensal das Ocorrências Grande Vulto</h5>
                </div>
                <div className="d-flex align-items-center gap-2">
                    {permissions.canEnviar && (
                    <WhatsAppSender
                        elementSelector=".grafico-mensal-container"
                        fileName={`grafico_ocorrencias_mensal_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
                        caption={`Evolução Mensal de Ocorrências - ${formatarDataHoraAtual()}`}
                        className="botao-whatsapp d-flex align-items-center justify-content-center"
                        variant="success"
                    />
                    )}
                    <button
                    onClick={() => setShowGraficoMensal(!showGraficoMensal)}
                    className="botao-toggle d-flex align-items-center justify-content-center"
                    >
                    <FontAwesomeIcon
                        icon={showGraficoMensal ? faChevronUp : faChevronDown}
                        size="sm"
                        className="text-white"
                    />
                    </button>
                </div>
                </div>

                {/* Container do gráfico */}
                <Container fluid className="grafico-mensal-container mt-2 mb-4">
                {showGraficoMensal && (
                    <Row>
                    <Col>
                        <BarChartComponent 
                        data={processarDadosGraficoMensal}
                        title="Total de Ocorrências Grande Vulto por Mês"
                        colors={['#4298f5', '#2b6cb0']}
                        height={400}
                        />
                    </Col>
                    </Row>
                )}
                </Container>

              <Row>
                <Col>
                  <TabelaPaginada
                    dados={ocorrenciasFiltradas}
                    colunas={colunas}
                    onDetalhes={(item) => {
                      setOcorrenciaDetalhada(item);
                      setShowDetalhesModal(true);
                    }}
                    permissoes={permissions}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <MapContainer 
              center={[-22.91527126881271, -47.073432593365936]} 
              zoom={7} 
              style={{ height: '600px', width: '100%', position: 'relative' }}
            >
              <LayersControl position="topright">
                {/* Camadas base */}
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                </LayersControl.BaseLayer>
                
                <LayersControl.BaseLayer name="Satélite">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  />
                </LayersControl.BaseLayer>
                
                {/* Camadas por contratada */}
                {contratadasConfig.map(contratada => (
                  <LayersControl.Overlay 
                    key={contratada.nome} 
                    name={contratada.label} 
                    checked={true}
                  >
                    <LayerGroup>
                      {Object.entries(agruparOcorrenciasPorLocalizacao())
                        .filter(([_, grupo]) => grupo.contratadas[contratada.nome])
                        .map(([chave, grupo]) => (
                          <Marker
                            key={`${chave}-${contratada.nome}`}
                            position={[grupo.lat, grupo.lng]}
                            icon={criarIcone(contratada.cor, grupo.contratadas[contratada.nome])}
                          >
                            <Popup >
                              <div className="popup-container">
                                <div className="popup-header">
                                  <h3 className="popup-title">{grupo.ocorrencias[0].MUNICIPIO} - {contratada.label} - OC: {grupo.ocorrencias.length}</h3>
                                </div>
                                
                                <div className="popup-body">
                                  <table className="popup-table-ocorrencias-grande-vulto">
                                    <thead>
                                      <tr>
                                        <th>Ocorrência</th>
                                        <th>Status</th>
                                        <th>Primárias</th>
                                        <th>Afetação</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {grupo.ocorrencias
                                        .filter(oc => oc.CONTRATADA === contratada.nome)
                                        .map((ocorrencia, index) => (
                                          <tr key={index}>
                                            <td>{ocorrencia.OCORRENCIA}</td>
                                            <td>
                                            <Badge
                                                bg={
                                                    ocorrencia.STATUS === 'FECHADO' ? 'secondary' :
                                                    ocorrencia.STATUS === 'ASSOCIADO' ? 'warning' :
                                                    ocorrencia.STATUS === 'IMPROCEDIDO' ? 'danger' :
                                                    ocorrencia.STATUS === 'CANCELADO' ? 'dark' :
                                                    ocorrencia.STATUS === 'ABERTO' ? 'success' :
                                                    'light'
                                                }
                                                className="ms-2"
                                                >
                                                {statusConfig[ocorrencia.STATUS]?.label || ocorrencia.STATUS || "N/A"}
                                            </Badge>
                                            </td>
                                            <td>{ocorrencia['QTD PRIMARIAS'] || '0'}</td>
                                            <td>{ocorrencia.AFETACAO || '0'}</td>
                                          </tr>
                                        ))
                                      }
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))
                      }
                    </LayerGroup>
                  </LayersControl.Overlay>
                ))}
                
                <LegendaFixa />
              </LayersControl>
            </MapContainer>
          )}

          {/* Modal de Detalhes */}
          <Modal show={showDetalhesModal} onHide={() => setShowDetalhesModal(false)} size="lg" className="modal-detalhes">
            <Modal.Header closeButton className="border-0">
                <div className="d-flex justify-content-between w-100 align-items-center rounded" style={{ borderColor: '#dc3545', backgroundColor: '#dc3545' }}>
                <div className="p-2">
                    <Modal.Title className="m-0 text-white">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    NT-SPI 🚨 Ocorrência Grande Vulto 🚨 - {ocorrenciaDetalhada ? ocorrenciaDetalhada.OCORRENCIA : "N/A"}
                    </Modal.Title>
                </div>
                <div className="d-flex align-items-center">
                    {permissions.canEnviar && (
                    <WhatsAppSender
                        elementSelector=".modal-detalhes .modal-content"
                        fileName={`detalhe_ocorrencia_${ocorrenciaDetalhada?.OCORRENCIA || 'desconhecido'}.png`}
                        caption={`Ocorrência Grande Vulto - Detalhes: ${ocorrenciaDetalhada?.OCORRENCIA || 'N/A'} - Data: ${formatarDataHoraAtual()}`}
                        variant="link"
                        className="text-white p-1 me-2"
                    />
                    )}
                </div>
                </div>
            </Modal.Header>
            <Modal.Body>
                {ocorrenciaDetalhada ? (
                <div className="table-responsive">
                    <table className="table-detalhe-ocorrencias-grande-vulto">
                    <thead>
                        <tr>
                        <th>Descrição</th>
                        <th>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td><strong>Ocorrência</strong></td>
                        <td>{ocorrenciaDetalhada.OCORRENCIA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Município</strong></td>
                        <td>{ocorrenciaDetalhada.MUNICIPIO || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Data</strong></td>
                        <td>{new Date(ocorrenciaDetalhada.DATA_OCORRENCIA).toLocaleString() || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>AT</strong></td>
                        <td>{ocorrenciaDetalhada.AT || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Contratada</strong></td>
                        <td>{ocorrenciaDetalhada.CONTRATADA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Cabo</strong></td>
                        <td>{ocorrenciaDetalhada.CABO || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Status</strong></td>
                        <td>
                            <Badge 
                            bg={
                                ocorrenciaDetalhada.STATUS === 'FECHADO' ? 'secondary' : 
                                ocorrenciaDetalhada.STATUS === 'ASSOCIADO' ? 'warning' : 
                                ocorrenciaDetalhada.STATUS === 'IMPROCEDIDO' ? 'danger' :
                                ocorrenciaDetalhada.STATUS === 'CANCELADO' ? 'dark' :
                                ocorrenciaDetalhada.STATUS === 'ABERTO' ? 'success' :
                                'light'
                            }
                            className="ms-2"
                            >
                            {ocorrenciaDetalhada.STATUS || "N/A"}
                            </Badge>
                        </td>
                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faExclamationTriangle} className="causa-title me-2" />Causa</strong></td>
                        <td>{ocorrenciaDetalhada.CAUSA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faChartLine} className="descricao-title me-2" />Qtd. Primárias</strong></td>
                        <td>{ocorrenciaDetalhada['QTD PRIMARIAS'] || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faUsers} className="descricao-title me-2" />Clientes Afetados</strong></td>
                        <td>{ocorrenciaDetalhada.AFETACAO || "N/A"}</td>
                        </tr>
                        
                    </tbody>
                    </table>
                </div>
                ) : (
                <p>Nenhuma ocorrência selecionada.</p>
                )}
            </Modal.Body>
            </Modal>
        </Container>
      }
    />
  );
};

export default OcorrenciasGV;