import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faXmark,
  faExpand,
  faUserCircle,
  faUser,
  faDoorOpen,
  faFileLines,
  faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../Sidebar/Sidebar';
import axios from 'axios';
import useAuthValidation from '../../hooks/useAuthValidation';
import { registrarLog } from '../../hooks/logs';
import './Layout.css';

const Layout = ({ title, content }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Chave de atualização
  const [firstName, setFirstName] = useState('Usuário'); // Estado para o primeiro nome
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Força a atualização das permissões quando o menu é aberto
  const { permissoesModulo, user } = useAuthValidation(null, null, null, refreshKey);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.NOME) {
      // Extrai o primeiro nome do usuário
      const nomeCompleto = user.NOME;
      const primeiroNome = nomeCompleto.split(' ')[0];
      setFirstName(primeiroNome);
    } else {
      // Se não houver nome, define como 'Usuário'
      setFirstName('Usuário');
    }
  }, [user]); // Executa sempre que o objeto `user` mudar

  const handleMenuToggle = () => {
    if (!showUserMenu) {
      // Atualiza as permissões apenas quando o menu é aberto
      setRefreshKey(prev => prev + 1);
    }
    setShowUserMenu(!showUserMenu);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const hasPermission = (moduloId) => {
    return permissoesModulo.includes(moduloId);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await registrarLog(
        token,
        'Logoff',
        'Usuario fez logoff do sistema.'
      );
      
      // Envia requisição de logout para o servidor
      await axios.post(`${import.meta.env.VITE_API_URL}/usuario/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      

    } catch (error) {
      console.error('Erro durante o logout:', error);
    } finally {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };


  return (
    <div className="dashboard-wrapper">
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div 
        className="main-content" 
        style={{ marginLeft: sidebarCollapsed ? '80px' : '250px' }}
      >
        <Navbar className="main-header">
          <Container fluid>
            <div className="d-flex justify-content-between w-100 align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="link" 
                  className="toggle-btn"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <FontAwesomeIcon 
                    icon={sidebarCollapsed ? faBars : faXmark} 
                    size="lg"
                  />
                </Button>

                <Button 
                  variant="link" 
                  className="fullscreen-btn"
                  onClick={toggleFullscreen}
                >
                  <FontAwesomeIcon icon={faExpand} />
                </Button>
              </div>

              <div className="position-relative" ref={menuRef}>
                <Button 
                  variant="link" 
                  className="user-icon-btn"
                  onClick={handleMenuToggle} // Usa o novo handler
                >
                  <FontAwesomeIcon icon={faUserCircle} size="lg" className="user-icon" />
                  {firstName} {/* Exibe o primeiro nome do usuário */}
                </Button>

                {showUserMenu && (
                  <div className="user-popup">
                    {/* Itens do menu com validação dinâmica */}
                    {hasPermission(4) && (
                      <button className="popup-item" onClick={() => navigate("/acesso")}>
                        <FontAwesomeIcon icon={faDoorOpen} className="me-2" />
                        Acesso
                      </button>
                    )}

                    {hasPermission(5) && (
                      <button className="popup-item" onClick={() => navigate("/log-aplicacao")}>
                        <FontAwesomeIcon icon={faFileLines} className="me-2" />
                        Logs
                      </button>
                    )}

                    {hasPermission(6) && (
                      <button className="popup-item" onClick={() => navigate("/escala-plantao")}>
                        <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
                        Escala Pl.
                      </button>
                    )}

                    {hasPermission(7) && (
                      <button className="popup-item" onClick={() => navigate("/profile")}>
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Perfil
                      </button>
                    )}

                      <button 
                        className="popup-item" 
                        onClick={handleLogout} // Alterado para a nova função
                      >
                        <FontAwesomeIcon icon={faXmark} className="me-2" />
                        Sair
                      </button>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Navbar>

        <div className="content-wrapper">
          <h1 className="page-title">{title}</h1>
          {content}
          <footer className="main-footer">
            <Container fluid>
              <Row>
                <Col className="text-center py-3">
                  © 2025 Gestor SPI
                </Col>
              </Row>
            </Container>
          </footer>
        </div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  title: PropTypes.string.isRequired, // title é uma string obrigatória
  content: PropTypes.node.isRequired, // content pode ser qualquer nó React (string, número, elemento, etc.)
};

export default Layout;