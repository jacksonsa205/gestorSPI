import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ mensagem = "Carregando..." }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Carregando...</span>
      </Spinner>
      <p className="mt-3">{mensagem}</p>
    </div>
  );
};

export default Loading;