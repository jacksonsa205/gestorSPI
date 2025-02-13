import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { username, password });
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="login-form bg-white p-4 rounded shadow-sm">
        <div className="logo-container mb-4 text-center">
          <img src="/imagens/logo.png" alt="Logo" className="login-logo" />
        </div>

        <h2 className="text-center mb-4">Faça o login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              E-mail
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <div className="password-container position-relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input form-control"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                className="eye-button position-absolute"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
