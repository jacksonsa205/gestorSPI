const pool = require('../../config/db');

// Cadastrar um novo carimbo
const cadastrarCarimbo = async (dados) => {
    // Garante que valores undefined sejam convertidos para null
    const sanitize = (value) => (value === undefined ? null : value);
    
    const query = `
      INSERT INTO TB_GSPI_NT_Gestao_Carimbo 
      (TA, TA_RAIZ, TIPOS, LOCALIDADE, HOSTNAME, ROTA, DATA_CRIACAO, SLA, STATUS, 
       ALIADA, ESCANOLAMENTO, FABRICANTE, RISCO, AFETACAO, ABORDAGEM, CONDOMINIO, 
       CAUSA, SOLUCAO, MEDICOES, ATUALIZACAO, LAT, LNG, USER_RE, USER_NOME)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
      sanitize(dados.ta),
      sanitize(dados.taRaiz),
      sanitize(dados.tipos),
      sanitize(dados.localidade),
      sanitize(dados.hostname),
      sanitize(dados.rota),
      sanitize(dados.dataCriacao),
      sanitize(dados.sla),
      sanitize(dados.status),
      sanitize(dados.aliada),
      sanitize(dados.escanolamento),
      sanitize(dados.fabricante),
      sanitize(dados.risco),
      sanitize(dados.afetacao),
      sanitize(dados.abordagem),
      sanitize(dados.condominio),
      sanitize(dados.causa),
      sanitize(dados.solucao),
      sanitize(dados.medicoes),
      sanitize(dados.atualizacao),
      sanitize(dados.lat),
      sanitize(dados.lng),
      sanitize(dados.user_re),
      sanitize(dados.user_nome)
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
};

// Listar todos os carimbos
const listarCarimbos = async (filtro = {}) => {
    let query = `
      SELECT 
          TA,
          TA_RAIZ,
          TIPOS,
          LOCALIDADE,
          HOSTNAME,
          ROTA,
          DATE_FORMAT(DATA_CRIACAO, '%d/%m/%Y %H:%i') AS DATA_CRIACAO_FT,
          DATE_FORMAT(DATA_CRIACAO, '%Y-%m-%d %H:%i:%s') AS DATA_CRIACAO,
          SLA,
          STATUS,
          ALIADA,
          ESCANOLAMENTO,
          FABRICANTE,
          RISCO,
          AFETACAO,
          ABORDAGEM,
          CONDOMINIO,
          CAUSA,
          SOLUCAO,
          MEDICOES,
          ATUALIZACAO,
          LAT,
          LNG,
          USER_RE, 
          USER_NOME
      FROM TB_GSPI_NT_Gestao_Carimbo
    `;
  
    const params = [];
  
    if (filtro.ta) {
      query += ' WHERE TA = ?';
      params.push(filtro.ta);
    }
  
    if (filtro.hostname) {
      query += params.length ? ' AND HOSTNAME LIKE ?' : ' WHERE HOSTNAME LIKE ?';
      params.push(`%${filtro.hostname}%`);
    }
  
    query += ' ORDER BY DATA_CRIACAO DESC;';
  
    const [rows] = await pool.execute(query, params);
    return rows;
};

// Editar um carimbo
const editarCarimbo = async (ta, dados) => {
    const sanitize = (value) => (value === undefined ? null : value);
    
    // Primeiro, buscar os valores atuais do banco de dados
    const [currentData] = await pool.execute(
        'SELECT MEDICOES, ATUALIZACAO FROM TB_GSPI_NT_Gestao_Carimbo WHERE TA = ?', 
        [ta]
    );
    
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Formatar os novos valores para as colunas incrementais
    const formatIncrementalValue = (newValue, currentValue, user_re) => {
        if (!newValue) return currentValue || null;
        
        const userInfo = user_re ? `| [${timestamp} - RE:${user_re}]` : `| [${timestamp}]`;
        const separator = currentValue ? '\n\n' : '';
        return `${currentValue || ''}${separator}${userInfo}\n${newValue}`;
    };
    
    const novasMedicoes = formatIncrementalValue(
        dados.medicoes, 
        currentData[0]?.MEDICOES, 
        dados.user_re
    );
    
    const novasAtualizacoes = formatIncrementalValue(
        dados.atualizacao, 
        currentData[0]?.ATUALIZACAO, 
        dados.user_re
    );
    
    const query = `
      UPDATE TB_GSPI_NT_Gestao_Carimbo SET
          TA_RAIZ = ?,
          TIPOS = ?,
          LOCALIDADE = ?,
          HOSTNAME = ?,
          ROTA = ?,
          DATA_CRIACAO = ?,
          STATUS = ?,
          ALIADA = ?,
          FABRICANTE = ?,
          RISCO = ?,
          AFETACAO = ?,
          ABORDAGEM = ?,
          CONDOMINIO = ?,
          CAUSA = ?,
          SOLUCAO = ?,
          MEDICOES = ?,
          ATUALIZACAO = ?,
          LAT = ?,
          LNG = ?,
          USER_RE = ?,
          USER_NOME = ?
      WHERE TA = ?`;
  
    const params = [
      sanitize(dados.taRaiz),
      sanitize(dados.tipos),
      sanitize(dados.localidade),
      sanitize(dados.hostname),
      sanitize(dados.rota),
      sanitize(dados.dataCriacao),
      sanitize(dados.status),
      sanitize(dados.aliada),
      sanitize(dados.fabricante),
      sanitize(dados.risco),
      sanitize(dados.afetacao),
      sanitize(dados.abordagem),
      sanitize(dados.condominio),
      sanitize(dados.causa),
      sanitize(dados.solucao),
      novasMedicoes,
      novasAtualizacoes,
      sanitize(dados.lat),
      sanitize(dados.lng),
      sanitize(dados.user_re),
      sanitize(dados.user_nome),
      ta
    ];
  
    const [result] = await pool.execute(query, params);
    return result;
};


// Excluir um carimbo
const excluirCarimbo = async (ta) => {
    const query = 'DELETE FROM TB_GSPI_NT_Gestao_Carimbo WHERE TA = ?';
    await pool.execute(query, [ta]);
};

module.exports = {
    cadastrarCarimbo,
    listarCarimbos,
    editarCarimbo,
    excluirCarimbo
};