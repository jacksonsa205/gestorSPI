import { useState, useEffect, useRef } from 'react';
import { Container, Navbar, Button, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faXmark,
  faExpand,
  faUserCircle,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ title, content }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

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
                  <FontAwesomeIcon icon={faUserCircle} size="lg" />
                </Button>

                {showUserMenu && (
                  <div className="user-popup">
                    <button className="popup-item">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Perfil
                    </button>
                    <button className="popup-item">
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