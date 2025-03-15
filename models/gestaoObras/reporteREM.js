const pool = require('../../config/db');

// Listar todos os registros da tabela TB_GSPI_GO_Reporte_REM
const listarReportesREM = async (filtro = {}) => {
    let query = `
        SELECT 
            REM, 
            ID_OBRA, 
            MUNICIPIO, 
            CLUSTER, 
            CONTRATADA, 
            GRUPO, 
            VALOR, 
            CRITICIDADE, 
            DESCRICAO, 
            ETAPA, 
            INICIO, 
            ENTREGA, 
            PRAZO, 
            OBSERVACOES, 
            LAT, 
            \`LONG\`
        FROM TB_GSPI_GO_Reporte_REM
    `;

    const params = [];

    if (filtro.rem) {
        query += ' WHERE REM = ?';
        params.push(filtro.rem);
    }

    query += ' ORDER BY INICIO DESC;';

    const [rows] = await pool.execute(query, params);
    return rows;
};

// Cadastrar um novo registro na tabela TB_GSPI_GO_Reporte_REM
const cadastrarReporteREM = async (dados) => {
    const query = `
        INSERT INTO TB_GSPI_GO_Reporte_REM 
        (REM, ID_OBRA, MUNICIPIO, CLUSTER, CONTRATADA, GRUPO, VALOR, CRITICIDADE, DESCRICAO, ETAPA, INICIO, ENTREGA, OBSERVACOES, LAT, \`LONG\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        dados.REM,
        dados.idObra,
        dados.municipio,
        dados.cluster,
        dados.contratada,
        dados.grupo,
        dados.valor,
        dados.criticidade,
        dados.descricao,
        dados.etapa,
        dados.inicio,
        dados.entrega,
        dados.observacoes,
        dados.lat,
        dados.long
    ];

    const [result] = await pool.execute(query, params);
    return result;
};

// Editar um registro na tabela TB_GSPI_GO_Reporte_REM
const editarReporteREM = async (rem, dados) => {
  const query = `
      UPDATE TB_GSPI_GO_Reporte_REM SET
      ID_OBRA = ?,
      MUNICIPIO = ?,
      CLUSTER = ?,
      CONTRATADA = ?,
      GRUPO = ?,
      VALOR = ?,
      CRITICIDADE = ?,
      DESCRICAO = ?,
      ETAPA = ?,
      INICIO = ?,
      ENTREGA = ?,
      OBSERVACOES = ?,
      LAT = ?,
      \`LONG\` = ?
      WHERE REM = ?
  `;

  const params = [
      dados.idObra,
      dados.municipio,
      dados.cluster,
      dados.contratada,
      dados.grupo,
      dados.valor,
      dados.criticidade,
      dados.descricao,
      dados.etapa,
      dados.inicio,
      dados.entrega,
      dados.observacoes,
      dados.lat,
      dados.long,
      rem
  ];

  const [result] = await pool.execute(query, params);
  return result;
};

// Excluir um registro da tabela TB_GSPI_GO_Reporte_REM
const excluirReporteREM = async (rem) => {
    const query = 'DELETE FROM TB_GSPI_GO_Reporte_REM WHERE REM = ?';
    await pool.execute(query, [rem]);
};

module.exports = {
    listarReportesREM,
    cadastrarReporteREM,
    editarReporteREM,
    excluirReporteREM
};