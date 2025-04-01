import { Container, Row, Button } from 'react-bootstrap';
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
  const [tasData, setTasData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartDataContratos, setChartDataContratos] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const token = localStorage.getItem('token'); 

    // Efeito único para carregamento inicial
    useEffect(() => {
      const loadInitialData = async () => {
        try {
          // Carrega dados de obras
          const obrasResponse = await axios.get(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
          setObras(obrasResponse.data);
  
          // Carrega dados de TAS
          const tasResponse = await axios.get(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
          setTasData(tasResponse.data);
          processChartData(tasResponse.data);
          processChartDataContratos(tasResponse.data);
  
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
          console.error("Erro ao carregar dados iniciais:", error);
        }
      };
  
      loadInitialData();
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
          <h5 className="resumo-obras-title mb-0">Resumo da Obras SPI</h5>
          {permissions.canEnviar && (
                <WhatsAppSender
                  elementSelector=".container-subtitle + .container-fluid"
                  fileName={`resumo_obras_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
                  caption={`Resumo de Obras SPI - ${formatarDataHoraAtual()}`}
                  className="text-success p-1 ms-2"
                />
            )}
        </div>
        
        {/* Linha fina que liga o subtítulo ao botão */}
        <div className="linha-azul" />

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

     {/* Historico de TAS */}
     <div className="container-subtitle d-flex align-items-center justify-content-between w-100 p-3 position-relative">
            <h5 className="resumo-obras-title mb-0">Histórico de TAs SPI</h5>
            
            <div className="linha-azul" />

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