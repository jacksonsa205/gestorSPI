import { Container, Row, Button , Col} from 'react-bootstrap';
import { 
  faClock,
  faExclamationTriangle,
  faTimesCircle,
  faClipboardCheck,
  faDraftingCompass,
  faFileInvoiceDollar,
  faHardHat,
  faCheckCircle,
  faChevronUp,
  faChevronDown,
  faHexagonNodesBolt,
  faTriangleExclamation,            
  faServer,            
  faCity,              
  faMobileAlt,         
  faBriefcase,        
  faNetworkWired,      
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importe o FontAwesomeIcon
import Layout from "../../components/Layout/Layout";
import WhatsAppSender from "../../components/WhatsAppSender/WhatsAppSender";
import BarChartComponent from '../../components/Charts/BarChartComponent';
import useAuthValidation from '../../hooks/useAuthValidation';
import Loading from '../../components/Loading/Loading';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css'; 
import CardObras from '../../components/Cards/CardObras/CardObras'; 
import CardTas from '../../components/Cards/CardTas/CardTas'; 
import { registrarLog } from '../../hooks/logs';

const etapasConfig = [
  { etapa: 'PENDENTE', cor: '#dc3545', label: 'Pendente', icone: faClock, gradient: ['#ff758c', '#ff7eb3'] },
  { etapa: 'PRIORIZADA', cor: '#E97132', label: 'Priorizada', icone: faExclamationTriangle, gradient: ['#ff9a44', '#ff6e68'] },
  { etapa: 'CANCELADA', cor: '#6c757d', label: 'Cancelada', icone: faTimesCircle, gradient: ['#868f96', '#596164'] },
  { etapa: 'AVALIAÇÃO', cor: '#FA7A6C', label: 'Avaliação', icone: faClipboardCheck, gradient: ['#ff6b6b', '#ff8787'] },
  { etapa: 'PROJETO', cor: '#9900CC', label: 'Projeto', icone: faDraftingCompass, gradient: ['#9f7aea', '#805ad5'] },
  { etapa: 'APROVACAO-CUSTO', cor: '#0C769E', label: 'Aprovação Custo', icone: faFileInvoiceDollar, gradient: ['#4298f5', '#2b6cb0'] },
  { etapa: 'EXECUÇÃO', cor: '#00B050', label: 'Execução', icone: faHardHat, gradient: ['#48bb78', '#38a169'] },
  { etapa: 'CONCLUÍDAS', cor: '#0066FF', label: 'Concluídas', icone: faCheckCircle, gradient: ['#4298f5', '#3182ce'] },
];

const tipoConfig = [
  { 
    tipo: 'DWDM', 
    cor: '#dc3545', 
    label: 'DWDM', 
    icone: faHexagonNodesBolt, 
    gradient: ['#ff758c', '#ff7eb3'] 
  },
  { 
    tipo: 'OLT UPLINK', 
    cor: '#E97132', 
    label: 'OLT Uplink', 
    icone: faNetworkWired, 
    gradient: ['#ff9a44', '#ff6e68'] 
  },
  { 
    tipo: 'OLT ISOLADA', 
    cor: '#6c757d', 
    label: 'OLT Isolada', 
    icone: faTriangleExclamation, 
    gradient: ['#868f96', '#596164'] 
  },
  { 
    tipo: 'HL4', 
    cor: '#FA7A6C', 
    label: 'HL4', 
    icone: faServer, 
    gradient: ['#ff6b6b', '#ff8787'] 
  },
  { 
    tipo: 'METRO', 
    cor: '#9900CC', 
    label: 'Metro', 
    icone: faCity, 
    gradient: ['#9f7aea', '#805ad5'] 
  },
  { 
    tipo: 'MÓVEL', 
    cor: '#0C769E', 
    label: 'Móvel', 
    icone: faMobileAlt, 
    gradient: ['#4298f5', '#2b6cb0'] 
  },
  { 
    tipo: 'B2B AVANÇADO', 
    cor: '#00B050', 
    label: 'B2B Avançado', 
    icone: faBriefcase, 
    gradient: ['#48bb78', '#38a169'] 
  },
  { 
    tipo: 'INFRA', 
    cor: '#0066FF', 
    label: 'Infra', 
    icone: faNetworkWired, 
    gradient: ['#4298f5', '#3182ce'] 
  },
];


const contratosConfig = {
  CAMPINAS: ['#ff758c', '#ff7eb3'],
  INTERIOR: ['#ff9a44', '#ff6e68'],
  JUNDIAI: ['#868f96', '#596164'],
  OSASCO: ['#ff6b6b', '#ff8787'],
  PC_SC: ['#4298f5', '#3182ce'],
};


const Dashboard = () => {
  const { loading, user, permissions } = useAuthValidation(1, null, 1);
  const [obras, setObras] = useState([]);
  const [showCardsObras, setShowCardsObras] = useState(true);
  const [showCardsTAS, setShowCardsTAS] = useState(true);
  const [showCardsOcorrencias, setShowCardsOcorrencias] = useState(true);
  const [tasData, setTasData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartDataContratos, setChartDataContratos] = useState([]);
  const [carimbos, setCarimbos] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const token = localStorage.getItem('token'); 
  

    // Efeito único para carregamento inicial
    useEffect(() => {
      const loadAllData = async () => {
        try {
          // Carrega dados de obras
          const obrasResponse = await axios.get(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
          setObras(obrasResponse.data);
  
          // Carrega dados de TAS
          const tasResponse = await axios.get(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
          setTasData(tasResponse.data);
          processChartData(tasResponse.data);
          processChartDataContratos(tasResponse.data);
  
          // Carrega dados de carimbos
          const carimbosResponse = await axios.get(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/gestao-carimbo/buscar`);
          const carimbosFiltrados = carimbosResponse.data.filter(item => 
            item.STATUS && item.STATUS.toUpperCase() !== 'FECHADO'
          );
          setCarimbos(carimbosFiltrados);

  
          // Registra log único de carregamento da página
          if (!pageLoaded && token) {
            await registrarLog(
              token,
              'Consulta',
              'Dashboard - Página inicial carregada com sucesso'
            );
            setPageLoaded(true);
          }
  
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        }
      };
  
      loadAllData();
    }, [token]);

    

  // Processar dados para o gráfico
  const processChartData = (data) => {
    const parseDate = (dateString) => {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      return new Date(year, month - 1, day, hours, minutes); // Mês é 0-based no JavaScript
    };
  
    const monthlyCounts = data.reduce((acc, tas) => {
      try {
        const date = parseDate(tas.DT_CRIACAO_FT); // Usando DT_CRIACAO_FT
        if (isNaN(date.getTime())) {
          console.error("Data inválida:", tas.DT_CRIACAO_FT); // Verifique se há datas inválidas
          return acc;
        }
  
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      } catch (error) {
        console.error("Erro ao processar data:", tas.DT_CRIACAO_FT, error); // Captura erros de parsing
      }
      return acc;
    }, {});
  
    
  
    const formattedData = Object.keys(monthlyCounts).map(key => ({
      name: key,
      value: monthlyCounts[key]
    })).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/');
      const [bMonth, bYear] = b.name.split('/');
      return new Date(aYear, aMonth) - new Date(bYear, bMonth);
    });
  
    setChartData(formattedData);
  };


  const processChartDataContratos = (data) => {
    const contratosCounts = data.reduce((acc, tas) => {
      const contrato = tas.CONTRATO || 'Sem Contrato';
      acc[contrato] = (acc[contrato] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.keys(contratosCounts).map((contrato) => ({
      name: contrato,
      value: contratosCounts[contrato],
      fill: contratosConfig[contrato] ? contratosConfig[contrato][0] : '#0066ff',
    }));

    setChartDataContratos(formattedData);
  };

  // Agrupar obras por etapa e contrato (CLUSTER)
  const resumoPorEtapa = obras.reduce((acc, obra) => {
    const etapa = obra.ETAPA || 'PENDENTE'; 
    const contrato = obra.CLUSTER || 'Sem Contrato'; 

    if (!acc[etapa]) {
      acc[etapa] = {
        total: 0,
        contratos: {},
      };
    }
    acc[etapa].total += 1;

    if (!acc[etapa].contratos[contrato]) {
      acc[etapa].contratos[contrato] = 0;
    }
    acc[etapa].contratos[contrato] += 1;

    return acc;
  }, {});

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


  const calcularTAsPorSLA = (tasLista, slaLabel) => {
    return tasLista.filter(ta => {
      if (!ta.SLA) return false;
      
      const [horas, minutos] = ta.SLA.split(':').map(Number);
      const horasDecimais = horas + (minutos / 60);
      
      if (slaLabel === "Menor que 4 HRs") return horasDecimais < 4;
      if (slaLabel === "Menor que 8 HRs") return horasDecimais >= 4 && horasDecimais < 8;
      return horasDecimais >= 8; // "Maior que 8 HRs"
    }).length;
  };
  

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão...</div>;
  }

  return (
    <Layout
  title="Dashboard"
  content={
    <div>
      {/* Resumo Obras */}
      <div className="container-subtitle d-flex align-items-center justify-content-between w-100 p-3 position-relative">
        <div className="d-flex align-items-center">
          <h5 className="resumo-obras-title mb-0">Resumo de Obras SPI</h5>
          
        </div>
        
        {/* Linha fina que liga o subtítulo ao botão */}
        {/* <div className="linha-azul" /> */}
        <div className="d-flex align-items-center gap-2">
        {permissions.canEnviar && (
            <WhatsAppSender
              elementSelector=".container-subtitle + .container-fluid"
              fileName={`resumo_obras_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
              caption={`Resumo de Obras SPI - ${formatarDataHoraAtual()}`}
              className="botao-whatsapp d-flex align-items-center justify-content-center"
              variant="success"
            />
          )}
          {/* Botão redondo */}
          <button
            onClick={() => setShowCardsObras(!showCardsObras)}
            className="botao-toggle d-flex align-items-center justify-content-center"
          >
            <FontAwesomeIcon
              icon={showCardsObras ? faChevronUp : faChevronDown}
              size="sm"
              className="text-white"
            />
          </button>
        </div>
        
      </div>

      {/* Container dos cards (condicional) */}
      <Container fluid className="mt-4">
        {showCardsObras && (
          <Row>
            {etapasConfig.map((etapa, index) => {
              const dadosEtapa = resumoPorEtapa[etapa.etapa] || { total: 0, contratos: {} };
              const contratosFormatados = Object.keys(dadosEtapa.contratos).map((contrato) => ({
                nome: contrato,
                quantidade: dadosEtapa.contratos[contrato],
              }));

              return (
                <CardObras
                  key={index}
                  etapa={etapa.label}
                  gradient={etapa.gradient}
                  icone={etapa.icone}
                  total={dadosEtapa.total}
                  contratos={contratosFormatados}
                />
              );
            })}
          </Row>
        )}
      </Container>

      {/* Resumo de Ocorrências */}
     
      <div className="container-subtitle d-flex align-items-center justify-content-between w-100 p-3 position-relative">
      <div className="d-flex align-items-center">
        <h5 className="resumo-obras-title mb-0">Resumo de Ocorrência</h5>
        
      </div>
      
      {/* <div className="linha-azul" /> */}

      <div className="d-flex align-items-center gap-2">
        {permissions.canEnviar && (
            <WhatsAppSender
              elementSelector=".resumo-ocorrencias"
              fileName={`resumo_ocorrencias_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
              caption={`Resumo de Ocorrências - ${formatarDataHoraAtual()}`}
              className="botao-whatsapp d-flex align-items-center justify-content-center"
              variant="success"
            />
          )}
        <button
          onClick={() => setShowCardsOcorrencias(!showCardsOcorrencias)}
          className="botao-toggle d-flex align-items-center justify-content-center"
        >
          <FontAwesomeIcon
            icon={showCardsOcorrencias ? faChevronUp : faChevronDown}
            size="sm"
            className="text-white"
          />
        </button>
      </div>
    </div>

    {/* Container dos cards de ocorrências - Mantendo estrutura original */}
    <Container fluid className="resumo-ocorrencias mt-4">
      {showCardsOcorrencias && (
        <Row>
          {tipoConfig.map((tipo, index) => {
            const carimbosDoTipo = carimbos.filter(c => c.TIPOS === tipo.tipo);
            
            // Função corrigida para determinar a variante do badge
            const getVariant = (nome) => {
              if (nome === "Menor que 4 HRs") return 'success';
              if (nome === "Menor que 8 HRs") return 'warning';
              if (nome === "Maior que 8 HRs") return 'danger';
              return 'secondary';
            };

            // Calcula distribuição por SLA
            const slaDistribuicao = {
              "Menor que 4 HRs": carimbosDoTipo.filter(c => {
                const [h, m] = (c.SLA || '00:00').split(':').map(Number);
                return (h + m/60) < 4;
              }).length,
              "Menor que 8 HRs": carimbosDoTipo.filter(c => {
                const [h, m] = (c.SLA || '00:00').split(':').map(Number);
                const horas = h + m/60;
                return horas >= 4 && horas < 8;
              }).length,
              "Maior que 8 HRs": carimbosDoTipo.filter(c => {
                const [h, m] = (c.SLA || '00:00').split(':').map(Number);
                return (h + m/60) >= 8;
              }).length
            };

            // Formata para o componente CardTas
            const slasFormatados = Object.entries(slaDistribuicao).map(([nome, quantidade]) => ({
              nome,
              quantidade,
              variant: getVariant(nome)
            }));

            return (
              <CardTas
                key={`tipo-${index}`}
                etapa={tipo.label}
                gradient={tipo.gradient}
                icone={tipo.icone}
                total={carimbosDoTipo.length}
                contratos={slasFormatados}
              />
            );
          })}
        </Row>
      )}
    </Container>

     {/* Historico de TAS */}
     <div className="container-subtitle d-flex align-items-center justify-content-between w-100 p-3 position-relative">
            <h5 className="resumo-obras-title mb-0">Histórico de TAs SPI</h5>
            
            {/* <div className="linha-azul" /> */}

            <button
              onClick={() => setShowCardsTAS(!showCardsTAS)}
              className="botao-toggle d-flex align-items-center justify-content-center"
            >
              <FontAwesomeIcon
                icon={showCardsTAS ? faChevronUp : faChevronDown}
                size="sm"
                className="text-white"
              />
            </button>
          </div>

          <Container fluid className="mt-2">
            {showCardsTAS && (
              <>
              <Row className="chart-row"> {/* Adicionado a classe chart-row */}
                <BarChartComponent 
                  data={chartData}
                  title="Evolução Mensal de TAS Abertas"
                />
              </Row>
              <Row className="chart-row">
                <BarChartComponent 
                  data={chartDataContratos}
                  title="Total de TAS Abertas por Contrato"
                />
              </Row>
            </>
            )}
          </Container>
        </div>
      }
    />
  );
};

export default Dashboard;