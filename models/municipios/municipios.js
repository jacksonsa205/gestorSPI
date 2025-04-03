const pool = require('../../config/db');


// Listar todas as Municipios
const listarMunicipios = async () => {
    let query = `
    SELECT ID, ESTADO, MUNICIPIO, LAT, LNG
    FROM TB_GSPI_Municipios ORDER BY MUNICIPIO;`;

    const [rows] = await pool.execute(query);
    return rows;
};

module.exports = {
  listarMunicipios,
};
