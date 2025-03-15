// components/CardEtapas.js
import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import './CardEtapas.css';

const etapasConfig = [
  { 
    etapa: 'PENDENTE', 
    cor: '#dc3545', 
    label: 'Pendente',
    icone: faClock,
    gradient: ['#ff758c', '#ff7eb3']
  },
  { 
    etapa: 'PRIORIZADA', 
    cor: '#E97132', 
    label: 'Priorizada',
    icone: faExclamationTriangle,
    gradient: ['#ff9a44', '#ff6e68']
  },
  { 
    etapa: 'CANCELADA', 
    cor: '#6c757d', 
    label: 'Cancelada',
    icone: faTimesCircle,
    gradient: ['#868f96', '#596164']
  },
  { 
    etapa: 'AVALIAÇÃO', 
    cor: '#FA7A6C', 
    label: 'Avaliação',
    icone: faClipboardCheck,
    gradient: ['#ff6b6b', '#ff8787']
  },
  { 
    etapa: 'PROJETO', 
    cor: '#9900CC', 
    label: 'Projeto',
    icone: faDraftingCompass,
    gradient: ['#9f7aea', '#805ad5']
  },
  { 
    etapa: 'APROVACAO-CUSTO', 
    cor: '#0C769E', 
    label: 'Aprovação Custo',
    icone: faFileInvoiceDollar,
    gradient: ['#4298f5', '#2b6cb0']
  },
  { 
    etapa: 'EXECUÇÃO', 
    cor: '#00B050', 
    label: 'Execução',
    icone: faHardHat,
    gradient: ['#48bb78', '#38a169']
  },
  { 
    etapa: 'CONCLUÍDAS', 
    cor: '#0066FF', 
    label: 'Concluídas',
    icone: faCheckCircle,
    gradient: ['#4298f5', '#3182ce']
  },
];

const CardEtapas = ({ obras }) => {
  const [contagemEtapas, setContagemEtapas] = useState({});

  useEffect(() => {
    const calcularContagem = () => {
      const counts = {};
      obras.forEach(obra => {
        counts[obra.ETAPA] = (counts[obra.ETAPA] || 0) + 1;
      });
      setContagemEtapas(counts);
    };

    calcularContagem();
  }, [obras]);

 // components/CardEtapas.js (parte relevante)
return (
    <Row className="g-3 mb-4">
      {etapasConfig.map((etapa) => (
        <Col key={etapa.etapa} xs={6} md={3}>
          <Card className="card-etapa-container">
            <Card.Body className="card-etapa-body">
              <div className="d-flex align-items-center w-100 h-100">
                {/* Ícone */}
                <div 
                  className="card-etapa-icon-wrapper"
                  style={{ background: `linear-gradient(45deg, ${etapa.gradient[0]}, ${etapa.gradient[1]})` }}
                >
                  <FontAwesomeIcon icon={etapa.icone} className="card-etapa-icon" />
                </div>
  
                {/* Conteúdo centralizado */}
                <div className="card-etapa-content">
                  <div className="card-etapa-title">{etapa.label}</div>
                  <div className="card-etapa-value">
                    {contagemEtapas[etapa.etapa] || 0}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CardEtapas;