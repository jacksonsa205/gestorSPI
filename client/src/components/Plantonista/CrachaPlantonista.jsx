import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './CrachaPlantonista.css';

const CrachaPlantonista = ({ nome, cargo, email, celular }) => {
  return (
    <div className="crachaplantonista-container">
      <div className="crachaplantonista-avatar">
        <FontAwesomeIcon icon={faUserCircle} className="crachaplantonista-avatar-icon" />
      </div>
      <div className="crachaplantonista-info">
        <h4 className="crachaplantonista-nome">{nome}</h4>
        <p className="crachaplantonista-cargo">{cargo}</p>
        <div className="crachaplantonista-contatos">
          <div className="crachaplantonista-contato-item">
            <FontAwesomeIcon icon={faEnvelope} className="crachaplantonista-icone" />
            <span>{email}</span>
          </div>
          <div className="crachaplantonista-contato-item">
            <FontAwesomeIcon icon={faPhone} className="crachaplantonista-icone" />
            <span>{celular}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrachaPlantonista;