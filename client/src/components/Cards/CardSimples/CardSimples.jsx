import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import './CardSimples.css';

const CardSimples = ({ icon, title, value }) => {
  return (
    <Card className="cardsimples-container">
      <Card.Body className="cardsimples-body">
        <div className="cardsimples-icon-wrapper">
          <FontAwesomeIcon icon={icon} className="cardsimples-icon" />
        </div>
        <div className="cardsimples-content">
          <Card.Title className="cardsimples-title">{title}</Card.Title>
          <Card.Text className="cardsimples-value">{value}</Card.Text>
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