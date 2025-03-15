import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CardObras.css'; // Importando o CSS

const CardObras = ({ etapa, cor, icone, total, contratos }) => {
  return (
    <Col lg={3} md={6} className="mb-4">
      <div className="card-obra-container">
        <div className="card-obra-body">
          <div className="d-flex align-items-center">
            {/* Ícone com fundo colorido */}
            <div className="card-obra-icon-wrapper" style={{ backgroundColor: cor }}>
              <FontAwesomeIcon icon={icone} className="card-obra-icon" />
            </div>

            {/* Título e valor */}
            <div className="card-obra-content">
              <span className="card-obra-title">{etapa}</span>
              <span className="card-obra-value">{total}</span>
            </div>
          </div>

          {/* Lista de contratos */}
          <div className="card-obra-contratos">
            {contratos.map((contrato, index) => (
              <div key={index} className="card-obra-contrato-item">
                <span className="card-obra-contrato-nome">{contrato.nome}</span>
                <span className="card-obra-contrato-quantidade">{contrato.quantidade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Col>
  );
};

export default CardObras;