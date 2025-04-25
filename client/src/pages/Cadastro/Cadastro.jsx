import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Cadastro.css';

// Opções para os selects
const EMPRESAS = ['Vivo', 'Ability', 'Tel', 'Telemom', 'Icomon'];
const REGIONAIS = ['SP Interior'];
const DIVISOES = ['Assistência', 'Rede Externa','Núcleo Técnico', 'Planta Interna', 'Móvel', 'Escritório', 'Planejamento'];
const CONTRATOS = ['Osasco', 'São Jose dos Campo', 'Campinas', 'Interior', 'PC/SC', 'Jundiai'];
const CARGOS = ['Técnico', 'Assistente', 'Analista', 'Supervisor','Consultor','Coordenador','Especialista', 'Gerente','Diretor'];

// Função para normalizar texto
const normalizeText = (text) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
};

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    re: '',
    celular: '',
    email: '',
    senha: '',
    empresa: '',
    regional: '',
    divisao: '',
    contrato: '',
    cargo: ''
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [emailValido, setEmailValido] = useState(true);
  const [emailCadastrado, setEmailCadastrado] = useState(false);
  const [carregandoEmail, setCarregandoEmail] = useState(false);
  const [senhaForca, setSenhaForca] = useState({
    maiuscula: false,
    especial: false,
    numero: false
  });

  useEffect(() => {
    let timeoutId;
    if (cadastroSucesso) {
      timeoutId = setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [cadastroSucesso, navigate]);

  // Validação de email em tempo real
  useEffect(() => {
    const validarEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      // Validação do formato
      if (!emailRegex.test(formData.email)) {
        setEmailValido(false);
        return;
      }
      setEmailValido(true);
  
      try {
        setCarregandoEmail(true);
        const resposta = await fetch(`${import.meta.env.VITE_API_URL}/usuario/buscar`);
        
        if (!resposta.ok) {
          throw new Error('Falha ao buscar usuários');
        }
        
        const todosUsuarios = await resposta.json();
        
        // Verifica se o email já existe (case insensitive)
        const emailExiste = todosUsuarios.some(usuario => 
          usuario.EMAIL.toLowerCase() === formData.email.toLowerCase()
        );
        
        setEmailCadastrado(emailExiste);
        
      } catch (erro) {
        console.error('Erro na validação do email:', erro);
        setEmailCadastrado(false);
      } finally {
        setCarregandoEmail(false);
      }
    };
  
    const debounce = setTimeout(validarEmail, 500);
    return () => clearTimeout(debounce);
  }, [formData.email]);

  // Validação de senha em tempo real
  useEffect(() => {
    const senha = formData.senha;
    setSenhaForca({
      maiuscula: /[A-Z]/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
      numero: /\d/.test(senha)
    });
  }, [formData.senha]);

  const formatarCelular = (valor) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara (XX)-XXXXX-XXXX
    let formato = '';
    if (apenasNumeros.length > 0) {
      formato += `(${apenasNumeros.substring(0, 2)}`;
    }
    if (apenasNumeros.length > 2) {
      formato += `)-${apenasNumeros.substring(2, 7)}`;
    }
    if (apenasNumeros.length > 7) {
      formato += `-${apenasNumeros.substring(7, 11)}`;
    }
    return formato;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Aplica normalização apenas para os campos de select
    const camposParaNormalizar = ['empresa', 'regional', 'divisao', 'contrato', 'cargo'];
    
    if (name === 'celular') {
      const valorFormatado = formatarCelular(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: valorFormatado
      }));
    } else {
      // Mantém o valor original para todos os campos
      setFormData(prev => ({ 
        ...prev, 
        [name]: value
      }));
    }
  };


  // Função para capitalizar nomes (primeira letra de cada palavra maiúscula)
const capitalizarNome = (nome) => {
  return nome.toLowerCase().split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};
  
  // Modificar a submissão para normalizar os campos necessários
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    setCadastroSucesso(false);
  
    // Validações finais antes do envio
    if (!emailValido) return setMensagemErro('Formato de email inválido');
    if (emailCadastrado) return setMensagemErro('Email já cadastrado');
    if (!Object.values(senhaForca).every(v => v)) {
      return setMensagemErro('A senha não atende aos requisitos de segurança');
    }
  
    try {
      const celularFormatado = `+55${formData.celular.replace(/\D/g, '')}`;
      
      // Normalizar os campos necessários apenas no envio
      const dadosParaEnvio = {
        ...formData,
        nome: capitalizarNome(formData.nome),
        re: formData.re.toUpperCase(), 
        celular: celularFormatado,
        empresa: normalizeText(formData.empresa),
        regional: normalizeText(formData.regional),
        divisao: normalizeText(formData.divisao),
        contrato: normalizeText(formData.contrato),
        cargo: normalizeText(formData.cargo),
        permissoes: [],
        permissoes_modulo: [],
        permissoes_submodulo: [],
        status: 0,
        perfil: 'tecnico'
      };
      
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/usuario/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnvio),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.message || 'Erro ao realizar cadastro');
      }

      setCadastroSucesso(true);
      setFormData({
        nome: '',
        re: '',
        celular: '',
        email: '',
        senha: '',
        empresa: '',
        regional: '',
        divisao: '',
        contrato: '',
        cargo: ''
      });

    } catch (erro) {
      setMensagemErro(erro.message);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-formulario">
        <div className="cadastro-cabecalho">
          <img 
            src="/imagens/logo.png" 
            alt="Logo do Sistema" 
            className="cadastro-logo" 
          />
          <h1 className="cadastro-titulo">Cadastro de Usuário</h1>
        </div>

        {mensagemErro && (
          <div className="cadastro-alerta erro">
            <FontAwesomeIcon icon={faTimesCircle} className="alerta-icone" />
            {mensagemErro}
            <div className="alerta-progresso"></div>
          </div>
        )}
        
        {cadastroSucesso && (
          <div className="cadastro-alerta sucesso">
            <FontAwesomeIcon icon={faCheckCircle} className="alerta-icone" />
            Cadastro realizado com sucesso! Redirecionando...
            <div className="alerta-progresso"></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cadastro-form-conteudo">
          <div className="cadastro-colunas">
            {/* Coluna Esquerda */}
            <div className="cadastro-coluna">
              <div className="cadastro-grupo">
                <label htmlFor="nome" className="cadastro-rotulo">Nome Completo</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                />
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="re" className="cadastro-rotulo">RE</label>
                <input
                  type="text"
                  id="re"
                  name="re"
                  value={formData.re}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                />
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="celular" className="cadastro-rotulo">Celular</label>
                <input
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className="cadastro-input"
                    type="tel"
                    placeholder="(XX)-XXXXX-XXXX"
                    maxLength={15}
                    />
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="email" className="cadastro-rotulo">E-mail</label>
                <div className="cadastro-email-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`cadastro-input ${!emailValido || emailCadastrado ? 'input-invalido' : ''}`}
                    required
                  />
                  {carregandoEmail && (
                    <FontAwesomeIcon 
                      icon={faSpinner} 
                      spin 
                      className="cadastro-email-spinner" 
                    />
                  )}
                </div>
                {!emailValido && <span className="erro-texto">Formato de email inválido</span>}
                {emailCadastrado && <span className="erro-texto">Email já cadastrado</span>}
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="senha" className="cadastro-rotulo">Senha</label>
                <div className="cadastro-senha-container">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className="cadastro-input"
                    required
                  />
                  <button
                    type="button"
                    className="cadastro-botao-olho"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    <FontAwesomeIcon icon={mostrarSenha ? faEyeSlash : faEye} />
                  </button>
                </div>
                <div className="senha-requisitos">
                  <div className={senhaForca.maiuscula ? 'requisito-atendido' : ''}>
                    Pelo menos 1 letra maiúscula
                  </div>
                  <div className={senhaForca.especial ? 'requisito-atendido' : ''}>
                    Pelo menos 1 caractere especial
                  </div>
                  <div className={senhaForca.numero ? 'requisito-atendido' : ''}>
                    Pelo menos 1 número
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="cadastro-coluna">
              <div className="cadastro-grupo">
                <label htmlFor="empresa" className="cadastro-rotulo">Empresa</label>
                <select
                  id="empresa"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                >
                  <option value="">Selecione...</option>
                  {EMPRESAS.map(empresa => (
                    <option key={empresa} value={empresa}>{empresa}</option>
                  ))}
                </select>
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="regional" className="cadastro-rotulo">Regional</label>
                <select
                  id="regional"
                  name="regional"
                  value={formData.regional}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                >
                  <option value="">Selecione...</option>
                  {REGIONAIS.map(regional => (
                    <option key={regional} value={regional}>{regional}</option>
                  ))}
                </select>
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="divisao" className="cadastro-rotulo">Divisão</label>
                <select
                  id="divisao"
                  name="divisao"
                  value={formData.divisao}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                >
                  <option value="">Selecione...</option>
                  {DIVISOES.map(divisao => (
                    <option key={divisao} value={divisao}>{divisao}</option>
                  ))}
                </select>
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="contrato" className="cadastro-rotulo">Contrato</label>
                <select
                  id="contrato"
                  name="contrato"
                  value={formData.contrato}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                >
                  <option value="">Selecione...</option>
                  {CONTRATOS.map(contrato => (
                    <option key={contrato} value={contrato}>{contrato}</option>
                  ))}
                </select>
              </div>

              <div className="cadastro-grupo">
                <label htmlFor="cargo" className="cadastro-rotulo">Cargo</label>
                <select
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="cadastro-input"
                  required
                >
                  <option value="">Selecione...</option>
                  {CARGOS.map(cargo => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="cadastro-botao"
            disabled={!emailValido || emailCadastrado || !Object.values(senhaForca).every(v => v)}
          >
            Cadastrar
          </button>
        </form>
        
         {/* Link para a página de cadastro */}
         <div className="mt-3 text-center">
          <span>Já tem uma conta? </span>
          <Link to="/" className="text-primary">Entre</Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;