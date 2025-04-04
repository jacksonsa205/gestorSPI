import { Col, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CardTas.css';

const CardTas = ({ etapa, icone, total, contratos, gradient }) => {
  return (
    <Col lg={3} md={6} className="mb-4">
      <div className="card-tas-container">
        <div className="card-tas-body">
          <div className="d-flex align-items-center w-100 h-100">
            <div 
              className="card-tas-icon-wrapper"
              style={{ background: `linear-gradient(45deg, ${gradient[0]}, ${gradient[1]})` }}
            >
              <FontAwesomeIcon icon={icone} className="card-tas-icon" />
            </div>

            <div className="card-tas-content">
              <span className="card-tas-title">{etapa}</span>
              <span className="card-tas-value">{total}</span>
            </div>
          </div>

          <div className="card-tas-contratos">
            {contratos.map((contrato, index) => (
              <div key={index} className="card-tas-contrato-item">
                <Badge 
                  bg={contrato.variant || 'secondary'} 
                  pill
                  className="w-100 d-flex justify-content-between align-items-center"
                >
                  <span className="card-tas-contrato-nome">{contrato.nome}</span>
                  <span className="card-tas-contrato-quantidade">{contrato.quantidade}</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Col>
  );
};

export default CardTas;