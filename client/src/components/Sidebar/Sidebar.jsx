
import React, { useState } from "react";
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBuilding, faWrench, faAngleDown, faCircle } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/imagens/sidebar.png";


const Sidebar = () => {
  
  const [isObrasOpen, setIsObrasOpen] = useState(false);
  const [isNucleoTecnicoOpen, setIsNucleoTecnicoOpen] = useState(false);

  // Funções para alternar os submenus
  const toggleObras = () => setIsObrasOpen(!isObrasOpen);
  const toggleNucleoTecnico = () => setIsNucleoTecnicoOpen(!isNucleoTecnicoOpen);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" className="logo-image" />
      </div>
      <ul className="sidebar-links">
        <li>
          <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
          <span>Dashboard</span>
        </li>

        {/* Menu Gestão de Obras */}
        <li onClick={toggleObras}>
          <FontAwesomeIcon icon={faBuilding} className="sidebar-icon" /> {/* Novo ícone para Gestão de Obras */}
          <span>Gestão de Obras</span>
          <FontAwesomeIcon
            icon={faAngleDown}
            className={`sidebar-arrow ${isObrasOpen ? "open" : ""}`}
          />
        </li>
        {isObrasOpen && (
          <ul className="submenu">
            <li>
              <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
              Relatório 1
            </li>
            <li>
              <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
              Relatório 2
            </li>
            <li>
              <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
              Relatório 3
            </li>
          </ul>
        )}

        {/* Menu Núcleo Técnico */}
        <li onClick={toggleNucleoTecnico}>
          <FontAwesomeIcon icon={faWrench} className="sidebar-icon" /> {/* Novo ícone para Núcleo Técnico */}
          <span>Núcleo Técnico</span>
          <FontAwesomeIcon
            icon={faAngleDown}
            className={`sidebar-arrow ${isNucleoTecnicoOpen ? "open" : ""}`}
          />
        </li>
        {isNucleoTecnicoOpen && (
          <ul className="submenu">
            <li>
              <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
              Configuração 1
            </li>
            <li>
              <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
              Configuração 2
            </li>
            <li>
              <FontAwesomeIcon icon={faCircle} className="submenu-icon" />
              Configuração 3
            </li>
          </ul>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
