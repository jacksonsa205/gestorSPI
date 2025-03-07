const pool = require('../../config/db');

const permissoes = async () => {
    const query = `
    SELECT ID, PERMISSAO
    FROM TB_GSPI_Permissoes;`;
    
    const [rows] = await pool.execute(query);
    return rows;
};

const modulo = async () => {
    const query = `
    SELECT ID, MODULO
    FROM TB_GSPI_Modulo;`;
    
    const [rows] = await pool.execute(query);
    return rows;
};

const subModulo = async () => {
    const query = `
    SELECT ID, ID_MODULO, SUBMODULO
    FROM TB_GSPI_Submodulo;`;
    
    const [rows] = await pool.execute(query);
    return rows;
};

  
module.exports = {
    permissoes,
    modulo,
    subModulo 
};