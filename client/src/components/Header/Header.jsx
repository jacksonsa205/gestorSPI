import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars, faExpand, faSignOutAlt, faIdBadge } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleUserClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    console.log("Realizando logout...");
    navigate("/");
  };

  const navigateToProfile = () => {
    navigate("/profile"); 
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
    toggleSidebar(!sidebarOpen);
  };

  return (
    <div className={`header ${!sidebarOpen ? "open" : "closed"}`}>
      <div className="header-menu">
        <FontAwesomeIcon icon={faBars} className="header-icon" onClick={handleMenuClick} />
        <FontAwesomeIcon icon={faExpand} className="header-icon" onClick={toggleFullScreen} />
      </div>
      <div className="header-title"></div>
      <div className="header-actions">
        <FontAwesomeIcon icon={faUser} className="header-icon" onClick={handleUserClick} />
        {isMenuOpen && (
          <div className="user-menu">
            <div className="user-menu-item" onClick={navigateToProfile}>
              <FontAwesomeIcon icon={faIdBadge} className="user-menu-icon-user" />
              Perfil
            </div>
            <div className="user-menu-item" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} className="user-menu-icon-logout" />
              Logoff
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
