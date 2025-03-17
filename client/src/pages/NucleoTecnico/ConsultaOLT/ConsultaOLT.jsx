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
  faExclamationTriangle,
  faCheckCircle,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthValidation from '../../../hooks/useAuthValidation';
import Layout from "../../../components/Layout/Layout";
import TabelaPaginada from "../../../components/Table/TabelaPaginada";
import Loading from '../../../components/Loading/Loading';
import './ConsultaOLT.css';

const ConsultaOLT = () => {
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    oltHostname: '',
    codigo: ''
  });
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [consultaDetalhada, setConsultaDetalhada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [olts, setOlts] = useState([]);
  const [novaConsulta, setNovaConsulta] = useState({
    codigo: '',
    oltHostname: '', 
    contrato: '', 
    resumo: '', 
    abordagem: '', 
    condominio: '', 
    nomeCond: '', 
    causa: '', 
    solucao: '', 
    site: '', 
    dtCriacao: new Date().toISOString().split('T')[0], // Data atual
    dtEncerramento: '' 
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Validações: módulo 3 (Núcleo Técnico), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(3, 4, 1);

  useEffect(() => {
    const carregarConsultas = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar consultas');
        
        const data = await response.json();

        setConsultas(data);
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

  const opcoesResumo = [
    "Abalroamento",
    "AC",
    "Acesso",
    "Acidente",
    "Animais",
    "Ataque roedores",
    "Atenuação",
    "Carga Alta",
    "Corte Terceiros",
    "Degradação",
    "Descarga elétrica",
    "Desconhecida",
    "Falha de Placa",
    "Falha HL4",
    "Falta de energia",
    "Fibra Invertida",
    "Fibra Quebrada",
    "FLAP HL4",
    "Furto OLT",
    "HL3 Jaguare",
    "Improcedente",
    "Infra",
    "Interface Hl3",
    "Levantar",
    "Migração",
    "Normalizado s/ Reparo",
    "Obras",
    "Obras Terceiros",
    "Outros",
    "Placa",
    "Poda de Árvore",
    "Queda de Árvore",
    "Queda Energia Central",
    "Queimadas",
    "Reinicio Espontaneo",
    "Software",
    "Teste Janela Jorn",
    "TPL",
    "Troca Poste",
    "Vandalismo"
  ];

  const limparFormulario = () => {
    setNovaConsulta({
      codigo: '',
      oltHostname: '',
      contrato: '',
      resumo: '',
      abordagem: '',
      condominio: '',
      nomeCond: '',
      causa: '',
      solucao: '',
      site: '',
      dtCriacao: new Date().toISOString().split('T')[0],
      dtEncerramento: ''
    });
  };

  const handleCriarConsulta = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaConsulta),
      });
  
      if (!response.ok) throw new Error('Erro ao cadastrar consulta');
      
      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');

      const novaConsultaCriada = await responseConsultas.json();
      setConsultas(novaConsultaCriada); 
      setShowNovoModal(false);
  
      // Redefina o estado de novaConsulta
      limparFormulario()

    } catch (error) {
      setErro(error.message);
    }
  };

  const formatDateTimeForInput = (datetime) => {
    if (!datetime) return ''; 
    return datetime.replace(' ', 'T').slice(0, 16); 
  };

  const handleSalvarEdicao = async () => {
    const dadosParaEnviar = {
      ...consultaEditando,
      dtCriacao: consultaEditando.dtCriacao || null,
      dtEncerramento: consultaEditando.dtEncerramento || null,
    };
  
    try {
      // 1. Salva a edição
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/editar/${consultaEditando.codigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      });
  
      if (!response.ok) throw new Error('Erro ao salvar edição');
  
      // 2. Recarrega a lista de consultas do backend
      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
  
      // 3. Atualiza a lista de consultas
      setConsultas(consultasAtualizadas);
      setShowEditarModal(false);
    } catch (error) {
      setErro(error.message);
    }
  };

  const abrirModalEdicao = async (consulta) => {
    try {
      const codigo = consulta.CODIGO; // Extrai o código da consulta
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar/${codigo}`);
      
      if (!response.ok) throw new Error('Erro ao carregar consulta para edição');
      
      const dadosConsulta = await response.json();
      
      // Mapeamento dos campos
      setConsultaEditando({
        codigo: dadosConsulta.CODIGO,
        oltHostname: dadosConsulta.OLT_HOSTNAME,
        contrato: dadosConsulta.CONTRATO,
        resumo: dadosConsulta.RESUMO,
        abordagem: dadosConsulta.ABORDAGEM,
        condominio: dadosConsulta.CONDOMINIO,
        nomeCond: dadosConsulta.NOME_COND,
        causa: dadosConsulta.CAUSA,
        solucao: dadosConsulta.SOLUCAO,
        site: dadosConsulta.SITE,
        dtCriacao: dadosConsulta.DT_CRIACAO,
        dtEncerramento: dadosConsulta.DT_ENCERRAMENTO
      });
      
      setShowEditarModal(true);
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleExcluirConsulta = async (codigo) => {
    if (!window.confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/excluir/${codigo}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir consulta');

      const responseConsultas = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
      if (!responseConsultas.ok) throw new Error('Erro ao carregar consultas');
  
      const consultasAtualizadas = await responseConsultas.json();
      
      setConsultas(consultasAtualizadas);
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Faz a requisição para buscar os dados
      const response = await fetch(`${import.meta.env.VITE_API_URL}/nucleo-tecnico/buscar`);
      if (!response.ok) throw new Error('Erro ao carregar consultas');
  
      const data = await response.json();
  
      // Verifica se há dados
      if (data.length === 0) {
        alert('Nenhum dado disponível para download.');
        return;
      }
  
      // Remove as colunas DT_CRIACAO e DT_ENCERRAMENTO dos dados
      const dadosFiltrados = data.map(consulta => {
        const { DT_CRIACAO, DT_ENCERRAMENTO, ...resto } = consulta;
        return resto;
      });
  
      // Converte os dados filtrados para CSV usando PapaParse
      const csv = Papa.unparse(dadosFiltrados, {
        delimiter: ";", // Define o delimitador como ";"
        quotes: true,   // Adiciona aspas aos valores
        header: true,   // Inclui o cabeçalho
        encoding: "UTF-8" // Define o encoding como UTF-8
      });
  
      // Cria um blob com o conteúdo CSV
      const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' });
  
      // Cria um link para download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'consultas_olt.csv';
      link.click();
  
      // Libera o objeto URL
      URL.revokeObjectURL(link.href);
    } catch (error) {
      setErro(error.message);
    }
  };

  const consultasFiltradas = consultas.filter(consulta => {
    if (!consulta) return false; // Verifica se consulta é undefined
  
    // Filtro por pesquisa geral (em todos os campos)
    if (filtro.pesquisa) {
      const campos = [
        consulta.OLT_HOSTNAME || '',
        consulta.CONTRATO || '',
        consulta.RESUMO || '',
        consulta.ABORDAGEM || '',
        consulta.CONDOMINIO || '',
        consulta.NOME_COND || '',
        consulta.CAUSA || '',
        consulta.SOLUCAO || '',
        consulta.SITE || '',
        consulta.CODIGO?.toString() || ''
      ];
  
      const pesquisaMatch = campos.some(campo => 
        campo.toLowerCase().includes(filtro.pesquisa.toLowerCase())
      );
  
      if (!pesquisaMatch) return false;
    }
  
    // Filtro por OLT Hostname
    if (filtro.oltHostname && consulta.OLT_HOSTNAME !== filtro.oltHostname) {
      return false;
    }
  
    // Filtro por Código
    if (filtro.codigo && consulta.CODIGO !== filtro.codigo) {
      return false;
    }
    // Filtro por Contrato
    if (filtro.contrato && consulta.CONTRATO !== filtro.contrato) {
        return false;
      }
    return true;
  });


  const colunas = [
    { chave: 'CODIGO', titulo: 'TA', formato: (valor) => <Badge bg="secondary">{valor || "N/A"}</Badge> },
    { chave: 'OLT_HOSTNAME', titulo: 'OLT' },
    { chave: 'CONTRATO', titulo: 'Contrato' },
    { chave: 'DT_CRIACAO_FT', titulo: 'Criação' },
    { chave: 'DT_ENCERRAMENTO_FT', titulo: 'Encerramento' },
    { chave: 'RESUMO', titulo: 'Resumo' },
    { chave: 'ABORDAGEM', titulo: 'Abordagem' },
    {
      chave: 'CONDOMINIO',
      titulo: 'Condomínio',
      formato: (valor) => (
        <Badge bg={valor === 'SIM' ? 'success' : valor === 'NÃO' ? 'danger' : 'secondary'}>
          {valor || "N/A"}
        </Badge>
      ),
    },
    {
      chave: 'SITE',
      titulo: 'Site',
      formato: (valor) => (
        <Badge bg={valor === 'SIM' ? 'success' : valor === 'NÃO' ? 'danger' : 'secondary'}>
          {valor || "N/A"}
        </Badge>
      ),
    },
  ];


  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title="Consultas OLT"
      content={
        <Container fluid className="consulta-olt-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-4 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Pesquisar por TA, OLT ou Contrato"
                    value={filtro.pesquisa}
                    onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
            {permissions.canEdit && (
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

          <Row>
          <Col>
            <TabelaPaginada
              dados={consultasFiltradas}
              colunas={colunas}
              onEditar={abrirModalEdicao}
              onExcluir={(item) => handleExcluirConsulta(item.CODIGO)}
              onDetalhes={(item) => {
                setConsultaDetalhada(item);
                setShowDetalhesModal(true);
              }}
              permissoes={permissions}
            />
          </Col>
        </Row>

          {/* Modal Detalhes */}

          <Modal show={showDetalhesModal} onHide={() => setShowDetalhesModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Detalhes da TA - {consultaDetalhada ? consultaDetalhada.CODIGO : "N/A"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {consultaDetalhada ? ( // Verifica se consultaDetalhada não é null/undefined
                <div>
                    {/* Parte Superior: Informações Gerais */}
                    <Row>
                    <Col md={6}>
                        <p><strong>TA:</strong> {consultaDetalhada.CODIGO || "N/A"}</p>
                        <p><strong>OLT:</strong> {consultaDetalhada.OLT_HOSTNAME || "N/A"}</p>
                        <p><strong>Contrato:</strong> {consultaDetalhada.CONTRATO || "N/A"}</p>
                        <p><strong>Resumo:</strong> {consultaDetalhada.RESUMO || "N/A"}</p>
                        <p><strong>Abordagem:</strong> {consultaDetalhada.ABORDAGEM || "N/A"}</p>
                    </Col>
                    <Col md={6}>
                        <p><strong>Condomínio: </strong>
                            <Badge bg={
                                consultaDetalhada.CONDOMINIO === 'SIM' ? 'success' : 
                                consultaDetalhada.CONDOMINIO === 'NÃO' ? 'danger' : 'secondary'
                            }>
                                {consultaDetalhada.CONDOMINIO || "N/A"}
                            </Badge>
                        </p>
                        <p><strong>Site: </strong>
                            <Badge bg={
                                consultaDetalhada.SITE === 'SIM' ? 'success' : 
                                consultaDetalhada.SITE === 'NÃO' ? 'danger' : 'secondary'
                            }>
                                {consultaDetalhada.SITE || "N/A"}
                            </Badge>
                        </p>
                        <p><strong>Data de Criação:</strong> {consultaDetalhada.DT_CRIACAO_FT || "N/A"}</p>
                        <p><strong>Data de Encerramento:</strong> {consultaDetalhada.DT_ENCERRAMENTO_FT || "N/A"}</p>
                    </Col>
                    </Row>

                    {/* Parte Inferior: Causa e Solução */}
                    <Row > 
                    <Col md={6}>
                        <p><strong>Nome do Condomínio:</strong> {consultaDetalhada.NOME_COND || "N/A"}</p>
                    </Col>
                    </Row>
                    <Row className="causa-solucao">
                    <Col>
                        <h6 className="causa-title"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Causa</h6>
                        <p className="descricao">{consultaDetalhada.CAUSA || "N/A"}</p>
                    </Col>
                    <Col>
                        <h6 className="solucao-title"><FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Solução</h6>
                        <p className="descricao">{consultaDetalhada.SOLUCAO || "N/A"}</p>
                    </Col>
                    </Row>
                </div>
                ) : (
                <p>Nenhuma consulta selecionada.</p> // Mensagem de fallback
                )}
            </Modal.Body>
            </Modal>

          {/* Modal de Edição */}
          <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Editar Consulta OLT
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {consultaEditando && (
                <Form>
                  <Row>
                    <Col md={6}>

                    <Form.Group className="mb-3">
                        <Form.Label>TA (Código)</Form.Label>
                        <Form.Control
                            type="number"
                            value={consultaEditando.codigo}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>OLT Hostname</Form.Label>
                        <Select
                            options={olts.map((olt) => ({ value: olt.OLT, label: olt.OLT }))}
                            value={{ value: consultaEditando.oltHostname, label: consultaEditando.oltHostname }}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, oltHostname: selectedOption.value })
                            }
                            placeholder="Selecione uma OLT"
                            isSearchable
                        />
                    </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Contrato</Form.Label>
                        <Form.Select
                          value={consultaEditando.contrato}
                          onChange={(e) => setConsultaEditando({...consultaEditando, contrato: e.target.value})}
                        >
                          <option value="">Selecione um Contrato</option> 
                          <option value="JUNDIAI">Jundiaí</option>
                          <option value="CAMPINAS">Campinas</option>
                          <option value="INTERIOR">Interior</option>
                          <option value="OSASCO">Osasco</option>
                          <option value="SJC">São Jose dos Campos</option>
                          <option value="PC_SC">Piracicaba/Sorocaba</option>
                          
                        </Form.Select>
                      </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Resumo</Form.Label>
                        <Select
                            options={opcoesResumo.map((resumo) => ({ value: resumo, label: resumo }))}
                            value={{ value: consultaEditando.resumo, label: consultaEditando.resumo }}
                            onChange={(selectedOption) =>
                            setConsultaEditando({ ...consultaEditando, resumo: selectedOption.value })
                            }
                            placeholder="Selecione um Resumo"
                            isSearchable
                        />
                    </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Data de Criação</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={formatDateTimeForInput(consultaEditando.dtCriacao)}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, dtCriacao: e.target.value.replace('T', ' ') })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Data de Encerramento</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={formatDateTimeForInput(consultaEditando.dtEncerramento)}
                            onChange={(e) => setConsultaEditando({ ...consultaEditando, dtEncerramento: e.target.value.replace('T', ' ') })}
                        />
                        </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Abordagem</Form.Label>
                        <Form.Select
                          value={consultaEditando.abordagem}
                          onChange={(e) => setConsultaEditando({...consultaEditando, abordagem: e.target.value})}
                        >
                          <option value="">Selecione uma Abordagem</option> 
                          <option value="DUPLA ABORDAGEM">DUPLA ABORDAGEM</option>
                          <option value="FLAT">FLAT</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Condomínio</Form.Label>
                        <Form.Select
                          value={consultaEditando.condominio}
                          onChange={(e) => setConsultaEditando({...consultaEditando, condominio: e.target.value})}
                        >
                          <option value="">Selecione uma opção</option> 
                          <option value="SIM">SIM</option>
                          <option value="NÃO">NÃO</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Nome do Condomínio</Form.Label>
                        <Form.Control
                          value={consultaEditando.nomeCond}
                          onChange={(e) => setConsultaEditando({...consultaEditando, nomeCond: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Causa</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={consultaEditando.causa}
                          onChange={(e) => setConsultaEditando({...consultaEditando, causa: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Solução</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={consultaEditando.solucao}
                          onChange={(e) => setConsultaEditando({...consultaEditando, solucao: e.target.value})}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Site</Form.Label>
                        <Form.Select
                          value={consultaEditando.site}
                          onChange={(e) => setConsultaEditando({...consultaEditando, site: e.target.value})}
                        >
                          <option value="">Selecione uma opção</option> 
                          <option value="SIM">SIM</option>
                          <option value="NÃO">NÃO</option>
                        </Form.Select>
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
                Cadastrar TA
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>TA (Código)</Form.Label>
                        <Form.Control
                            type="number"
                            value={novaConsulta.codigo}
                            onChange={(e) => setNovaConsulta({...novaConsulta, codigo: e.target.value})}
                            placeholder="Digite o número da TA"
                            />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>OLT Hostname</Form.Label>
                    <Select
                        options={olts.map((olt) => ({ value: olt.OLT, label: olt.OLT }))}
                        value={{ value: novaConsulta.oltHostname, label: novaConsulta.oltHostname }}
                        onChange={(selectedOption) =>
                        setNovaConsulta({ ...novaConsulta, oltHostname: selectedOption.value })
                        }
                        placeholder="Selecione uma OLT"
                        isSearchable
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Contrato</Form.Label>
                      <Form.Select
                        value={novaConsulta.contrato}
                        onChange={(e) => setNovaConsulta({...novaConsulta, contrato: e.target.value})}
                      >
                        <option value="">Selecione um Contrato</option> 
                          <option value="JUNDIAI">Jundiaí</option>
                          <option value="CAMPINAS">Campinas</option>
                          <option value="INTERIOR">Interior</option>
                          <option value="OSASCO">Osasco</option>
                          <option value="SJC">São Jose dos Campos</option>
                          <option value="PC_SC">Piracicaba/Sorocaba</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Resumo</Form.Label>
                        <Select
                            options={opcoesResumo.map((resumo) => ({ value: resumo, label: resumo }))}
                            value={{ value: novaConsulta.resumo, label: novaConsulta.resumo }}
                            onChange={(selectedOption) =>
                            setNovaConsulta({ ...novaConsulta, resumo: selectedOption.value })
                            }
                            placeholder="Selecione um Resumo"
                            isSearchable
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Data de Criação</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={novaConsulta.dtCriacao}
                            onChange={(e) => setNovaConsulta({ ...novaConsulta, dtCriacao: e.target.value })}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Data de Encerramento</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={novaConsulta.dtEncerramento}
                            onChange={(e) => setNovaConsulta({ ...novaConsulta, dtEncerramento: e.target.value })}
                        />
                        </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Abordagem</Form.Label>
                      <Form.Select
                        value={novaConsulta.abordagem}
                        onChange={(e) => setNovaConsulta({...novaConsulta, abordagem: e.target.value})}
                      >
                        <option value="">Selecione uma opção</option> 
                        <option value="DUPLA ABORDAGEM">DUPLA ABORDAGEM</option>
                        <option value="FLAT">FLAT</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Condomínio</Form.Label>
                      <Form.Select
                        value={novaConsulta.condominio}
                        onChange={(e) => setNovaConsulta({...novaConsulta, condominio: e.target.value})}
                      >
                        <option value="">Selecione uma opção</option> 
                        <option value="SIM">SIM</option>
                        <option value="NÃO">NÃO</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nome do Condomínio</Form.Label>
                      <Form.Control
                        value={novaConsulta.nomeCond}
                        onChange={(e) => setNovaConsulta({...novaConsulta, nomeCond: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Causa</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaConsulta.causa}
                        onChange={(e) => setNovaConsulta({...novaConsulta, causa: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Solução</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={novaConsulta.solucao}
                        onChange={(e) => setNovaConsulta({...novaConsulta, solucao: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Site</Form.Label>
                      <Form.Select
                        value={novaConsulta.site}
                        onChange={(e) => setNovaConsulta({...novaConsulta, site: e.target.value})}
                      >
                        <option value="">Selecione uma opção</option> 
                        <option value="SIM">SIM</option>
                        <option value="NÃO">NÃO</option>
                      </Form.Select>
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

export default ConsultaOLT;