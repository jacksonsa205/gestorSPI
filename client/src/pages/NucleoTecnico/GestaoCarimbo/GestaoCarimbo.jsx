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
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  faSearch,
  faEdit,
  faPlus,
  faSave,
  faExclamationTriangle,
  faCheckCircle,
  faDownload,
  faChartLine,
  faSyncAlt,
  faMap,
  faTable,
  faClock,
  faTimesCircle,
  faClipboardCheck,
  faDraftingCompass,
  faFileInvoiceDollar,
  faHardHat,
  faArrowDown,
  faArrowUp
 
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthValidation from '../../../hooks/useAuthValidation';
import Layout from "../../../components/Layout/Layout";
import TabelaPaginada from "../../../components/Table/TabelaPaginada";
import WhatsAppSender from "../../../components/WhatsAppSender/WhatsAppSender";
import Loading from '../../../components/Loading/Loading';
import { registrarLog } from '../../../hooks/logs';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import { LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './GestaoCarimbo.css';


const tipoConfig = [
  { tipo: 'DWDM', cor: '#dc3545', label: 'DWDM', icone: faClock, gradient: ['#ff758c', '#ff7eb3'] },
  { tipo: 'OLT UPLINK', cor: '#E97132', label: 'OLT UPLINK', icone: faExclamationTriangle, gradient: ['#ff9a44', '#ff6e68'] },
  { tipo: 'OLT ISOLADA', cor: '#6c757d', label: 'OLT ISOLADA', icone: faTimesCircle, gradient: ['#868f96', '#596164'] },
  { tipo: 'HL4', cor: '#FA7A6C', label: 'HL4', icone: faClipboardCheck, gradient: ['#ff6b6b', '#ff8787'] },
  { tipo: 'METRO', cor: '#9900CC', label: 'METRO', icone: faDraftingCompass, gradient: ['#9f7aea', '#805ad5'] },
  { tipo: 'MÓVEL', cor: '#0C769E', label: 'MÓVEL', icone: faFileInvoiceDollar, gradient: ['#4298f5', '#2b6cb0'] },
  { tipo: 'B2B AVANÇADO', cor: '#00B050', label: 'B2B AVANÇADO', icone: faHardHat, gradient: ['#48bb78', '#38a169'] },
  { tipo: 'INFRA', cor: '#0066FF', label: 'INFRA', icone: faCheckCircle, gradient: ['#4298f5', '#3182ce'] },
];

const GestaoCarimbo = () => {
  const [carimbos, setCarimbos] = useState([]);
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    ta: '',
    hostname: '',
    localidade: '',
    status: '',
    tipos: '',
    aliada: ''
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [carimboEditando, setCarimboEditando] = useState(null);
  const [carimboDetalhado, setCarimboDetalhado] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [mostrarConteudo, setMostrarConteudo] = useState(true);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [ordemDataAsc, setOrdemDataAsc] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [cadastrando, setCadastrando] = useState(false);
  const [municipios, setMunicipios] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const token = localStorage.getItem('token');

  // Validações: módulo 3 (Núcleo Técnico), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(3, 8, 1);

    // Opções para selects
  const opcoesTipos = [
    "DWDM", "OLT UPLINK", "OLT ISOLADA", "HL4", "METRO", "MÓVEL", "B2B AVANÇADO","INFRA","BBN","DRACO"
  ].map(item => ({ value: item, label: item }));

  const opcoesStatus = [
    "ATIVO", "PRE BAIXA", "FECHADO"
  ].map(item => ({ value: item, label: item }));

  const opcoesAliada = [
    "ABILITY", "TEL", "TEL-REDE", "ICOMON", "BL N2", "CO", "NOC",
    "SWAP",
    "NOC COMUNICAÇÃO",
    "REDE CAPITAL",
    "N1 CAPITAL",
    "REDE SUDESTE",
    "N1 SUDESTE",
    "OPERAÇÃO BACKBONE N2",
    "SOBRESSALENTES (AMERINODE)",
    "SOBRESSALENTES (COM O FORNECEDOR)",
    "OPERAÇÃO BANDA LARGA",
    "OPERAÇÃO DWDM",
    "OPERAÇÃO REDE IP",
    "OPERAÇÃO MÓVEL BACKHAUL (METRO BAIXA) CERTIFICAÇÃO DRACO",
    "OPERAÇÃO REDE IP"
  ].map(item => ({ value: item, label: item }));

  const opcoesAbordagem = [
    "DUPLA", "FLAT", "DW"
  ].map(item => ({ value: item, label: item }));

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
          lng: m.LNG 
        })));
      } catch (error) {
        console.error('Erro ao carregar municípios:', error);
      }
    };
  
    carregarMunicipios();
  }, []);

  useEffect(() => {
    const carregarCarimbos = async () => {
      try {
        await registrarLog(
          token,
          'Consulta',
          'Núcleo Técnico - Gestão de Carimbos - Página carregada com sucesso'
        );

        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar carimbos');
        
        
        const data = await response.json();
        setCarimbos(data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
  
    carregarCarimbos();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const carregarCarimbos = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
          if (!response.ok) throw new Error('Erro ao carregar carimbos');
          
          const data = await response.json();
          setCarimbos(data);
        } catch (error) {
          setErro(error.message);
        }
      };
      
      carregarCarimbos();
    }, 60000); // 60.000ms = 1 minuto
  
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, []);


  const limparFormulario = () => {
    setNovaCarimbo({
      ta: '',
      taRaiz: '',
      tipos: '',
      localidade: '',
      hostname: '',
      rota: '',
      dataCriacao: new Date().toISOString().split('T')[0],
      status: '',
      aliada: '',
      escanolamento: '',
      fabricante: '',
      risco: '',
      afetacao: '',
      abordagem: '',
      condominio: '',
      causa: '',
      solucao: '',
      medicoes: '',
      atualizacao: ''
    });
  };

  const [novaCarimbo, setNovaCarimbo] = useState({
    ta: '',
    taRaiz: '',
    tipos: '',
    localidade: '', // Adicione esta linha
    hostname: '',
    rota: '',
    dataCriacao: new Date().toISOString().split('T')[0],
    status: '',
    aliada: '',
    fabricante: '',
    risco: '',
    afetacao: '',
    abordagem: '',
    condominio: '',
    causa: '',
    solucao: '',
    medicoes: '',
    atualizacao: ''
  });

  const handleCriarCarimbo = async () => {
    setCadastrando(true);
    try {
      const taDigitada = novaCarimbo.ta;
  
      const taJaExiste = carimbos.some(c => String(c.TA) === String(taDigitada));
      if (taJaExiste) {
        setErro(`A TA ${taDigitada} já está cadastrada.`);
        setCadastrando(false);
        return;
      }
  
      const municipioSelecionado = municipios.find(m => m.value === novaCarimbo.localidade);
  
      const carimboCompleto = {
        ...novaCarimbo,
        lat: municipioSelecionado?.lat || null,
        lng: municipioSelecionado?.lng || null,
        user_re: user?.RE || null,
        user_nome: user?.NOME || null
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carimboCompleto),
      });
  
      if (!response.ok) throw new Error('Erro ao cadastrar carimbo');
  
      await registrarLog(
        token,
        'Cadastrar',
        `Núcleo Técnico - Gestão de Carimbos - TA cadastrada com sucesso: ${novaCarimbo.ta}`
      );
  
      const responseCarimbos = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
      if (!responseCarimbos.ok) throw new Error('Erro ao carregar carimbos');
  
      const novosCarimbos = await responseCarimbos.json();
      setCarimbos(novosCarimbos);
      setShowNovoModal(false);
      limparFormulario();
  
    } catch (error) {
      setErro(error.message);
    } finally {
      setCadastrando(false);
    }
  };

  
  const formatDateTimeForInput = (datetime) => {
    if (!datetime) return ''; 
    return datetime.replace(' ', 'T').slice(0, 16); 
  };

  const handleSalvarEdicao = async () => {
    try {
      // Obter coordenadas do município selecionado diretamente do estado
      const municipioSelecionado = municipios.find(m => m.value === carimboEditando.localidade);
  
      const carimboCompleto = {
        ...carimboEditando,
        lat: municipioSelecionado?.lat || null,
        lng: municipioSelecionado?.lng || null,
        user_re: user?.RE || null,
        user_nome: user?.NOME || null
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/editar/${carimboEditando.ta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carimboCompleto),
      });
  
      if (!response.ok) throw new Error('Erro ao salvar edição');
  
      await registrarLog(
        token,
        'Editar',
        `Núcleo Técnico - Gestão de Carimbos - TA editada com sucesso: ${carimboEditando.ta}`
      );
  
      const responseCarimbos = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
      if (!responseCarimbos.ok) throw new Error('Erro ao carregar carimbos');
  
      const carimbosAtualizados = await responseCarimbos.json();
      setCarimbos(carimbosAtualizados);
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
    }
  };

  const abrirModalEdicao = async (carimbo) => {
    try {
      const ta = carimbo.TA;

      await registrarLog(
        token,
        'Consulta',
        `Núcleo Técnico - Gestão de Carimbos - Acessando detalhes da TA para edição: ${ta}`
      );
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar/${ta}`);
      if (!response.ok) throw new Error('Erro ao carregar carimbo para edição');
      
      const dadosCarimbo = await response.json();
      
      setCarimboEditando({
        ta: dadosCarimbo.TA,
        taRaiz: dadosCarimbo.TA_RAIZ,
        tipos: dadosCarimbo.TIPOS,
        localidade: dadosCarimbo.LOCALIDADE,
        hostname: dadosCarimbo.HOSTNAME,
        rota: dadosCarimbo.ROTA,
        dataCriacao: dadosCarimbo.DATA_CRIACAO,
        sla: dadosCarimbo.SLA,
        status: dadosCarimbo.STATUS,
        aliada: dadosCarimbo.ALIADA,
        fabricante: dadosCarimbo.FABRICANTE,
        risco: dadosCarimbo.RISCO,
        afetacao: dadosCarimbo.AFETACAO,
        abordagem: dadosCarimbo.ABORDAGEM,
        condominio: dadosCarimbo.CONDOMINIO,
        causa: dadosCarimbo.CAUSA,
        solucao: dadosCarimbo.SOLUCAO,
        medicoes: '',
        atualizacao: ''
      });
      
      setShowEditarModal(true);
    } catch (error) {
      setErro(error.message);
      await registrarLog(
        token,
        'Erro',
        `Núcleo Técnico - Gestão de Carimbos - Erro ao acessar TA para edição: ${error.message}`
      );
    }
  };

  const handleExcluirCarimbo = async (ta) => {
    if (!window.confirm('Tem certeza que deseja excluir este carimbo?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/excluir/${ta}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir carimbo');

      await registrarLog(
        token,
        'Excluir',
        `Núcleo Técnico - Gestão de Carimbos - TA excluída com sucesso: ${ta}`
      );

      const responseCarimbos = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
      if (!responseCarimbos.ok) throw new Error('Erro ao carregar carimbos');
      
      const carimbosAtualizados = await responseCarimbos.json();
      setCarimbos(carimbosAtualizados);
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
      if (!response.ok) throw new Error('Erro ao carregar carimbos');
  
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
      link.download = 'gestao_carimbos.csv';
      link.click();
      URL.revokeObjectURL(link.href);

      await registrarLog(
        token,
        'Download',
        'Núcleo Técnico - Gestão de Carimbos - CSV baixado com sucesso'
      );
    } catch (error) {
      setErro(error.message);
    }
  };

  const carimbosFiltrados = carimbos.filter(carimbo => {
    if (!carimbo) return false;
    
    // Exclui carimbos com status FECHADO
    if (carimbo.STATUS === 'FECHADO') return false;
  
    // Filtro por pesquisa geral
    if (filtro.pesquisa) {
      const campos = [
        carimbo.TA?.toString() || '',
        carimbo.HOSTNAME || '',
        carimbo.ROTA || '',
        carimbo.LOCALIDADE || '',
        carimbo.TIPOS || '',
        carimbo.STATUS || '',
        carimbo.ALIADA || ''
      ];
    
      const pesquisaMatch = campos.some(campo => 
        campo.toLowerCase().includes(filtro.pesquisa.toLowerCase())
      );
    
      if (!pesquisaMatch) return false;
    }
  
    // Filtros específicos
    if (filtro.ta && carimbo.TA !== parseInt(filtro.ta)) return false;
    if (filtro.hostname && !carimbo.HOSTNAME?.toLowerCase().includes(filtro.hostname.toLowerCase())) return false;
    if (filtro.localidade && carimbo.LOCALIDADE !== filtro.localidade) return false;
    if (filtro.status && carimbo.STATUS !== filtro.status) return false;
    if (filtro.tipos && carimbo.TIPOS !== filtro.tipos) return false;
    if (filtro.aliada && carimbo.ALIADA !== filtro.aliada) return false;
    
    return true;
  });

  const colunas = [
    { 
      chave: 'TA', 
      titulo: 'TA', 
      formato: (valor) => {
        const carimboInfo = carimbos.find(c => c.TA === valor); // busca manual pelo valor da TA
        const ultimaAtualizacao = carimboInfo?.ULT_ATUALIZACAO ?? "N/A";
    
        return (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-${valor}`}>
                <strong>Última Atualização:</strong><br />
                {ultimaAtualizacao}
              </Tooltip>
            }
          >
            <Badge bg="secondary">{valor || "N/A"}</Badge>
          </OverlayTrigger>
        );
      }
    },
    { chave: 'TA_RAIZ', titulo: 'TA Raiz' },
    { chave: 'TIPOS', titulo: 'Tipo' },
    { chave: 'LOCALIDADE', titulo: 'Localidade' },
    // { chave: 'HOSTNAME', titulo: 'Hostname' },
    { chave: 'ROTA', titulo: 'Rota' },
    {
      chave: 'DATA_CRIACAO',
      titulo: (
        <div onClick={() => setOrdemDataAsc(prev => !prev)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Data Criação
          <FontAwesomeIcon icon={ordemDataAsc ? faArrowDown : faArrowUp} />
        </div>
      ),
      formato: (valor) => new Date(valor).toLocaleString()
    },
    
    { chave: 'SLA', titulo: 'SLA' },
    { 
        chave: 'STATUS',
        titulo: 'Status',
        formato: (valor) => (
          <Badge bg={
            valor === 'ATIVO' ? 'success' : 
            valor === 'PRE BAIXA' ? 'warning' : 
            'secondary'
          }>
            {valor || "N/A"}
          </Badge>
        )
      },
    { chave: 'ALIADA', titulo: 'Aliada' },
    {
      chave: 'ESCANOLAMENTO',
      titulo: 'Escalonamento',
      formato: (valor) => {
        const carimboInfo = carimbos.find(c => c.ESCANOLAMENTO === valor);
        const isEscalonado = Number(carimboInfo?.ESCALONADO_WHATSAPP) === 1;
    
        return (
          <div>
            <Badge bg={
              valor === 'Coordenador' ? 'success' :
              valor === 'Gerente' ? 'warning' :
              valor === 'Diretor' ? 'danger' :
              valor === 'Gerente NT' ? 'dark' :
              'secondary'
            }>
              {valor || "N/A"}
            </Badge>
            <FontAwesomeIcon
              icon={isEscalonado ? faCheckCircle : faTimesCircle}
              style={{
                color: isEscalonado ? 'green' : 'red',
                marginLeft: '8px',
                verticalAlign: 'middle'
              }}
            />
          </div>
        );
      }
    }
    
  ];

  

  const colunasRelatorio = [
    { chave: 'TA', titulo: 'TA', formato: (valor) => <Badge bg="secondary">{valor || "N/A"}</Badge> },
    { chave: 'TA_RAIZ', titulo: 'TA Raiz' },
    { chave: 'TIPOS', titulo: 'Tipo' },
    { chave: 'LOCALIDADE', titulo: 'Localidade' },
    // { chave: 'HOSTNAME', titulo: 'Hostname' },
    // { chave: 'ROTA', titulo: 'Rota' },
    { chave: 'DATA_CRIACAO', titulo: 'Data Criação', formato: (valor) => new Date(valor).toLocaleString() },
    { chave: 'SLA', titulo: 'SLA' },
    { 
        chave: 'STATUS',
        titulo: 'Status',
        formato: (valor) => (
          <Badge bg={
            valor === 'ATIVO' ? 'success' : 
            valor === 'PRE BAIXA' ? 'warning' : 
            'secondary'
          }>
            {valor || "N/A"}
          </Badge>
        )
      },
    { chave: 'ALIADA', titulo: 'Aliada' },
    {
      chave: 'ESCANOLAMENTO',
      titulo: 'Escalonamento',
      formato: (valor) => {
        const carimboInfo = carimbos.find(c => c.ESCANOLAMENTO === valor);
        const isEscalonado = Number(carimboInfo?.ESCALONADO_WHATSAPP) === 1;
    
        return (
          <div>
            <Badge bg={
              valor === 'Coordenador' ? 'success' :
              valor === 'Gerente' ? 'warning' :
              valor === 'Diretor' ? 'danger' :
              valor === 'Gerente NT' ? 'dark' :
              'secondary'
            }>
              {valor || "N/A"}
            </Badge>
            <FontAwesomeIcon
              icon={isEscalonado ? faCheckCircle : faTimesCircle}
              style={{
                color: isEscalonado ? 'green' : 'red',
                marginLeft: '8px',
                verticalAlign: 'middle'
              }}
            />
          </div>
        );
      }
    },  
    { chave: 'CAUSA', titulo: 'Causa' },
    { chave: 'ULT_ATUALIZACAO', titulo: 'Atualização' },
    
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


  const LegendaFixa = () => {
    return (
      <div className="leaflet-fixed-legend">
        <h5>Tipos de Ocorrências</h5>
        <div className="legend-items">
          {tipoConfig.map((tipo) => (
            <div key={tipo.tipo} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: tipo.cor }}></div>
              <span style={{ fontSize: '12px' }}>{tipo.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const agruparCarimbosPorMunicipio = () => {
    const grupos = {};
    
    // Filtra os carimbos antes de agrupar
    const carimbosAtivos = carimbos.filter(carimbo => 
      carimbo && carimbo.STATUS && carimbo.STATUS.toUpperCase() !== 'FECHADO'
    );
  
    carimbosAtivos.forEach(carimbo => {
      if (!carimbo || !carimbo.LOCALIDADE || !carimbo.TIPOS) return;
      
      const municipio = carimbo.LOCALIDADE;
      const tipo = carimbo.TIPOS;
      
      if (!grupos[municipio]) {
        grupos[municipio] = {
          lat: carimbo.LAT,
          lng: carimbo.LNG,
          tipos: {}
        };
      }
      
      if (!grupos[municipio].tipos[tipo]) {
        grupos[municipio].tipos[tipo] = 0;
      }
      
      grupos[municipio].tipos[tipo]++;
    });
    
    return grupos;
  };

  const toggleConteudo = () => {
    setMostrarConteudo(!mostrarConteudo);
  };

  function getMinDate() {
    const now = new Date();
    const minDate = new Date();
    minDate.setDate(now.getDate() - 15); // 15 dias atrás
    return minDate.toISOString().slice(0, 16);
  }
  
  function getMaxDate() {
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + 30); // 30 dias no futuro
    return maxDate.toISOString().slice(0, 16);
  }
    
  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Gestão de Carimbos"
      content={
        <Container fluid className="gestao-carimbo-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-3 align-items-center">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{mostrarConteudo ? 'Lista de Ocorrências' : 'Mapa das Ocorrências'} </h5>
              <div className="d-flex align-items-center gap-2">
              {!mostrarConteudo && permissions.canEnviar && (
                    <WhatsAppSender
                        elementSelector=".leaflet-container"
                        fileName={`mapa_ocorrencias_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
                        caption={`Mapa de Ocorrências - ${formatarDataHoraAtual()}`}
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
                    {mostrarConteudo ? 'Mostra Mapa' : 'Mostrar Tabela'} 
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        {mostrarConteudo ? (
          <>
          <Row className="mb-4 filtros-section">
            <Col md={7}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Pesquisar por TA"
                  value={filtro.pesquisa}
                  onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={5} className="d-flex justify-content-end">
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

              <Button variant="info" onClick={() => setShowRelatorioModal(true)} className="ms-2">
                <FontAwesomeIcon icon={faTable} className="me-2" />
                Relatório
              </Button>
              
            </Col>
          </Row>

          <Row className="mb-3 filtros-section">
            <Col md={3}>
                <Select
                options={opcoesTipos}
                placeholder="Filtrar por tipo"
                isClearable
                onChange={(selectedOption) => 
                    setFiltro({...filtro, tipos: selectedOption ? selectedOption.value : ''})
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
                placeholder="Filtrar por localidade"
                isClearable
                onChange={(selectedOption) => 
                    setFiltro({...filtro, localidade: selectedOption ? selectedOption.value : ''})
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
                options={opcoesStatus}
                placeholder="Filtrar por status"
                isClearable
                onChange={(selectedOption) => 
                    setFiltro({...filtro, status: selectedOption ? selectedOption.value : ''})
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
                options={opcoesAliada}
                placeholder="Filtrar por aliada"
                isClearable
                onChange={(selectedOption) => 
                    setFiltro({...filtro, aliada: selectedOption ? selectedOption.value : ''})
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

          <Row>
            <Col>
              <TabelaPaginada
                dados={[...carimbosFiltrados].sort((a, b) => {
                  const dataA = new Date(a.DATA_CRIACAO);
                  const dataB = new Date(b.DATA_CRIACAO);
                  return ordemDataAsc ? dataA - dataB : dataB - dataA;
                })}
                colunas={colunas}
                onEditar={abrirModalEdicao}
                onExcluir={(item) => handleExcluirCarimbo(item.TA)}
                onDetalhes={(item) => {
                  setCarimboDetalhado(item);
                  setShowDetalhesModal(true);
                }}
                permissoes={permissions}
                onRowHover={(item) => setHoveredRow(item)}
                onRowLeave={() => setHoveredRow(null)}
              />
            </Col>
          </Row>

          {/* Modal Detalhes */}
          <Modal show={showDetalhesModal} onHide={() => setShowDetalhesModal(false)} size="lg" className="modal-detalhes">
            <Modal.Header closeButton className="border-0">
                <div className="d-flex justify-content-between w-100 align-items-center rounded"  style={{ borderColor: '#ff6f00', backgroundColor: '#ff6f00' }}>
                <div className="p-2">
                    <Modal.Title className="m-0 text-white">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    NT-SPI 🌡️ Gestão de Carimbo 🌡️ - {carimboDetalhado ? carimboDetalhado.TA : "N/A"}
                    </Modal.Title>
                </div>
                <div className="d-flex align-items-center">
                    {permissions.canEnviar && (
                    <div
                    onClick={async () => {
                      if (!carimboDetalhado?.TA) return;
                
                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/escalonar/${carimboDetalhado.TA}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                
                        if (!response.ok) throw new Error('Erro ao atualizar escalonamento');
                
                        const novosCarimbos = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`).then(r => r.json());
                        setCarimbos(novosCarimbos);
                      } catch (error) {
                        console.error('Erro ao escalonar via WhatsApp:', error);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <WhatsAppSender
                      elementSelector=".modal-detalhes .modal-content"
                      fileName={`detalhe_carimbo_${carimboDetalhado?.TA || 'desconhecido'}.png`}
                      caption={`Gestão de Carimbos - Detalhes do TA: ${carimboDetalhado?.TA || 'N/A'} - Data: ${formatarDataHoraAtual()}`}
                      variant="link"
                      className="text-white p-1 me-2"
                    />
                  </div>
                    )}
                </div>
                </div>
            </Modal.Header>
            <Modal.Body>
                {carimboDetalhado ? (
                <div className="table-responsive">
                    <table className="table-detalhe-gestao-carimbos">
                    <thead>
                        <tr>
                        <th>Descrição</th>
                        <th>Atualização</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td><strong>TA</strong></td>
                        <td>{carimboDetalhado.TA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>TA Raiz</strong></td>
                        <td>{carimboDetalhado.TA_RAIZ || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Tipo</strong></td>
                        <td>{carimboDetalhado.TIPOS || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Localidade</strong></td>
                        <td>{carimboDetalhado.LOCALIDADE || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Hostname</strong></td>
                        <td>{carimboDetalhado.HOSTNAME || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Rota</strong></td>
                        <td>{carimboDetalhado.ROTA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Data Criação</strong></td>
                        <td>{new Date(carimboDetalhado.DATA_CRIACAO).toLocaleString() || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>SLA</strong></td>
                        <td>{carimboDetalhado.SLA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Status</strong></td>
                        <td>{carimboDetalhado.STATUS ? (
                         
                                <Badge 
                                bg={
                                    carimboDetalhado.STATUS === 'ATIVO' ? 'success' : 
                                    carimboDetalhado.STATUS === 'PRE BAIXA' ? 'warning' : 
                                    'secondary'
                                }
                                className="ms-2"
                                >
                                {carimboDetalhado.STATUS}
                                </Badge>
                                
                          
                            ) : (
                                <Badge bg="secondary" className="ms-2">N/A</Badge>
                            )}</td>
                        </tr>
                        <tr>
                        <td><strong>Aliada</strong></td>
                        <td>{carimboDetalhado.ALIADA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong>Escalonamento</strong></td>
                        <td>
                          {carimboDetalhado.ESCANOLAMENTO ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <Badge
                                bg={
                                  carimboDetalhado.ESCANOLAMENTO === 'Coordenador'
                                    ? 'success'
                                    : carimboDetalhado.ESCANOLAMENTO === 'Gerente'
                                    ? 'warning'
                                    : carimboDetalhado.ESCANOLAMENTO === 'Diretor'
                                    ? 'danger'
                                    : carimboDetalhado.ESCANOLAMENTO === 'Gerente NT'
                                    ? 'dark'
                                    : 'secondary'
                                }
                              >
                                {carimboDetalhado.ESCANOLAMENTO}
                              </Badge>

                              <FontAwesomeIcon
                                icon={
                                  Number(carimboDetalhado.ESCALONADO_WHATSAPP) === 1
                                    ? faCheckCircle
                                    : faTimesCircle
                                }
                                style={{
                                  color:
                                    Number(carimboDetalhado.ESCALONADO_WHATSAPP) === 1
                                      ? 'green'
                                      : 'red',
                                }}
                              />
                            </div>
                          ) : (
                            <Badge bg="secondary" className="ms-2">
                              N/A
                            </Badge>
                          )}
                        </td>

                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faExclamationTriangle} className="causa-title me-2" />Causa</strong></td>
                        <td>{carimboDetalhado.CAUSA || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faCheckCircle} className="solucao-title me-2" />Solução</strong></td>
                        <td>{carimboDetalhado.SOLUCAO || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faChartLine} className="descricao-title me-2" />Medições</strong></td>
                        <td>{carimboDetalhado.MEDICOES || "N/A"}</td>
                        </tr>
                        <tr>
                        <td><strong><FontAwesomeIcon icon={faSyncAlt} className="descricao-title me-2" />Atualização</strong></td>
                        <td>{carimboDetalhado.ULT_ATUALIZACAO || "N/A"}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                ) : (
                <p>Nenhum carimbo selecionado.</p>
                )}
            </Modal.Body>
        </Modal>

          {/* Modal de Edição */}
          <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Editar Carimbo - TA: {carimboEditando?.ta || ''}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {carimboEditando && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>TA</Form.Label>
                        <Form.Control
                          type="number"
                          value={carimboEditando.ta}
                          readOnly
                          disabled
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>TA Raiz</Form.Label>
                        <Form.Control
                          type="number"
                          value={carimboEditando.taRaiz || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, taRaiz: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Tipo</Form.Label>
                        <Select
                          options={opcoesTipos}
                          value={opcoesTipos.find(opt => opt.value === carimboEditando.tipos)}
                          onChange={(selected) => setCarimboEditando({...carimboEditando, tipos: selected.value})}
                          isSearchable
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Localidade</Form.Label>
                        <Select
                            options={municipios}
                            value={municipios.find(m => m.value === carimboEditando.localidade)}
                            onChange={(selected) => setCarimboEditando({...carimboEditando, localidade: selected.value})}
                            isSearchable
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Hostname</Form.Label>
                        <Form.Control
                          value={carimboEditando.hostname || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, hostname: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Rota</Form.Label>
                        <Form.Control
                          value={carimboEditando.rota || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, rota: e.target.value})}
                        />
                      </Form.Group>

                      
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Select
                          options={opcoesStatus}
                          value={opcoesStatus.find(opt => opt.value === carimboEditando.status)}
                          onChange={(selected) => setCarimboEditando({...carimboEditando, status: selected.value})}
                          isSearchable
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Aliada</Form.Label>
                        <Select
                          options={opcoesAliada}
                          value={opcoesAliada.find(opt => opt.value === carimboEditando.aliada)}
                          onChange={(selected) => setCarimboEditando({...carimboEditando, aliada: selected.value})}
                          isSearchable
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Fabricante</Form.Label>
                        <Form.Control
                          value={carimboEditando.fabricante || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, fabricante: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Risco</Form.Label>
                        <Form.Control
                          value={carimboEditando.risco || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, risco: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Abordagem</Form.Label>
                        <Select
                          options={opcoesAbordagem}
                          value={opcoesAbordagem.find(opt => opt.value === carimboEditando.abordagem)}
                          onChange={(selected) => setCarimboEditando({...carimboEditando, abordagem: selected.value})}
                          isSearchable
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Data de Criação</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={formatDateTimeForInput(carimboEditando.dataCriacao)}
                          onChange={(e) => setCarimboEditando({...carimboEditando, dataCriacao: e.target.value.replace('T', ' ')})}
                          min={getMinDate()}
                          max={getMaxDate()}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Condomínio</Form.Label>
                        <Form.Control
                          value={carimboEditando.condominio || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, condominio: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Causa</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={carimboEditando.causa || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, causa: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Solução</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={carimboEditando.solucao || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, solucao: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Medições</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={carimboEditando.medicoes || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, medicoes: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Atualização</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={carimboEditando.atualizacao || ''}
                          onChange={(e) => setCarimboEditando({...carimboEditando, atualizacao: e.target.value})}
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
                Cadastrar Novo Carimbo
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>TA</Form.Label>
                      <Form.Control
                        type="number"
                        value={novaCarimbo.ta}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, ta: e.target.value})}
                        placeholder="Digite o número da TA"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>TA Raiz</Form.Label>
                      <Form.Control
                        type="number"
                        value={novaCarimbo.taRaiz}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, taRaiz: e.target.value})}
                        placeholder="Digite o TA raiz"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Tipo</Form.Label>
                      <Select
                        options={opcoesTipos}
                        onChange={(selected) => setNovaCarimbo({...novaCarimbo, tipos: selected.value})}
                        placeholder="Selecione o tipo"
                        isSearchable
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Localidade</Form.Label>
                        <Select
                            options={municipios}
                            value={municipios.find(m => m.value === novaCarimbo.localidade)}
                            onChange={(selected) => setNovaCarimbo({...novaCarimbo, localidade: selected.value})}
                            placeholder="Selecione a localidade"
                            isSearchable
                            isLoading={municipios.length === 0}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Hostname</Form.Label>
                      <Form.Control
                        value={novaCarimbo.hostname}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, hostname: e.target.value})}
                        placeholder="Digite o hostname"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Rota</Form.Label>
                      <Form.Control
                        value={novaCarimbo.rota}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, rota: e.target.value})}
                        placeholder="Digite a rota"
                      />
                    </Form.Group>

                    
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Select
                        options={opcoesStatus}
                        onChange={(selected) => setNovaCarimbo({...novaCarimbo, status: selected.value})}
                        placeholder="Selecione o status"
                        isSearchable
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Aliada</Form.Label>
                      <Select
                        options={opcoesAliada}
                        onChange={(selected) => setNovaCarimbo({...novaCarimbo, aliada: selected.value})}
                        placeholder="Selecione a aliada"
                        isSearchable
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Fabricante</Form.Label>
                      <Form.Control
                        value={novaCarimbo.fabricante}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, fabricante: e.target.value})}
                        placeholder="Digite o fabricante"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Risco</Form.Label>
                      <Form.Control
                        value={novaCarimbo.risco}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, risco: e.target.value})}
                        placeholder="Digite o risco"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Abordagem</Form.Label>
                      <Select
                        options={opcoesAbordagem}
                        onChange={(selected) => setNovaCarimbo({...novaCarimbo, abordagem: selected.value})}
                        placeholder="Selecione a abordagem"
                        isSearchable
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Data de Criação</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="datetime-local"
                          value={novaCarimbo.dataCriacao}
                          onChange={(e) =>
                            setNovaCarimbo({ ...novaCarimbo, dataCriacao: e.target.value })
                          }
                          min={getMinDate()}
                          max={getMaxDate()}
                        />
                        <Form.Control
                          type="text"
                          placeholder="Cole aqui ex: 2025-04-14 15:30"
                          onBlur={(e) => {
                            const valor = e.target.value.trim();
                            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(valor)) {
                              const formatado = valor.replace(" ", "T");
                              setNovaCarimbo({ ...novaCarimbo, dataCriacao: formatado });
                            }
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Condomínio</Form.Label>
                      <Form.Control
                        value={novaCarimbo.condominio}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, condominio: e.target.value})}
                        placeholder="Digite o condomínio"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Causa</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaCarimbo.causa}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, causa: e.target.value})}
                        placeholder="Descreva a causa"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Solução</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaCarimbo.solucao}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, solucao: e.target.value})}
                        placeholder="Descreva a solução"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Medições</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaCarimbo.medicoes}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, medicoes: e.target.value})}
                        placeholder="Descreva as medições"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Atualização</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaCarimbo.atualizacao}
                        onChange={(e) => setNovaCarimbo({...novaCarimbo, atualizacao: e.target.value})}
                        placeholder="Descreva as atualizações"
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
              <Button 
                  variant="primary" 
                  onClick={handleCriarCarimbo}
                  disabled={cadastrando} // Desabilita o botão durante o carregamento
                >
                  {cadastrando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Cadastrar
                    </>
                  )}
                </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal Relatório */}
          <Modal show={showRelatorioModal} onHide={() => setShowRelatorioModal(false)} size="xl" className="modal-relatorio" id="modalRelatorioCarimbos">
            <Modal.Header closeButton className="border-0">
              <div className="d-flex justify-content-between w-100 align-items-center rounded" style={{ borderColor: '#0066ff', backgroundColor: '#0066ff' }}>
                <div className="p-2">
                  <Modal.Title className="m-0 text-white">
                    <FontAwesomeIcon icon={faTable} className="me-2" />
                    Relatório Gestão de Falhas
                  </Modal.Title>
                </div>
                <div className="d-flex align-items-center">
                  {permissions.canEnviar && (
                    <WhatsAppSender
                      elementSelector="#modalRelatorioCarimbos .modal-content"
                      fileName={`relatorio_carimbos_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
                      caption={`Relatório de Carimbos - ${formatarDataHoraAtual()}`}
                      variant="link"
                      className="text-white p-1 me-2"
                    />
                  )}
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <TabelaPaginada
                dados={carimbosFiltrados}
                colunas={colunasRelatorio}
                paginacao={true}
                itensPorPagina={10}
                mostrarAcoes={false}
                permissoes={permissions}
                estiloCompacto={true}
              />
            </Modal.Body>
          </Modal>

          {/* Setor do mapa */}
          </>):<MapContainer 
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
                    
                    {/* Camadas de pontos por tipo - cada tipo será uma camada que pode ser ocultada */}
                    {tipoConfig.map(tipo => {
                    // Filtra os municípios que têm este tipo de carimbo
                    const municipiosComEsteTipo = Object.entries(agruparCarimbosPorMunicipio())
                        .filter(([_, dados]) => dados.tipos[tipo.tipo]);
                    
                    if (municipiosComEsteTipo.length === 0) return null;
                    
                    return (
                        <LayersControl.Overlay 
                        key={tipo.tipo} 
                        name={tipo.label} 
                        checked={true} // Inicia visível por padrão
                        >
                        <LayerGroup>
                            {municipiosComEsteTipo.map(([municipio, dados]) => {
                            const quantidade = dados.tipos[tipo.tipo];
                            return (
                                <Marker
                                key={`${municipio}-${tipo.tipo}`}
                                position={[dados.lat, dados.lng]}
                                icon={criarIcone(tipo.cor, quantidade)}
                                >
                                <Popup>
                                    <div className="popup-container">
                                        <div className="popup-header">
                                        <h3 className="popup-title">{municipio}</h3>
                                        </div>
                                        
                                        <div className="popup-body">
                                        {/* Tabela com as informações */}
                                        <table className="popup-table-gestao-carimbo">
                                            <thead>
                                            <tr>
                                                <th>TA</th>
                                                <th>SLA</th>
                                                <th>Escalonamento</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {carimbos
                                                .filter(c => c.LOCALIDADE === municipio && c.TIPOS === tipo.tipo)
                                                .map((carimbo, index) => (
                                                <tr key={index}>
                                                    <td>{carimbo.TA || "N/A"}</td>
                                                    <td>{carimbo.SLA || "N/A"}</td>
                                                    <td>
                                                    <Badge bg={
                                                        carimbo.ESCANOLAMENTO === 'Coordenador' ? 'success' : 
                                                        carimbo.ESCANOLAMENTO === 'Gerente' ? 'warning' : 
                                                        carimbo.ESCANOLAMENTO === 'Diretor' ? 'danger' : 
                                                        carimbo.ESCANOLAMENTO === 'Gerente NT' ? 'dark' : 
                                                        'secondary'
                                                    }>
                                                        {carimbo.ESCANOLAMENTO || "N/A"}
                                                    </Badge>
                                                    </td>
                                                </tr>
                                                ))
                                            }
                                            </tbody>
                                        </table>
                                        
                                        {/* Seção de tipos (mantida como estava) */}
                                        <div className="popup-section">
                                            <h4 className="popup-section-title">Resumo por Tipo</h4>
                                            <ul className="popup-list">
                                            {tipoConfig.map(t => (
                                                dados.tipos[t.tipo] ? (
                                                <li key={t.tipo} className="popup-list-item">
                                                    <span className="popup-list-label">{t.label}:</span>
                                                    <span className="popup-list-value">{dados.tipos[t.tipo]}</span>
                                                </li>
                                                ) : null
                                            ))}
                                            </ul>
                                        </div>
                                        </div>
                                    </div>
                                    </Popup>
                                </Marker>
                            );
                            })}
                        </LayerGroup>
                        </LayersControl.Overlay>
                    );
                    })}
                    
                    <LegendaFixa />
                </LayersControl>
                </MapContainer>}
        </Container>
        
      }
    />
  );
};

export default GestaoCarimbo;