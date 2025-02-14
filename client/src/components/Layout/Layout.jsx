import { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom'; // Importação correta
import { Container, Navbar, Button, Col, Row } from 'react-bootstrap';
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
import './Layout.css';

const Layout = ({ title, content }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div 
        className="main-content" 
        style={{ marginLeft: sidebarCollapsed ? '80px' : '250px' }}
      >
        {/* Header */}
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
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FontAwesomeIcon icon={faUserCircle} size="lg" className="user-icon" />
                  Jackson
                </Button>

                {showUserMenu && (
                  <div className="user-popup">
                    <button className="popup-item" onClick={() => navigate("/acesso")}>
                        <FontAwesomeIcon icon={faDoorOpen} className="me-2" />
                        Acesso
                    </button>
                    <button className="popup-item" onClick={() => navigate("/log-aplicacao")}>
                        <FontAwesomeIcon icon={faFileLines} className="me-2" />
                        Logs
                    </button>
                    <button className="popup-item" onClick={() => navigate("/escala-plantao")}>
                        <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
                        Escala Pl.
                    </button>
                    <button className="popup-item" onClick={() => navigate("/profile")}>
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Perfil
                    </button>
                    <button className="popup-item" onClick={() => navigate("/")}>
                        <FontAwesomeIcon icon={faXmark} className="me-2" />
                        Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Navbar>

        {/* Content */}
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

export default Layout;