import { Container, Row, Col } from 'react-bootstrap';
import { 
  faUser, 
  faChartColumn,
  faBox,
  faFile
} from '@fortawesome/free-solid-svg-icons';

import Layout from "../../components/Layout/Layout";
import CardSimples from "../../components/Cards/CardSimples/CardSimples";
import BarChartComponent from '../../components/Charts/BarChartComponent';
import LineChartComponent from '../../components/Charts/LineChartComponent';
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

  return (
    <Layout
      title="Dashboard"
      content={
        <div>
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