import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  InputGroup, 
  Button,
  Dropdown,
  Badge
} from 'react-bootstrap';
import { 
  faSearch,
  faFilter,
  faCalendarAlt,
  faChartLine,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthValidation from '../../hooks/useAuthValidation';
import Layout from "../../components/Layout/Layout";
import Loading from '../../components/Loading/Loading';
import TabelaPaginada from "../../components/Table/TabelaPaginada";
import './LogAplicacao.css';
import axios from 'axios';

const LogAplicacao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('Todas');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 7 dias');
  const [logsData, setLogsData] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [logDetalhado, setLogDetalhado] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);

  const { loading, user, permissions } = useAuthValidation(5, null, 1);

  // Definir as colunas para a TabelaPaginada
  const colunas = [
    { 
      chave: 'DataHora', 
      titulo: 'Data/Hora', 
      formato: (valor) => {
          const date = new Date(valor);
          return date.toLocaleString('pt-BR');
      }
    },
    { chave: 'UsuarioID', titulo: 'RE' },
    { chave: 'UsuarioNome', titulo: 'Nome' },
    { 
      chave: 'Acao', 
      titulo: 'Ação',
      formato: (valor) => (
        <Badge bg={getBadgeColor(valor)}>
          {valor}
        </Badge>
      )
    },
    { chave: 'Detalhes', titulo: 'Detalhes' },
    { chave: 'IP', titulo: 'IP' }
  ];

  // Função para determinar a cor do badge baseado na ação
  const getBadgeColor = (acao) => {
    if (acao.includes('Login')) return 'success';
    if (acao.includes('Alteração') || acao.includes('Editar')) return 'warning';
    if (acao.includes('Excluir')) return 'danger';
    if (acao.includes('Error')) return 'danger';
    if (acao.includes('Logoff')) return 'danger';
    if (acao.includes('Consulta')) return 'warning';
    if (acao.includes('Cadastrar')) return 'success';
    if (acao.includes('Envio')) return 'primary';
    return 'secondary';
  };

  // Buscar logs da API
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/logs/buscar`);
      
      if (response.data && response.data.sucesso) {
        let dadosFiltrados = response.data.dados;

        // Aplicar filtro de ação
        if (selectedAction !== 'Todas') {
          dadosFiltrados = dadosFiltrados.filter(log => 
            log.Acao.includes(selectedAction)
          );
        }

        // Aplicar filtro de período
        const hoje = new Date();
        let dataLimite = new Date();
        
        switch (selectedPeriod) {
          case 'Últimos 7 dias':
            dataLimite.setDate(hoje.getDate() - 7);
            break;
          case 'Últimos 30 dias':
            dataLimite.setDate(hoje.getDate() - 30);
            break;
          case 'Últimos 90 dias':
            dataLimite.setDate(hoje.getDate() - 90);
            break;
          default:
            dataLimite.setDate(hoje.getDate() - 7);
        }

        dadosFiltrados = dadosFiltrados.filter(log => {
          const dataLog = new Date(log.DataHora);
          return dataLog >= dataLimite;
        });

        // Aplicar filtro de busca
        if (searchTerm) {
          const termo = searchTerm.toLowerCase();
          dadosFiltrados = dadosFiltrados.filter(log => 
            (log.Acao && log.Acao.toLowerCase().includes(termo)) ||
            (log.Detalhes && log.Detalhes.toLowerCase().includes(termo)) ||
            (log.IP && log.IP.toLowerCase().includes(termo))
          );
        }

        setLogsData(dadosFiltrados);
        generateChartData(dadosFiltrados);
      } else {
        throw new Error('Estrutura de dados inválida na resposta da API');
      }
    } catch (err) {
      setError(err.response?.data?.mensagem || err.message || 'Erro ao carregar logs');
      console.error('Erro ao buscar logs:', err);
      setLogsData([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Gerar dados para o gráfico
// Gerar dados para o gráfico (mantendo a ordem original)
const generateChartData = (logs) => {
  if (!logs || logs.length === 0) {
    setChartData([]);
    return;
  }

  const groupedData = logs.reduce((acc, log) => {
    const date = new Date(log.DataHora);
    date.setHours(date.getHours() - 3);
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    if (!acc[dateStr]) {
      acc[dateStr] = { 
        date: dateStr, 
        login: 0, 
        consulta: 0,
        envio: 0,
        editar: 0,
        cadastrar: 0,
        excluir: 0,
        erro: 0,
        logoff: 0,
        rawDate: date // Adicionamos a data completa para ordenação
      };
    }
    
    if (log.Acao.includes('Login')) acc[dateStr].login++;
    if (log.Acao.includes('Consulta')) acc[dateStr].consulta++;
    if (log.Acao.includes('Envio')) acc[dateStr].envio++;
    if (log.Acao.includes('Editar')) acc[dateStr].editar++;
    if (log.Acao.includes('Cadastrar')) acc[dateStr].cadastrar++;
    if (log.Acao.includes('Excluir')) acc[dateStr].excluir++;
    if (log.Acao.includes('Erro')) acc[dateStr].erro++;
    if (log.Acao.includes('Logoff')) acc[dateStr].logoff++;
    
    return acc;
  }, {});

  // Converter para array, ordenar por data e pegar os últimos 7 dias
  const sortedData = Object.values(groupedData)
    .sort((a, b) => a.rawDate - b.rawDate)
    .slice(-7);

  setChartData(sortedData);
};

  // Carregar dados iniciais
  useEffect(() => {
    if (permissions.canRead) {
      fetchLogs();
    }
  }, [permissions.canRead]);

  // Atualizar quando filtros mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      if (permissions.canRead) {
        fetchLogs();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedAction, selectedPeriod]);

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página.</div>;
  }

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
                  <Dropdown.Item onClick={() => setSelectedAction('Consulta')}>Consulta</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Envio')}>Envio</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Editar')}>Editar</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Cadastrar')}>Cadastrar</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Excluir')}>Excluir</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedAction('Erro')}>Erro</Dropdown.Item>
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Atividade de Logs
                  </h5>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => fetchLogs()}
                    disabled={loadingLogs}
                  >
                    <FontAwesomeIcon icon={faSync} spin={loadingLogs} />
                  </Button>
                </div>
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" reversed={false}/>
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="login" 
                      stroke="#28a745" // Verde (success)
                      strokeWidth={2}
                      name="Login"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consulta" 
                      stroke="#17a2b8" // Azul claro (info)
                      strokeWidth={2}
                      name="Consultas"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="envio" 
                      stroke="#007bff" // Azul (primary)
                      strokeWidth={2}
                      name="Envios"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="editar" 
                      stroke="#ffc107" // Amarelo (warning)
                      strokeWidth={2}
                      name="Edições"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cadastrar" 
                      stroke="#28a745" // Verde (success)
                      strokeWidth={2}
                      name="Cadastros"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="excluir" 
                      stroke="#dc3545" // Vermelho (danger)
                      strokeWidth={2}
                      name="Exclusões"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="erro" 
                      stroke="#dc3545" // Vermelho (danger)
                      strokeWidth={2}
                      name="Erros"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="logoff" 
                      stroke="#6c757d" // Cinza (secondary)
                      strokeWidth={2}
                      name="Logoffs"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  {loadingLogs ? 'Carregando...' : 'Nenhum dado disponível para o gráfico'}
                </div>
              )}
              </div>
            </Col>
          </Row>

          {/* Tabela de Logs */}
          <Row>
            <Col>
              {error && (
                <div className="alert alert-danger">
                  {error}
                  <Button variant="link" onClick={() => fetchLogs()}>
                    Tentar novamente
                  </Button>
                </div>
              )}
              
              <TabelaPaginada
                dados={logsData}
                colunas={colunas}
                permissoes={permissions}
                mostrarAcoes={false} // Adicione esta propriedade
              />
            </Col>
          </Row>

          {/* Modal de Detalhes (opcional) */}
          {showDetalhesModal && logDetalhado && (
            <Modal show={showDetalhesModal} onHide={() => setShowDetalhesModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Detalhes do Log</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <p><strong>ID:</strong> {logDetalhado.ID}</p>
                  <p><strong>Usuário ID:</strong> {logDetalhado.UsuarioID}</p>
                  <p><strong>Ação:</strong> <Badge bg={getBadgeColor(logDetalhado.Acao)}>{logDetalhado.Acao}</Badge></p>
                  <p><strong>Data/Hora:</strong> {new Date(logDetalhado.DataHora).toLocaleString('pt-BR')}</p>
                  <p><strong>IP:</strong> {logDetalhado.IP}</p>
                  <p><strong>Detalhes:</strong></p>
                  <pre>{JSON.stringify(logDetalhado.Detalhes, null, 2)}</pre>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDetalhesModal(false)}>
                  Fechar
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </Container>
      }
    />
  );
};

export default LogAplicacao;