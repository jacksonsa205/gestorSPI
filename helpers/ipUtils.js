/**
 * Função para capturar e tratar o IP do usuário.
 * @param {Object} req - O objeto de requisição do Express.
 * @returns {string} - O IP tratado (IPv4, IPv6 ou um valor padrão).
 */
const getClientIP = (req) => {
    // Captura o IP do cabeçalho 'x-forwarded-for' ou do objeto req
    let ip = req.headers['x-forwarded-for'] || req.ip;
  
    // Remove o prefixo "::ffff:" do IPv6 mapeado para IPv4
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7); // Remove "::ffff:"
    }
  
    // Verifica se o IP é IPv4
    const isIPv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip);
  
    // Se for IPv4, retorna o IP
    if (isIPv4) {
      return ip;
    }
  
    // Verifica se o IP é IPv6
    const isIPv6 = /^[0-9a-fA-F:]+$/.test(ip); // Verifica se o IP contém apenas caracteres hexadecimais e ":"
  
    // Se for IPv6, retorna o IPv6
    if (isIPv6) {
      return ip;
    }
  
    // Se não for IPv4 nem IPv6, retorna um valor padrão
    return 'IP não disponível';
  };
  
  module.exports = { getClientIP };