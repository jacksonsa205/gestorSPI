import { Container, Row } from 'react-bootstrap';
import { 
  faClock,
  faExclamationTriangle,
  faTimesCircle,
  faClipboardCheck,
  faDraftingCompass,
  faFileInvoiceDollar,
  faHardHat,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import Layout from "../../components/Layout/Layout";
import useAuthValidation from '../../hooks/useAuthValidation';
import Loading from '../../components/Loading/Loading';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CardObras from '../../components/Cards/CardObras/CardObras'; 

const etapasConfig = [
  { etapa: 'PENDENTE', cor: '#dc3545', label: 'Pendente', icone: faClock },
  { etapa: 'PRIORIZADA', cor: '#E97132', label: 'Priorizada', icone: faExclamationTriangle },
  { etapa: 'CANCELADA', cor: '#6c757d', label: 'Cancelada', icone: faTimesCircle },
  { etapa: 'AVALIAÇÃO', cor: '#FA7A6C', label: 'Avaliação', icone: faClipboardCheck },
  { etapa: 'PROJETO', cor: '#9900CC', label: 'Projeto', icone: faDraftingCompass },
  { etapa: 'APROVACAO-CUSTO', cor: '#0C769E', label: 'Aprovação Custo', icone: faFileInvoiceDollar },
  { etapa: 'EXECUÇÃO', cor: '#00B050', label: 'Execução', icone: faHardHat },
  { etapa: 'CONCLUÍDAS', cor: '#0066FF', label: 'Concluídas', icone: faCheckCircle },
];

const Dashboard = () => {
  const { loading, user, permissions } = useAuthValidation(1, null, 1);
  const [obras, setObras] = useState([]);

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
        console.log("Dados da API:", response.data); // Verifique os dados retornados
        setObras(response.data);
      } catch (error) {
        console.error("Erro ao buscar obras:", error);
      }
    };

    fetchObras();
  }, []);

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão...</div>;
  }

  // Agrupar obras por etapa e contrato (CLUSTER)
  const resumoPorEtapa = obras.reduce((acc, obra) => {
    const etapa = obra.ETAPA || 'PENDENTE'; // Usar 'PENDENTE' como padrão se não houver etapa
    const contrato = obra.CLUSTER || 'Sem Contrato'; // Usar 'Sem Contrato' como padrão se não houver CLUSTER

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

  return (
    <Layout
      title="Dashboard"
      content={
        <div>
          
          <Container fluid className="mt-4">
            <h5 className='resumo-obras-title'>Resumo da Obras SPI</h5>
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
                    cor={etapa.cor}
                    icone={etapa.icone}
                    total={dadosEtapa.total}
                    contratos={contratosFormatados}
                  />
                );
              })}
            </Row>
          </Container>
        </div>
      }
    />
  );
};

export default Dashboard;