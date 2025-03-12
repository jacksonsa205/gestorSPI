const pool = require('../../config/db');

// Cadastrar uma nova consulta OLT
const cadastrarConsultaOLT = async (dados) => {
    const query = `
      INSERT INTO TB_GSPI_NT_Consulta_OLT 
      (CODIGO, OLT_HOSTNAME, CONTRATO, RESUMO, ABORDAGEM, CONDOMINIO, NOME_COND, CAUSA, SOLUCAO, SITE, DT_CRIACAO, DT_ENCERRAMENTO)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
      dados.codigo,
      dados.oltHostname,
      dados.contrato,
      dados.resumo,
      dados.abordagem,
      dados.condominio,
      dados.nomeCond,
      dados.causa,
      dados.solucao,
      dados.site,
      dados.dtCriacao || null, 
      dados.dtEncerramento || null 
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
  };

// Listar todas as consultas OLT
const listarConsultasOLT = async (filtro = {}) => {
    let query = `
      SELECT 
          CODIGO, 
          DATE_FORMAT(DT_CRIACAO, '%d/%m/%Y %H:%i') AS DT_CRIACAO_FT, 
          DATE_FORMAT(DT_ENCERRAMENTO, '%d/%m/%Y %H:%i') AS DT_ENCERRAMENTO_FT,
          DATE_FORMAT(DT_CRIACAO, '%Y-%m-%d %H:%i:%s') AS DT_CRIACAO,
          DATE_FORMAT(DT_ENCERRAMENTO, '%Y-%m-%d %H:%i:%s') AS DT_ENCERRAMENTO,
          OLT_HOSTNAME, 
          CONTRATO, 
          RESUMO, 
          ABORDAGEM, 
          CONDOMINIO, 
          NOME_COND, 
          CAUSA, 
          SOLUCAO, 
          SITE
      FROM TB_GSPI_NT_Consulta_OLT
    `;
  
    const params = [];
  
    if (filtro.codigo) {
      query += ' WHERE CODIGO = ?';
      params.push(filtro.codigo);
    }
  
    query += ' ORDER BY DT_CRIACAO DESC;';
  
    const [rows] = await pool.execute(query, params);
    return rows;
  };

// Editar uma consulta OLT
const editarConsultaOLT = async (codigo, dados) => {
    const query = `
      UPDATE TB_GSPI_NT_Consulta_OLT SET
      OLT_HOSTNAME = ?,
      CONTRATO = ?,
      RESUMO = ?,
      ABORDAGEM = ?,
      CONDOMINIO = ?,
      NOME_COND = ?,
      CAUSA = ?,
      SOLUCAO = ?,
      SITE = ?,
      DT_CRIACAO = ?,  
      DT_ENCERRAMENTO = ?
      WHERE CODIGO = ?`;
  
    const params = [
      dados.oltHostname || null,
      dados.contrato || null,
      dados.resumo || null,
      dados.abordagem || null,
      dados.condominio || null,
      dados.nomeCond || null,
      dados.causa || null,
      dados.solucao || null,
      dados.site || null,
      dados.dtCriacao || null,
      dados.dtEncerramento || null,
      codigo
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
  };

// Excluir uma consulta OLT
const excluirConsultaOLT = async (codigo) => {
  const query = 'DELETE FROM TB_GSPI_NT_Consulta_OLT WHERE CODIGO = ?';
  await pool.execute(query, [codigo]);
};

module.exports = {
  cadastrarConsultaOLT,
  listarConsultasOLT,
  editarConsultaOLT,
  excluirConsultaOLT
};