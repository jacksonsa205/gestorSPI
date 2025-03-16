const pool = require('../../config/db');

// Cadastrar uma nova OLT Isolada
const cadastrarOLTIsolada = async (dados) => {
    const query = `
      INSERT INTO TB_GSPI_NT_OLT_Isolada 
      (TA, OLT, AFETACAO, EPS, DATA_CRIACAO, SLA, STATUS, OBSERVACAO)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        dados.TA,
        dados.OLT,
        dados.AFETACAO,
        dados.EPS,
        dados.DATA_CRIACAO || null,
        dados.SLA || null,
        dados.STATUS,
        dados.OBSERVACAO || null
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
};

// Listar todas as OLTs Isoladas
const listarOLTsIsoladas = async (filtro = {}) => {
    let query = `
      SELECT 
          TA, 
          OLT, 
          AFETACAO, 
          EPS, 
          DATA_CRIACAO, 
          SLA, 
          STATUS, 
          OBSERVACAO
      FROM TB_GSPI_NT_OLT_Isolada
    `;
  
    const params = [];
  
    if (filtro.TA) {
        query += ' WHERE TA = ?';
        params.push(filtro.TA);
    }
  
    query += ' ORDER BY DATA_CRIACAO DESC;';
  
    const [rows] = await pool.execute(query, params);
    return rows;
};

// Editar uma OLT Isolada
const editarOLTIsolada = async (TA, dados) => {
    const query = `
      UPDATE TB_GSPI_NT_OLT_Isolada SET
      OLT = ?,
      AFETACAO = ?,
      EPS = ?,
      DATA_CRIACAO = ?,
      SLA = ?,
      STATUS = ?,
      OBSERVACAO = ?
      WHERE TA = ?`;
  
    const params = [
        dados.OLT || null,
        dados.AFETACAO || null,
        dados.EPS || null,
        dados.DATA_CRIACAO || null,
        dados.SLA || null,
        dados.STATUS || null,
        dados.OBSERVACAO || null,
        TA
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
};

// Excluir uma OLT Isolada
const excluirOLTIsolada = async (TA) => {
    const query = 'DELETE FROM TB_GSPI_NT_OLT_Isolada WHERE TA = ?';
    await pool.execute(query, [TA]);
};

module.exports = {
    cadastrarOLTIsolada,
    listarOLTsIsoladas,
    editarOLTIsolada,
    excluirOLTIsolada
};