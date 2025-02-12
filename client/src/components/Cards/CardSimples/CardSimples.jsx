import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CardSimples.css';

const Card = ({ titulo, icone, valor }) => {
  return (
    <div className="card">
      <FontAwesomeIcon icon={icone} className="card-icon" />
      <div className="card-content">
        <h3>{titulo}</h3>
        <p>{valor}</p>
      </div>
    </div>
  );
};

export default Card;
