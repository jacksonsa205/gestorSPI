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
const listarConsultasPrioritarias = async ({ pesquisa, limite = 5000 }) => {
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

  if (pesquisa) {
    query += `
      AND (
        GBE LIKE ? OR
        SWO LIKE ? OR
        FIBRA LIKE ? OR
        CABO LIKE ? OR
        FABRICANTE LIKE ? OR
        EQUIP LIKE ?
      )
    `;
    const searchTerm = `%${pesquisa}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm); // 6 termos de pesquisa
  }

  query += ' LIMIT ?';
  params.push(limite.toString()); // Garantir que o limite seja uma string

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