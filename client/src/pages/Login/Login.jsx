import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import CustomToast from '../../components/Toast/Toast';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Faz a requisição de login
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/usuario/login`, {
        email: username,
        senha: password,
      });

      // Se o login for bem-sucedido
      if (response.data.token) {
        // Verifica se o objeto user está presente na resposta
        if (!response.data.user) {
          throw new Error('Dados do usuário não encontrados na resposta.');
        }

        // Armazena o token e os dados do usuário no localStorage
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email, // Certifique-se de que o email está sendo retornado pelo backend
        };

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));

      
        // Configura um timeout para limpar o localStorage após 1 hora (3600 segundos)
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('Sua sessão expirou. Faça login novamente.');
          navigate('/');
        }, 3600 * 1000); // 1 hora em milissegundos

        // Exibe o toast de sucesso
        setToastMessage('Login realizado com sucesso!');
        setToastVariant('success');
        setShowToast(true);

        // Redireciona para /dashboard após 3 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      // Exibe o toast de erro
      setToastMessage('Erro ao fazer login. Verifique suas credenciais.');
      setToastVariant('danger');
      setShowToast(true);
      console.error('Erro no login:', error);
    }
      finally {
      setIsLoading(false); 
    }
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
          </button>
          </div>
        </form>

        {/* Link para a página de cadastro */}
        <div className="mt-3 text-center">
          <span>Não tem uma conta? </span>
          <Link to="/cadastro" className="text-primary">Cadastre-se</Link>
        </div>
      </div>

      {/* Toast para feedback */}
      <CustomToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        variant={toastVariant}
      />
    </div>
  );
};

export default Login;