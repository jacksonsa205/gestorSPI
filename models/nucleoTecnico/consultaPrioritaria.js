const pool = require('../../config/db');

// Cadastrar uma nova consulta
const cadastrarConsultaPrioritaria = async (dados) => {
  const query = `
    INSERT INTO TB_GSPI_NT_Consulta_Prioritaria 
    (GBE, SWO, FIBRA, CABO, FABRICANTE, EQUIP, ESP_CADASTRO, DATA_ALTERACAO)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    dados.gbe,
    dados.swo,
    dados.fibra,
    dados.cabo,
    dados.fabricante,
    dados.equip,
    dados.espCadastro,
    dados.dataAlteracao || null
  ];

  const [result] = await pool.execute(query, params);
  return result;
};

// Listar todas as consultas
// Já está implementado corretamente para receber os filtros individuais
const listarConsultasPrioritarias = async ({ pesquisa, gbe, swo, fibra, cabo, limite = null }) => {
  let query = `
    SELECT 
        ID,
        GBE, 
        SWO, 
        FIBRA, 
        CABO, 
        FABRICANTE, 
        EQUIP, 
        ESP_CADASTRO, 
        DATA_ALTERACAO
    FROM TB_GSPI_NT_Consulta_Prioritaria
    WHERE 1=1
  `;

  const params = [];

  // Filtros específicos
  if (gbe) {
    query += ' AND GBE = ?';
    params.push(gbe);
  }
  
  if (swo) {
    query += ' AND SWO = ?';
    params.push(swo);
  }
  
  if (fibra) {
    query += ' AND FIBRA = ?';
    params.push(fibra);
  }
  
  if (cabo) {
    query += ' AND CABO = ?';
    params.push(cabo);
  }

  // Pesquisa genérica apenas para fabricante e equipamento
  if (pesquisa) {
    query += `
      AND (
        FABRICANTE LIKE ? OR
        EQUIP LIKE ?
      )
    `;
    const searchTerm = `%${pesquisa}%`;
    params.push(searchTerm, searchTerm);
  }

  if (limite !== null) {
    query += ' LIMIT ?';
    params.push(limite.toString());
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Editar uma consulta pelo ID
const editarConsultaPrioritaria = async (id, dados) => {
  const query = `
    UPDATE TB_GSPI_NT_Consulta_Prioritaria SET
    GBE = ?,
    SWO = ?,
    FIBRA = ?,
    CABO = ?,
    FABRICANTE = ?,
    EQUIP = ?,
    ESP_CADASTRO = ?,
    DATA_ALTERACAO = ?
    WHERE ID = ?`;

  const params = [
    dados.gbe || null,
    dados.swo || null,
    dados.fibra || null,
    dados.cabo || null,
    dados.fabricante || null,
    dados.equip || null,
    dados.espCadastro || null,
    dados.dataAlteracao || null,
    id
  ];

  const [result] = await pool.execute(query, params);
  return result;
};

// Excluir uma consulta pelo ID
const excluirConsultaPrioritaria = async (id) => {
  const query = 'DELETE FROM TB_GSPI_NT_Consulta_Prioritaria WHERE ID = ?';
  await pool.execute(query, [id]);
};



module.exports = {
  cadastrarConsultaPrioritaria,
  listarConsultasPrioritarias,
  editarConsultaPrioritaria,
  excluirConsultaPrioritaria
};