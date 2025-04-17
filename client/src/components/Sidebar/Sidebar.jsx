import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Offcanvas, Nav, Navbar } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChevronDown,
  faChevronUp,
  faPersonDigging,
  faCircle,
  faScrewdriverWrench,
  faBars,
  faCloudRain
} from '@fortawesome/free-solid-svg-icons';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import logo from "../../assets/imagens/sidebar.png";
import logoClosed from "../../assets/imagens/sidebarClosed.png";
import useAuthValidation from '../../hooks/useAuthValidation';
import './Sidebar.css';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const itemRefs = useRef([]);
  const sidebarRef = useRef(null);
  const [clickedItemIndex, setClickedItemIndex] = useState(null);
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { permissoesModulo, permissoesSubmodulo } = useAuthValidation(null, null, null);

  const menuItems = [
    {
      id: 1,
      icon: faHome,
      text: 'Dashboard',
      link: '/dashboard'
    },
    {
      id: 2,
      icon: faPersonDigging,
      text: 'Gestor de Obras',
      subItems: [
        { id: 1, text: 'Report REM', link: '/gestao-obras/reporteREM' }, 
        { id: 2, text: 'Mapa', link: '/gestao-obras/mapaREM' } 
      ]
    },
    {
      id: 3,
      icon: faScrewdriverWrench,
      text: 'Núcleo Técnico',
      subItems: [
        { id: 3, text: 'Carimbos', link: '' }, 
        { id: 4, text: 'Consulta OLT', link: '/nucleo-tecnico-spi/consultaOLT' }, 
        { id: 7, text: 'Consulta Prioritária', link: '/nucleo-tecnico-spi/consultaPrioritaria' },
        { id: 5, text: 'OLT UPLINK', link: '/nucleo-tecnico-spi/olt-uplink' }, 
        { id: 6, text: 'OLT Isolada', link: '/nucleo-tecnico-spi/olt-isolada' },
        { id: 8, text: 'Gestão de Carimbos', link: '/nucleo-tecnico-spi/gestao-carimbo'},
        { id: 9, text: 'Ocorrências G.V', link: '/nucleo-tecnico-spi/ocorrencias-grande-vulto'}

        
      ]
    },
    {
      id: 9,
      icon: faCloudRain,
      text: 'Clima',
      link: '/informacao-climatica'
    },
    {
      id: 8,
      icon: faTelegram,
      text: 'Telegram',
      link: '/Telegram'
    },

    
  ];

  const hasModulePermission = (moduleId) => permissoesModulo.includes(moduleId);
  const hasSubmodulePermission = (submoduleId) => permissoesSubmodulo.includes(submoduleId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (index, e) => {
    const item = menuItems[index];
  
    // Navegação direta para itens sem submenu
    if (!item.subItems && item.link) {
      navigate(item.link);
      if (isMobile) setShowMobileMenu(false);
      return;
    }
  
    // Lógica para itens com submenu
    if (item.subItems) {
      if (isMobile) {
        // No mobile, alternamos a expansão do item clicado
        setExpandedItem(expandedItem === index ? null : index);
      } else if (collapsed) {
        // Sidebar colapsado em desktop - mostra popup
        const rect = e.currentTarget.getBoundingClientRect();
        setClickedItemIndex(index);
        setPopupPosition({
          top: rect.top + window.scrollY,
          left: rect.left + rect.width
        });
        setShowPopup(prev => !prev);
      } else {
        // Sidebar expandido em desktop - expande normalmente
        setExpandedItem(expandedItem === index ? null : index);
      }
    }
  };

  const renderMobileMenuButton = () => (
    <Navbar className="mobile-menu-button" bg="primary" variant="dark">
      <Navbar.Brand>
        <Button variant="link" onClick={() => setShowMobileMenu(true)}>
          <FontAwesomeIcon icon={faBars} size="lg" />
        </Button>
      </Navbar.Brand>
    </Navbar>
  );

  const renderDesktopSidebar = () => (
    <div
      className="sidebar"
      ref={sidebarRef}
      style={{
        width: collapsed ? '80px' : '250px',
        backgroundColor: '#0066ff'
      }}
    >
      <div className="sidebar-header">
        <img
          src={collapsed ? logoClosed : logo}
          alt="Logo"
          className={collapsed ? 'sidebar-logo-closed' : 'sidebar-logo'}
        />
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          hasModulePermission(item.id) && (
            <div key={index} className="menu-group">
              <Button
                variant="link"
                className={`menu-item ${collapsed ? 'collapsed' : ''}`}
                onClick={(e) => handleItemClick(index, e)}
                ref={el => itemRefs.current[index] = el}
              >
                <div className="menu-icon-wrapper">
                  <FontAwesomeIcon icon={item.icon} className="menu-icon" />
                  {!collapsed && (
                    <span className="menu-text">{item.text}</span>
                  )}
                  {collapsed && (
                    <span className="collapsed-text">{item.text}</span>
                  )}
                </div>

                {!collapsed && item.subItems && (
                  <FontAwesomeIcon
                    icon={expandedItem === index ? faChevronUp : faChevronDown}
                    className="chevron-icon"
                    size="xs"
                  />
                )}
              </Button>

              {!collapsed && expandedItem === index && item.subItems && (
                <div className="submenu">
                  {item.subItems.map((subItem, subIndex) => (
                    hasSubmodulePermission(subItem.id) && (
                      <Button
                        key={subIndex}
                        variant="link"
                        className="submenu-item"
                        onClick={() => {
                          navigate(subItem.link);
                          setExpandedItem(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                        <span className="submenu-text">{subItem.text}</span>
                      </Button>
                    )
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </div>

      {collapsed && showPopup && clickedItemIndex !== null && (
        <div className="submenu-popup" style={popupPosition}>
          {menuItems[clickedItemIndex].subItems.map((subItem, subIndex) => (
            hasSubmodulePermission(subItem.id) && (
              <Button
                key={subIndex}
                variant="link"
                className="popup-item"
                onClick={() => {
                  navigate(subItem.link);
                  setShowPopup(false);
                }}
              >
                <FontAwesomeIcon icon={faCircle} className="popup-icon" />
                <span className="popup-text">{subItem.text}</span>
              </Button>
            )
          ))}
        </div>
      )}
    </div>
  );

  const renderMobileMenu = () => (
    <Offcanvas
      show={showMobileMenu}
      onHide={() => setShowMobileMenu(false)}
      placement="start"
      className="mobile-sidebar"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <img src={logo} alt="Logo" className="mobile-sidebar-logo" />
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          {menuItems.map((item, index) => (
            hasModulePermission(item.id) && (
              <div key={index} className="mobile-menu-group">
                <Nav.Link
                  as={Button}
                  variant="link"
                  className="mobile-menu-item"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que o Offcanvas feche
                    handleItemClick(index, e);
                  }}
                >
                  <div className="mobile-menu-icon-wrapper">
                    <FontAwesomeIcon icon={item.icon} className="mobile-menu-icon" />
                    <span className="mobile-menu-text">{item.text}</span>
                  </div>
                  {item.subItems && (
                    <FontAwesomeIcon
                      icon={expandedItem === index ? faChevronUp : faChevronDown}
                      className="mobile-chevron-icon"
                    />
                  )}
                </Nav.Link>
  
                {expandedItem === index && item.subItems && (
                  <div className="mobile-submenu">
                    {item.subItems.map((subItem, subIndex) => (
                      hasSubmodulePermission(subItem.id) && (
                        <Nav.Link
                          key={subIndex}
                          as={Button}
                          variant="link"
                          className="mobile-submenu-item"
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que o Offcanvas feche
                            navigate(subItem.link);
                            setShowMobileMenu(false);
                          }}
                        >
                          <FontAwesomeIcon icon={faCircle} className="mobile-submenu-icon" />
                          <span className="mobile-submenu-text">{subItem.text}</span>
                        </Nav.Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );

  return (
    <>
      {isMobile && renderMobileMenuButton()}
      {!isMobile && renderDesktopSidebar()}
      {isMobile && renderMobileMenu()}
    </>
  );
};

export default Sidebar;