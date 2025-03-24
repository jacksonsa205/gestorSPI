import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuthValidation = (moduloId, submoduloId, acaoId, refreshKey = 0) => {
  const [state, setState] = useState({
    loading: true,
    user: null,
    permissions: {},
    permissoesModulo: [],
    permissoesSubmodulo: [] 
  });
  
  const navigate = useNavigate();

  const parsePermissions = (permissionsString) => {
    try {
      const cleanedString = permissionsString
        .replace(/\\/g, '')
        .replace(/^"|"$/g, '');
      
      if (/^\[.*\]$/.test(cleanedString)) {
        return JSON.parse(cleanedString);
      }
      return cleanedString.split(',').map(Number).filter(n => !isNaN(n));
    } catch (error) {
      console.error('Erro ao converter permissões:', error);
      return [];
    }
  };

  const validateStatus = (status) => {
    const statusMessages = {
      0: 'Sua conta está inativa. Contate o administrador.',
      3: 'Sua conta está bloqueada. Contate o administrador.',
      default: 'Status desconhecido. Contate o administrador.'
    };
    
    return statusMessages[status] || statusMessages.default;
  };

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/usuario/sessao`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      if (!response.data) {
        throw new Error('Nenhum dado de usuário encontrado');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  };

  const checkPermissions = (usuarioPermissao) => {
    const permissoes = parsePermissions(usuarioPermissao.PERMISSOES || '[]');
    const permissoesModulo = parsePermissions(usuarioPermissao.PERMISSOES_MODULO || '[]');
    const permissoesSubmodulo = parsePermissions(usuarioPermissao.PERMISSOES_SUBMODULO || '[]');

    const hasPermission = (permissionsArray, required) => {
      return Array.isArray(permissionsArray) && permissionsArray.includes(required);
    };

    // Valida módulo se fornecido
    if (moduloId && !hasPermission(permissoesModulo, moduloId)) {
      alert('Acesso negado ao módulo solicitado');
      navigate('/');
      return false;
    }

    // Valida submódulo se fornecido
    if (submoduloId && !hasPermission(permissoesSubmodulo, submoduloId)) {
      alert('Acesso negado ao submódulo solicitado');
      navigate('/');
      return false;
    }

    // Valida ação se fornecido
    if (acaoId && !hasPermission(permissoes, acaoId)) {
      alert('Acesso negado para esta ação');
      navigate('/');
      return false;
    }

    // Atualiza estado com todas as permissões
    setState(prev => ({
      ...prev,
      user: usuarioPermissao,
      permissoesModulo,
      permissoesSubmodulo,
      permissions: {
        canRead: hasPermission(permissoes, 1),
        canEdit: hasPermission(permissoes, 2),
        canDelete: hasPermission(permissoes, 3),
        canCadastro: hasPermission(permissoes, 4),
        canEnviar: hasPermission(permissoes, 5),
      }
    }));
    
    return true;
  };

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        const usuarioPermissao = await fetchUserData(token);
        
        if (usuarioPermissao.STATUS !== 1) {
          alert(validateStatus(usuarioPermissao.STATUS));
          localStorage.clear(); // Limpa dados inválidos
          navigate('/');
          return;
        }

        // Atualiza o localStorage com dados atualizados
        localStorage.setItem('user', JSON.stringify({
          email: usuarioPermissao.EMAIL,
          id: usuarioPermissao.ID
        }));

        if (!checkPermissions(usuarioPermissao)) return;

      } catch (error) {
        console.error('Erro na validação:', error);
        alert('Erro ao validar credenciais');
        localStorage.clear(); // Limpa dados inválidos
        navigate('/');
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    validateUser();
  }, [navigate, moduloId, submoduloId, acaoId, refreshKey]);

  return {
    loading: state.loading,
    user: state.user,
    permissions: state.permissions,
    permissoesModulo: state.permissoesModulo,
    permissoesSubmodulo: state.permissoesSubmodulo
  };
};

export default useAuthValidation;