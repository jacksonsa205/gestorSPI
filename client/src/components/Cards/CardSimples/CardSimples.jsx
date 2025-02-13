import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import './CardSimples.css';

const CardSimples = ({ icon, title, value }) => {
  return (
    <Card>
      <Card.Body className="d-flex align-items-center">
        <div className="card-icon me-3">
          <FontAwesomeIcon icon={icon} size="2x" />
        </div>
        <div>
          <Card.Title>{title}</Card.Title>
          <Card.Text className="h4">{value}</Card.Text>
        </div>
      </Card.Body>
    </Card>
  );
};

CardSimples.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

export default CardSimples;