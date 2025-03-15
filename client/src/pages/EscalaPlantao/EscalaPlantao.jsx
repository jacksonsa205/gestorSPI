import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Table, 
  Button, 
  Modal, 
  Form,
  Badge,
  InputGroup,
  Accordion
} from 'react-bootstrap';
import { 
  faCalendarAlt,
  faUserPlus,
  faUsers,
  faSearch,
  faUserGroup,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAuthValidation from '../../hooks/useAuthValidation';
import Layout from "../../components/Layout/Layout";
import Loading from '../../components/Loading/Loading';
import './EscalaPlantao.css';

// Dados mockados
const initialEscalas = [{
  id: 1,
  inicio: '2023-08-01',
  fim: '2023-08-07',
  equipes: {
    'Escritório': ['João', 'Marcos', 'José'],
    'Suporte': ['Maria', 'Felipe']
  }
}];

const teams = {
  'Escritório': ['João', 'Marcos', 'José'],
  'Suporte': ['Maria', 'Felipe', 'Gustavo'],
  'Campo': ['Paulo', 'Marcelo', 'Monica']
};

const EscalaPlantao = () => {
  
  // Estados
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [escalas, setEscalas] = useState(initialEscalas);
  const [activeAccordionKeys, setActiveAccordionKeys] = useState([Object.keys(teams)[0]]);
  const [editingId, setEditingId] = useState(null);

  // Efeito para carregar dados ao editar
  useEffect(() => {
    if (editingId !== null) {
      const escalaToEdit = escalas.find(e => e.id === editingId);
      if (escalaToEdit) {
        setStartDate(new Date(escalaToEdit.inicio));
        setEndDate(new Date(escalaToEdit.fim));
        setSelectedTeams(escalaToEdit.equipes);
        
        // Abrir accordion das equipes com membros selecionados
        const teamsWithMembers = Object.keys(escalaToEdit.equipes);
        setActiveAccordionKeys(teamsWithMembers);
      }
    }
  }, [editingId]);

  const { loading, user, permissions } = useAuthValidation(6, null, 1);

  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    
    return <div>Você não tem permissão...</div>;
  }

  // Handlers
  const handleTeamSelect = (teamName, member) => {
    setSelectedTeams(prev => {
      const newSelection = { ...prev };
      newSelection[teamName] = [...(newSelection[teamName] || [])];
      
      const memberIndex = newSelection[teamName].indexOf(member);
      if (memberIndex > -1) {
        newSelection[teamName].splice(memberIndex, 1);
      } else {
        newSelection[teamName].push(member);
      }

      if (newSelection[teamName].length === 0) {
        delete newSelection[teamName];
      }

      return newSelection;
    });
  };

  const handleSubmit = () => {
    const novaEscala = {
      id: editingId || escalas.length + 1,
      inicio: startDate.toISOString().split('T')[0],
      fim: endDate.toISOString().split('T')[0],
      equipes: selectedTeams
    };

    if (editingId) {
      setEscalas(escalas.map(e => e.id === editingId ? novaEscala : e));
    } else {
      setEscalas([...escalas, novaEscala]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setEscalas(escalas.filter(e => e.id !== id));
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSelectedTeams({});
    setStartDate(null);
    setEndDate(null);
    setActiveAccordionKeys([Object.keys(teams)[0]]);
  };

  const handleAccordionToggle = (keys) => {
    setActiveAccordionKeys(keys);
  };

  // Componentes auxiliares
  const DateInput = ({ label, selectedDate, onChange, isStartDate }) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        className="form-control"
        selectsStart={isStartDate}
        selectsEnd={!isStartDate}
        startDate={isStartDate ? startDate : null}
        endDate={isStartDate ? null : endDate}
        minDate={isStartDate ? null : startDate}
        required
      />
    </Form.Group>
  );

  const TeamAccordionItem = ({ teamName, members }) => (
    <Accordion.Item eventKey={teamName}>
      <Accordion.Header>
        <FontAwesomeIcon icon={faUserGroup} className="me-2" />
        {teamName} ({members.length} membros)
      </Accordion.Header>
      <Accordion.Body>
        <div className="escala-team-members">
          {members.map(member => (
            <div 
              key={`${teamName}-${member}`}
              className={`escala-member-card ${
                selectedTeams[teamName]?.includes(member) ? 'selected' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleTeamSelect(teamName, member);
              }}
            >
              <span>{member}</span>
              <Form.Check 
                type="checkbox"
                checked={selectedTeams[teamName]?.includes(member) || false}
                readOnly
              />
            </div>
          ))}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );

  const TeamSelector = () => (
    <Accordion 
      activeKey={activeAccordionKeys}
      onSelect={handleAccordionToggle}
      alwaysOpen
    >
      {Object.entries(teams).map(([teamName, members]) => (
        <TeamAccordionItem 
          key={teamName}
          teamName={teamName}
          members={members}
        />
      ))}
    </Accordion>
  );

  // Cálculos
  const filteredEscalas = escalas.filter(escala => 
    escala.inicio.includes(searchTerm) || 
    escala.fim.includes(searchTerm)
  );

  const totalSelected = Object.values(selectedTeams).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <Layout
      title="Escala de Plantão"
      content={
        <Container fluid className="escala-container">
          {/* Header */}
          <Row className="mb-4 align-items-center escala-header">
            <Col md={8}>
              <h2 className="escala-title">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Gerenciamento de Escalas
              </h2>
            </Col>
            <Col md={4} className="text-end">
              <Button 
                variant="primary" 
                onClick={() => setShowModal(true)}
                className="escala-add-button"
              >
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                {editingId ? 'Editar Escala' : 'Nova Escala'}
              </Button>
            </Col>
          </Row>

          {/* Filtro */}
          <Row className="mb-4 escala-filter">
            <Col md={4}>
              <InputGroup className="escala-search">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Filtrar por data (YYYY-MM-DD)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Tabela */}
          <Row>
            <Col>
              <Table striped hover responsive className="escala-table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Duração</th>
                    <th>Equipes</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEscalas.map(escala => (
                    <tr key={escala.id} className="escala-row">
                      <td>
                        {new Date(escala.inicio).toLocaleDateString()} - 
                        {new Date(escala.fim).toLocaleDateString()}
                      </td>
                      <td>
                        {Math.ceil(
                          (new Date(escala.fim) - new Date(escala.inicio)) / 
                          (1000 * 60 * 60 * 24)
                        )} dias
                      </td>
                      <td>
                        {Object.entries(escala.equipes).map(([team, members]) => (
                          <div key={team} className="mb-2">
                            <Badge bg="info" className="me-2 escala-team-badge">
                              {team}
                            </Badge>
                            {members.map((member, index) => (
                              <Badge key={index} bg="secondary" className="me-1 escala-member-badge">
                                {member}
                              </Badge>
                            ))}
                          </div>
                        ))}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2 escala-action-button"
                          onClick={() => handleEdit(escala.id)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="escala-action-button"
                          onClick={() => handleDelete(escala.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* Modal */}
          <Modal show={showModal} onHide={handleCloseModal} size="lg" className="escala-modal">
            <Modal.Header closeButton className="escala-modal-header">
              <Modal.Title className="escala-modal-title">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                {editingId ? 'Editar Escala' : 'Nova Escala de Plantão'}
              </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="escala-modal-body">
              <Form>
                <Row className="mb-4 escala-date-pickers">
                  <Col md={6}>
                    <DateInput
                      label="Data Início"
                      selectedDate={startDate}
                      onChange={setStartDate}
                      isStartDate={true}
                    />
                  </Col>
                  <Col md={6}>
                    <DateInput
                      label="Data Fim"
                      selectedDate={endDate}
                      onChange={setEndDate}
                      isStartDate={false}
                    />
                  </Col>
                </Row>

                <Form.Group className="escala-team-selection">
                  <Form.Label className="mb-3">
                    Selecione as Equipes e Membros ({totalSelected} selecionados)
                  </Form.Label>
                  <TeamSelector />
                </Form.Group>
              </Form>
            </Modal.Body>

            <Modal.Footer className="escala-modal-footer">
              <Button 
                variant="secondary" 
                onClick={handleCloseModal}
                className="escala-modal-cancel"
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={!startDate || !endDate || totalSelected === 0}
                className="escala-modal-save"
              >
                {editingId ? 'Atualizar Escala' : 'Salvar Escala'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      }
    />
  );
};

export default EscalaPlantao;