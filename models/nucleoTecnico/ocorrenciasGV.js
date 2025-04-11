const pool = require('../../config/db');

const listarOcorrencias = async (filtro = {}) => {
    let query = `
        SELECT 
            OCORRENCIA, 
            ID_SUSPEITA, 
            MES, 
            DATA_OCORRENCIA, 
            \`AT\`, 
            MUNICIPIO, 
            CONTRATADA, 
            CABO, 
            CAUSA, 
            \`QTD PRIMARIAS\`, 
            BD, 
            AFETACAO, 
            CLIENTE_V, 
            CLIENTE_VIP, 
            STATUS, 
            mun, 
            LAT, 
            LNG
        FROM railway.TB_GSPI_NT_Ocorrencias_GV
        WHERE LAT IS NOT NULL AND LNG IS NOT NULL
    `;

    const params = [];

    // Filtros opcionais
    if (filtro.ocorrencia) {
        query += ' AND OCORRENCIA LIKE ?';
        params.push(`%${filtro.ocorrencia}%`);
    }

    if (filtro.municipio) {
        query += ' AND MUNICIPIO LIKE ?';
        params.push(`%${filtro.municipio}%`);
    }

    if (filtro.mes) {
        query += ' AND MES = ?';
        params.push(filtro.mes);
    }

    query += ' ORDER BY DATA_OCORRENCIA DESC;';

    const [rows] = await pool.execute(query, params);
    return rows;
};

module.exports = {
    listarOcorrencias
};