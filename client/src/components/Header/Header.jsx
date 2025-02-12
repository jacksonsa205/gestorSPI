// src/components/Header.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars, faExpand } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

const Header = ({ toggleSidebar }) => {
  return (
    <div className="header">
      <div className="header-menu" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} className="header-icon" />
        <FontAwesomeIcon icon={faExpand} className="header-icon" />
      </div>
      <div className="header-title">
        
      </div>
      <div className="header-actions">
        
        <FontAwesomeIcon icon={faUser} className="header-icon" />
      </div>
    </div>
  );
};

export default Header;
