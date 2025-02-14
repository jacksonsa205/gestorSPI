import { Container, Row, Col } from 'react-bootstrap';
import { 
  faUser, 
  faChartColumn,
  faBox,
  faFile,
  faUsers,
  faSitemap
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Adicione esta importação

import Layout from "../../components/Layout/Layout";
import CardSimples from "../../components/Cards/CardSimples/CardSimples";
import BarChartComponent from '../../components/Charts/BarChartComponent';
import LineChartComponent from '../../components/Charts/LineChartComponent';
import PlantonistasPorEquipe from '../../components/Plantonista/PlantonistasPorEquipe';
import './Dashboard.css';

const Dashboard = () => {
  // Dados compartilhados para ambos os gráficos
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Fev', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Abr', value: 2780 },
    { name: 'Mai', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  // Dados dos plantonistas
  const plantonistas = {
    "Escritório": [
      {
        nome: "Claudia Martins",
        cargo: "Assistente Administrativo",
        email: "claudia@empresa.com",
        celular: "(11) 94444-4444"
      },
      {
        nome: "Roberto Alves",
        cargo: "Coordenador Logístico",
        email: "roberto@empresa.com",
        celular: "(11) 93333-3333"
      }
    ],
    "Suporte Técnico": [
      {
        nome: "Fernanda Lima",
        cargo: "Líder de Suporte",
        email: "fernanda@empresa.com",
        celular: "(11) 96666-6666"
      },
      {
        nome: "Pedro Rocha",
        cargo: "Técnico de Suporte",
        email: "pedro@empresa.com",
        celular: "(11) 95555-5555"
      },
      {
        nome: "Mariana Costa",
        cargo: "Técnico de Suporte Júnior",
        email: "mariana@empresa.com",
        celular: "(11) 92222-2222"
      }
    ],
    "Rede Externa": [
      {
        nome: "Ricardo Oliveira",
        cargo: "Técnico de Campo Sênior",
        email: "ricardo@empresa.com",
        celular: "(11) 97777-7777"
      },
      {
        nome: "Amanda Silva",
        cargo: "Técnica de Fibra Óptica",
        email: "amanda@empresa.com",
        celular: "(11) 98888-8888"
      },
      {
        nome: "Gustavo Santos",
        cargo: "Assistente de Instalações",
        email: "gustavo@empresa.com",
        celular: "(11) 91111-1111"
      }
    ]
  };

  return (
    <Layout
      title="Dashboard"
      content={
        <div>

           {/* Seção de Plantonistas */}
           <Container fluid className="mt-4">
                <h5 className="mb-4">
                    <FontAwesomeIcon icon={faSitemap} className="me-2" />
                    Equipes de Plantão 15/02/2025 Até 16/02/2025
                </h5>
                
                {Object.entries(plantonistas).map(([equipe, membros]) => (
                    <PlantonistasPorEquipe
                    key={equipe}
                    titulo={equipe}
                    plantonistas={membros}
                    />
                ))}
            </Container>

          {/* Seção de Cards */}
          <Container fluid className="mt-4">
            <Row>
              {[
                { title: 'Visitas', value: '2.4k', icon: faUser },
                { title: 'Vendas', value: '$24k', icon: faChartColumn },
                { title: 'Pedidos', value: '1.2k', icon: faBox },
                { title: 'Receita', value: '$48k', icon: faFile },
              ].map((item, index) => (
                <Col key={index} lg={3} md={6} className="mb-4">
                  <CardSimples
                    icon={item.icon}
                    title={item.title}
                    value={item.value}
                  />
                </Col>
              ))}
            </Row>
          </Container>

          {/* Seção de Gráficos Lado a Lado */}
          <Container fluid className="mt-4">
            <Row>
              <Col md={6} className="mb-4">
                <BarChartComponent 
                  title="Desempenho Mensal"
                  data={chartData}
                />
              </Col>
              <Col md={6} className="mb-4">
                <LineChartComponent 
                  title="Evolução Mensal"
                  data={chartData}
                />
              </Col>
            </Row>
          </Container>
        </div>
      }
    />
  );
};

export default Dashboard;