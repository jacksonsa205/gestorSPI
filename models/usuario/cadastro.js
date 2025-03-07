const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

const cadastrarUsuario = async (dados) => {
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    
    const query = `
      INSERT INTO TB_GSPI_Usuarios 
      (RE, NOME, CELULAR, EMAIL, SENHA, EMPRESA, REGIONAL, DIVISAO, CONTRATO, CARGO, PERFIL, STATUS, PERMISSOES, PERMISSOES_MODULO, PERMISSOES_SUBMODULO)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
      dados.re,
      dados.nome,
      dados.celular,
      dados.email,
      senhaHash,
      dados.empresa,
      dados.regional,
      dados.divisao,
      dados.contrato,
      dados.cargo,
      dados.perfil,
      dados.status,
      JSON.stringify(dados.permissoes),
      JSON.stringify(dados.permissoes_modulo),
      JSON.stringify(dados.permissoes_submodulo)
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
  };

const listarUsuarios = async () => {
    const query = `
        SELECT 
            ID, 
            NOME, 
            RE, 
            CELULAR, 
            EMAIL, 
            EMPRESA, 
            REGIONAL, 
            DIVISAO, 
            CONTRATO, 
            PERFIL,
            STATUS,
            PERMISSOES, 
            PERMISSOES_MODULO, 
            PERMISSOES_SUBMODULO
        FROM TB_GSPI_Usuarios
        ORDER BY DATA_CRIACAO DESC;`;
    
    const [rows] = await pool.execute(query);
    return rows;
};

// models/usuario/cadastro.js
const editarUsuario = async (id, dados) => {
    const query = `
      UPDATE TB_GSPI_Usuarios SET
      RE = ?,
      NOME = ?,
      CELULAR = ?,
      EMAIL = ?,
      EMPRESA = ?,
      REGIONAL = ?,
      DIVISAO = ?,
      CONTRATO = ?,
      PERFIL = ?,
      STATUS = ?,
      PERMISSOES = ?,
      PERMISSOES_MODULO = ?,
      PERMISSOES_SUBMODULO = ?
      WHERE ID = ?`;
    
    const params = [
      dados.re,
      dados.nome,
      dados.celular,
      dados.email,
      dados.empresa,
      dados.regional,
      dados.divisao,
      dados.contrato,
      dados.perfil,
      dados.status,
      JSON.stringify(dados.permissoes),
      JSON.stringify(dados.permissoes_modulo),
      JSON.stringify(dados.permissoes_submodulo),
      id
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
  };
  
  const excluirUsuario = async (id) => {
    const query = 'DELETE FROM TB_GSPI_Usuarios WHERE ID = ?';
    await pool.execute(query, [id]);
  };

module.exports = {
    cadastrarUsuario,
    listarUsuarios,
    editarUsuario,
    excluirUsuario
};