import React from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

const CustomToast = ({ show, message, onClose, variant = 'success' }) => {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
      <Toast
        show={show}
        onClose={onClose}
        delay={3000}
        autohide
        bg={variant}
      >
        <Toast.Header>
          <strong className="me-auto">Mensagem</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default CustomToast;