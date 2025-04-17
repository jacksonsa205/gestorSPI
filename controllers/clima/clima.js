const axios = require('axios');
const municipiosModel = require('../../models/municipios/municipios');
const Model = require('../../models/clima/clima');
const { redisClient } = require('../../config/redis');

// Delay para evitar overload
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Lista de cidades permitidas
const CIDADES_PERMITIDAS = new Set([
  'Adolfo', 'Aguai', 'Agudos', 'Aguas da Prata', 'Aguas de Lindoia',
  'Águas de Santa Bárbara', 'Aguas de Sao Pedro', 'Alambari',
  'Alfredo Marcondes', 'Alumínio', 'Altair', 'Álvares Florence',
  'Álvares Machado', 'Álvaro de Carvalho', 'Alvinlândia', 'Amparo',
  'Americana', 'Aracariguama', 'Araçatuba', 'Araraquara', 'Barueri',
  'Bauru','Carapicuíba', 'Campinas', 'Caraguatatuba', 'Carapicuiba', 'Cotia',
  'Embu das Artes', 'Embu-Guaçu', 'Ilhabela', 'Itapevi', 'Jandira',
  'Juquitiba', 'Jundiaí', 'Mairiporã', 'Osasco', 'Piracicaba',
  'Presidente Prudente', 'Ribeirão Preto', 'Santana de Parnaíba',
  'São Carlos', 'São José do Rio Preto', 'São José dos Campos',
  'São Roque', 'São Sebastião', 'Sorocaba', 'Taboão da Serra',
  'Taubaté', 'Ubatuba', 'Vinhedo'
]);

// 🔄 Rota POST: Atualiza os dados do clima no banco e invalida o cache
const atualizarClima = async (req, res) => {
  const cacheKey = 'dados_climaticos_lista';
  const erros = [];

  let respostaEnviada = false;

  try {
    const municipios = await municipiosModel.listarMunicipios();
    const municipiosFiltrados = municipios.filter(m => CIDADES_PERMITIDAS.has(m.MUNICIPIO));

    console.log(`⏳ Iniciando atualização climática para ${municipiosFiltrados.length} cidades`);

    for (const municipio of municipiosFiltrados) {
      const { LAT, LNG, MUNICIPIO } = municipio;

      try {
        const url = `http://api.weatherapi.com/v1/marine.json?key=${process.env.WEATHER_API_KEY}&q=${LAT},${LNG}&days=1`;
        const { data } = await axios.get(url);
        const horas = data.forecast.forecastday[0].hour;

        for (const hora of horas) {
          try {
            await Model.salvarClimaHorario({ ...municipio, ...hora });
          } catch (err) {
            console.error(`❌ Erro ao salvar ${MUNICIPIO} ${hora.time}:`, err.message);
            erros.push({ municipio: MUNICIPIO, hora: hora.time, erro: err.message });
          }
        }

        await delay(300); // Aguarda entre os municípios
      } catch (err) {
        console.error(`⚠️ Falha ao consultar API de ${MUNICIPIO}:`, err.message);
        erros.push({ municipio: MUNICIPIO, erro: err.message });
      }
    }

    await redisClient.del(cacheKey);
    console.log('✅ Finalizado processo de atualização climática');

    if (!res.headersSent) {
      respostaEnviada = true;
      return res.status(200).json({
        mensagem: '✅ Atualização concluída com sucesso',
        cidadesAtualizadas: municipiosFiltrados.map(m => m.MUNICIPIO),
        totalCidades: municipiosFiltrados.length,
        erros: erros.length > 0 ? erros : 'Nenhum erro registrado'
      });
    }

  } catch (error) {
    console.error('Erro geral:', error);
    if (!res.headersSent) {
      respostaEnviada = true;
      return handleDatabaseError(res, error);
    }
  } finally {
    if (!respostaEnviada && !res.headersSent) {
      res.status(500).json({ erro: 'Erro inesperado durante a atualização climática' });
    }
  }
};


// 🔍 Rota GET: Busca os dados do banco ou do cache
const buscarClima = async (req, res) => {
  const cacheKey = 'dados_climaticos_lista';

  try {
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   console.log('📦 Dados climáticos retornados do cache');
    //   return res.json(JSON.parse(cached));
    // }

    const dados = await Model.buscarClimaNoBanco();

    // Filtrar apenas os dados das cidades permitidas
    const dadosFiltrados = dados.filter(item => 
      CIDADES_PERMITIDAS.has(item.MUNICIPIO)
    );

    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(dadosFiltrados));

    console.log('📥 Dados climáticos retornados do banco');
    res.status(200).json(dadosFiltrados);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

module.exports = {
  atualizarClima,
  buscarClima
};