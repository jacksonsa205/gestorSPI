import { useState } from 'react';
import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './CardExpansivo.css';

const CardExpansivo = ({ etapa, icone, total, contratos, gradient }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Col lg={3} md={6} className="mb-4">
      <div 
        className={`card-expansivo-container ${expanded ? 'expanded' : ''}`}
        onClick={toggleExpand}
      >
        <div className="card-expansivo-body">
          <div className="d-flex align-items-center w-100 h-100">
            <div 
              className="card-expansivo-icon-wrapper"
              style={{ background: `linear-gradient(45deg, ${gradient[0]}, ${gradient[1]})` }}
            >
              <FontAwesomeIcon icon={icone} className="card-expansivo-icon" />
            </div>

            <div className="card-expansivo-content">
              <span className="card-expansivo-title">{etapa}</span>
              <span className="card-expansivo-value">{total}</span>
            </div>

            <FontAwesomeIcon 
              icon={expanded ? faChevronUp : faChevronDown} 
              className="card-expansivo-chevron"
            />
          </div>

          <div className={`card-expansivo-contratos ${expanded ? 'show' : ''}`}>
            {contratos.map((contrato, index) => (
              <div key={index} className="card-expansivo-contrato-item">
                <span className="card-expansivo-contrato-nome">{contrato.nome}</span>
                <span className="card-expansivo-contrato-quantidade">{contrato.quantidade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Col>
  );
};

export default CardExpansivo;