import { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Table, 
  Form, 
  InputGroup, 
  Button,
  Dropdown
} from 'react-bootstrap';
import { 
  faSearch,
  faFilter,
  faCalendarAlt,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import Layout from "../../components/Layout/Layout";
import './LogAplicacao.css';

const LogAplicacao = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('Todas');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 7 dias');

  // Dados mockados
  const logsData = [
    {
      id: 1,
      timestamp: '2023-08-20 14:30:45',
      usuario: 'carlos.silva',
      acao: 'Login',
      detalhes: 'Login bem-sucedido',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2023-08-20 14:35:22',
      usuario: 'ana.souza',
      acao: 'Alteração',
      detalhes: 'Atualizou ordem de serviço #1234',
      ip: '192.168.1.101'
    },
    {
      id: 3,
      timestamp: '2023-08-20 15:00:15',
      usuario: 'admin',
      acao: 'Exclusão',
      detalhes: 'Removeu usuário #45',
      ip: '192.168.1.102'
    }
  ];

  // Dados para o gráfico
  const chartData = [
    { name: '01/08', logins: 40, alteracoes: 24, exclusoes: 12 },
    { name: '02/08', logins: 30, alteracoes: 13, exclusoes: 8 },
    { name: '03/08', logins: 20, alteracoes: 18, exclusoes: 5 },
    { name: '04/08', logins: 27, alteracoes: 19, exclusoes: 3 },
    { name: '05/08', logins: 18, alteracoes: 22, exclusoes: 7 },
    { name: '06/08', logins: 23, alteracoes: 15, exclusoes: 9 },
    { name: '07/08', logins: 34, alteracoes: 20, exclusoes: 11 }
  ];

  // Filtragem dos logs
  const filteredLogs = logsData.filter(log => {
    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.detalhes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'Todas' || log.acao === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  return (
    <Layout
      title="Logs da Aplicação"
      content={
        <Container fluid className="log-container">
          {/* Filtros */}
          <Row className="mb-4 filters-section">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Pesquisar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={4}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Ação: {selectedAction}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSelectedAction('Todas')}>Todas</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Login')}>Login</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Alteração')}>Alteração</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Exclusão')}>Exclusão</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            <Col md={4}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Período: {selectedPeriod}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSelectedPeriod('Últimos 7 dias')}>Últimos 7 dias</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedPeriod('Últimos 30 dias')}>Últimos 30 dias</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedPeriod('Últimos 90 dias')}>Últimos 90 dias</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {/* Gráfico */}
          <Row className="mb-4 chart-section">
            <Col>
              <div className="chart-container">
                <h5 className="mb-3">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />
                  Atividade de Logs
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="alteracoes" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="exclusoes" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          {/* Tabela de Logs */}
          <Row>
            <Col>
              <div className="table-responsive">
                <Table striped hover className="logs-table">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Usuário</th>
                      <th>Ação</th>
                      <th>Detalhes</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id}>
                        <td>{log.timestamp}</td>
                        <td>{log.usuario}</td>
                        <td>
                          <span className={`badge ${log.acao.toLowerCase()}`}>
                            {log.acao}
                          </span>
                        </td>
                        <td>{log.detalhes}</td>
                        <td>{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </Container>
      }
    />
  );
};

export default LogAplicacao;