const auth = require('./usuario/auth.routes');
const permissoes = require('./permissoes/permissoes.routes')
const sessao = require('./usuario/sessao.routes');
const cadastro = require('./usuario/cadastro.routes');
const consultaOLT = require('./nucleoTecnico/consultaOLT.routes');
const consultaPrioritaria = require('./nucleoTecnico/consultaPrioritaria.routes');
const oltIsolada = require('./nucleoTecnico/oltIsolada.routes');
const oltUplink = require('./nucleoTecnico/oltUplink.routes');
const reporteREM = require('./gestaoObras/reporteREM.routes');
const olt = require('./olt/olt.routes');

module.exports = {
  auth,
  permissoes,
  sessao,
  cadastro,
  consultaOLT,
  consultaPrioritaria,
  oltIsolada,
  oltUplink,
  reporteREM,
  olt
};