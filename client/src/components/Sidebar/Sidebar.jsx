import React, { useState } from "react";
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBuilding, faWrench, faAngleDown, faCircle } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/imagens/sidebar.png";
import logoClosed from "../../assets/imagens/sidebarClosed.png";

const Sidebar = ({ isOpen }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [openSubmenus, setOpenSubmenus] = useState({
    obras: false,
    nucleo: false
  });

  const handleMenuHover = (menu) => {
    if (!isOpen) setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    if (!isOpen) setActiveMenu(null);
  };

  const toggleSubmenu = (menu) => {
    if (isOpen) {
      setOpenSubmenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-logo">
        <img 
          src={isOpen ? logo : logoClosed} 
          alt="Logo" 
          className={`logo-image ${isOpen ? "" : "compact"}`} 
        />
      </div>
      
      <ul className="sidebar-links">
        {/* Dashboard */}
        <li className="menu-item">
          <div className="menu-content">
            <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
            <span className="menu-label">Dashboard</span>
          </div>
        </li>

        {/* Gestão de Obras */}
        <li 
          className="menu-item has-submenu"
          onMouseEnter={() => handleMenuHover('obras')}
          onMouseLeave={handleMenuLeave}
          onClick={() => toggleSubmenu('obras')}
        >
          <div className="menu-content">
            <FontAwesomeIcon icon={faBuilding} className="sidebar-icon" />
            <span className="menu-label">Gestão de Obras</span>
            {isOpen && (
              <FontAwesomeIcon
                icon={faAngleDown}
                className={`sidebar-arrow ${openSubmenus.obras ? "open" : ""}`}
              />
            )}
          </div>
          
          {(isOpen ? openSubmenus.obras : activeMenu === 'obras') && (
            <ul className={`submenu ${!isOpen ? "popup" : ""}`}>
              <li className="submenu-item">
                <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                <span>Relatório 1</span>
              </li>
              <li className="submenu-item">
                <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                <span>Relatório 2</span>
              </li>
              <li className="submenu-item">
                <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                <span>Relatório 3</span>
              </li>
            </ul>
          )}
        </li>

        {/* Núcleo Técnico */}
        <li 
          className="menu-item has-submenu"
          onMouseEnter={() => handleMenuHover('nucleo')}
          onMouseLeave={handleMenuLeave}
          onClick={() => toggleSubmenu('nucleo')}
        >
          <div className="menu-content">
            <FontAwesomeIcon icon={faWrench} className="sidebar-icon" />
            <span className="menu-label">Núcleo Técnico</span>
            {isOpen && (
              <FontAwesomeIcon
                icon={faAngleDown}
                className={`sidebar-arrow ${openSubmenus.nucleo ? "open" : ""}`}
              />
            )}
          </div>
          
          {(isOpen ? openSubmenus.nucleo : activeMenu === 'nucleo') && (
            <ul className={`submenu ${!isOpen ? "popup" : ""}`}>
              <li className="submenu-item">
                <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                <span>Configuração 1</span>
              </li>
              <li className="submenu-item">
                <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                <span>Configuração 2</span>
              </li>
              <li className="submenu-item">
                <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
                <span>Configuração 3</span>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;