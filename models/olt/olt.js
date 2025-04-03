const pool = require('../../config/db');


// Listar todas as OLT
const listarOLT = async () => {
    let query = `
    SELECT OLT, CLUSTER, CIDADE
    FROM TB_GSPI_OLTS;`;

    const [rows] = await pool.execute(query);
    return rows;
};

module.exports = {
  listarOLT,
};
