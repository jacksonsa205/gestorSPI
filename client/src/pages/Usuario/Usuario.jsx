import React, { useState } from "react";
import "./Usuario.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import user from "../../assets/imagens/user.png";

const Usuario = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dados");
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Dados mockados do usuário
  const userData = {
    nome: "Jackson Alves de Sa",
    cargo: "Desenvolvedor",
    email: "jackson.sa205@gmail.com",
    telefone: "(11) 95030-3037",
    avatar: "", // Campo vazio para simular usuário sem foto
    ultimoAcesso: "20/03/2024 14:30:00"
};

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`profile-main-container ${isSidebarOpen ? 'profile-open' : 'profile-closed'}`}>
        <div className="profile-main-content">
          <h1 className="profile-title">Perfil do Usuário</h1>
          <div className="profile-header-container">
            <div className="profile-avatar-section">
                <img 
                    src={userData.avatar || user} 
                    alt="Avatar" 
                    className="profile-user-avatar" 
                />
              <button className="profile-edit-avatar-btn">Alterar Foto</button>
            </div>
            <div className="profile-user-info">
              <h1 className="profile-user-name">{userData.nome}</h1>
              <p className="profile-user-role">{userData.cargo}</p>
              <div className="profile-user-stats">
                <div className="profile-stat-item">
                  <span className="profile-stat-label">Último acesso:</span>
                  <span className="profile-stat-value">{userData.ultimoAcesso}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-body-container">
            <div className="profile-navigation-menu">
              <button 
                className={`profile-menu-item ${activeMenu === 'dados' ? 'profile-active-menu' : ''}`}
                onClick={() => setActiveMenu('dados')}
              >
                Dados Pessoais
              </button>
              <button 
                className={`profile-menu-item ${activeMenu === 'seguranca' ? 'profile-active-menu' : ''}`}
                onClick={() => setActiveMenu('seguranca')}
              >
                Segurança
              </button>
              <button 
                className={`profile-menu-item ${activeMenu === 'notificacoes' ? 'profile-active-menu' : ''}`}
                onClick={() => setActiveMenu('notificacoes')}
              >
                Notificações
              </button>
            </div>

            <div className="profile-details-section">
              {activeMenu === 'dados' && (
                <div className="profile-details-card">
                  <h2 className="profile-section-title">Informações Pessoais</h2>
                  <form className="profile-form-container">
                    <div className="profile-form-group">
                      <label className="profile-form-label">Nome Completo</label>
                      <input 
                        type="text" 
                        className="profile-form-input"
                        value={userData.nome} 
                      />
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Email</label>
                      <input 
                        type="email" 
                        className="profile-form-input"
                        value={userData.email} 
                      />
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Telefone</label>
                      <input 
                        type="tel" 
                        className="profile-form-input"
                        value={userData.telefone} 
                      />
                    </div>
                    <button type="submit" className="profile-save-btn">Salvar Alterações</button>
                  </form>
                </div>
              )}

              {activeMenu === 'seguranca' && (
                <div className="profile-details-card">
                  <h2 className="profile-section-title">Configurações de Segurança</h2>
                  <div className="profile-security-item">
                    <h3 className="profile-security-title">Alterar Senha</h3>
                    <input 
                      type="password" 
                      className="profile-form-input"
                      placeholder="Nova Senha" 
                    />
                    <input 
                      type="password" 
                      className="profile-form-input"
                      placeholder="Confirmar Nova Senha" 
                    />
                  </div>
                  <div className="profile-security-item">
                    <h3 className="profile-security-title">Autenticação de Dois Fatores</h3>
                    <label className="profile-custom-switch">
                      <input type="checkbox" />
                      <span className="profile-switch-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {activeMenu === 'notificacoes' && (
                <div className="profile-details-card">
                  <h2 className="profile-section-title">Preferências de Notificação</h2>
                  <div className="profile-notification-item">
                    <label className="profile-notification-label">
                      <input type="checkbox" className="profile-notification-checkbox" />
                      Notificações por Email
                    </label>
                  </div>
                  <div className="profile-notification-item">
                    <label className="profile-notification-label">
                      <input type="checkbox" className="profile-notification-checkbox" />
                      Notificações por SMS
                    </label>
                  </div>
                  <div className="profile-notification-item">
                    <label className="profile-notification-label">
                      <input type="checkbox" className="profile-notification-checkbox" />
                      Notificações no Sistema
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Usuario;