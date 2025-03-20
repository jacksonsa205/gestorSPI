import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChevronDown,
  faChevronUp,
  faPersonDigging,
  faCircle,
  faScrewdriverWrench
} from '@fortawesome/free-solid-svg-icons';
import logo from "../../assets/imagens/sidebar.png";
import logoClosed from "../../assets/imagens/sidebarClosed.png";
import useAuthValidation from '../../hooks/useAuthValidation'; // Importe o hook
import './Sidebar.css';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const itemRefs = useRef([]);
  const sidebarRef = useRef(null);
  const [clickedItemIndex, setClickedItemIndex] = useState(null);
  const navigate = useNavigate();

  // Use o hook para obter as permissões
  const { permissoesModulo , permissoesSubmodulo} = useAuthValidation(null, null, null);

  // Defina os menus e submenus com base nas permissões
  const menuItems = [
    {
      id: 1, // ID do módulo
      icon: faHome,
      text: 'Dashboard',
      link: '/dashboard'
    },
    {
      id: 2, // ID do módulo
      icon: faPersonDigging,
      text: 'Gestor de Obras',
      subItems: [
        { id: 1, text: 'Report REM', link: '/gestao-obras/reporteREM' }, 
        { id: 2, text: 'Mapa', link: '/gestao-obras/mapaREM' } 
      ]
    },
    {
      id: 3, // ID do módulo
      icon: faScrewdriverWrench,
      text: 'Núcleo Técnico',
      subItems: [
        { id: 3, text: 'Carimbos', link: '' }, 
        { id: 4, text: 'Consulta OLT', link: '/nucleo-tecnico/consultaOLT' }, 
        { id: 7, text: 'Consulta Prioritária', link: '/nucleo-tecnico/consultaPrioritaria' },
        { id: 5, text: 'OLT UPLINK', link: '/nucleo-tecnico/olt-uplink' }, 
        { id: 6, text: 'OLT Isolada', link: '/nucleo-tecnico/olt-isolada' } 
      ]
    },
  ];

  // Função para verificar permissões de módulo
  const hasModulePermission = (moduleId) => {
    return permissoesModulo.includes(moduleId);
  };

  // Função para verificar permissões de submódulo
  const hasSubmodulePermission = (submoduleId) => {
    return permissoesSubmodulo.includes(submoduleId);
  };

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
      return;
    }

    // Lógica para itens com submenu
    if (item.subItems) {
      if (collapsed) {
        const rect = e.currentTarget.getBoundingClientRect();
        setClickedItemIndex(index);
        setPopupPosition({
          top: rect.top + window.scrollY,
          left: rect.left + rect.width
        });
        setShowPopup(prev => !prev);
      } else {
        setExpandedItem(expandedItem === index ? null : index);
      }
    }
  };

  return (
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
          // Renderiza apenas se o usuário tiver permissão para o módulo
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

              {/* Submenu normal */}
              {!collapsed && expandedItem === index && item.subItems && (
                <div className="submenu">
                  {item.subItems.map((subItem, subIndex) => (
                    // Renderiza apenas se o usuário tiver permissão para o submódulo
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

      {/* Popup para collapsed */}
      {collapsed && showPopup && clickedItemIndex !== null && (
        <div className="submenu-popup" style={popupPosition}>
          {menuItems[clickedItemIndex].subItems.map((subItem, subIndex) => (
            // Renderiza apenas se o usuário tiver permissão para o submódulo
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
};

export default Sidebar;