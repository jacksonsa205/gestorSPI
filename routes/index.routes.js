const logs = require('./logs/logs.routes');
const auth = require('./usuario/auth.routes');
const permissoes = require('./permissoes/permissoes.routes')
const sessao = require('./usuario/sessao.routes');
const cadastro = require('./usuario/cadastro.routes');
const consultaOLT = require('./nucleoTecnico/consultaOLT.routes');
const consultaPrioritaria = require('./nucleoTecnico/consultaPrioritaria.routes');
const oltIsolada = require('./nucleoTecnico/oltIsolada.routes');
const oltUplink = require('./nucleoTecnico/oltUplink.routes');
const gestaoCarimbo = require('./nucleoTecnico/gestaoCarimbo.routes');
const ocorrenciasGV = require('./nucleoTecnico/ocorrenciasGV.routes');
const reporteREM = require('./gestaoObras/reporteREM.routes');
const olt = require('./olt/olt.routes');
const municipios = require('./municipios/municipios.routes');
const telegram = require('./telegram/telegram.routes');
const whatsapp = require('./whatsapp/whatsapp.routes');
const clima = require('./clima/clima.routes');

module.exports = {
  logs,
  auth,
  permissoes,
  sessao,
  cadastro,
  consultaOLT,
  consultaPrioritaria,
  oltIsolada,
  oltUplink,
  gestaoCarimbo,
  ocorrenciasGV,
  reporteREM,
  olt,
  municipios,
  telegram,
  whatsapp,
  clima
};