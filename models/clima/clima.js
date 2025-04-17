const pool = require('../../config/db');

const salvarClimaHorario = async (dados) => {
  const query = `
    INSERT INTO TB_GSPI_NT_Dados_Climaticos (
      MUNICIPIO, ESTADO, LAT, LNG, DATA_HORA,
      TEMP_C, TEMP_F, CONDICAO_TEXTO, CONDICAO_ICON,
      WIND_MPH, WIND_KPH, WIND_GRAU, WIND_DIRECAO,
      PRESSAO_MB, PRECIP_MM, UMIDADE, NUVENS,
      SENSA_C, WINDCHILL_C, HEATINDEX_C, DEWPOINT_C,
      VIS_KM, UV, RAJADA_KPH, ALT_ONDA_METRO,
      ALT_MAROL_METRO, DIR_MAROL, PERIODO_MAROL_SEG, TEMP_AGUA_C
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    dados.MUNICIPIO, dados.ESTADO, dados.LAT, dados.LNG, dados.time,
    dados.temp_c, dados.temp_f, dados.condition.text, dados.condition.icon,
    dados.wind_mph, dados.wind_kph, dados.wind_degree, dados.wind_dir,
    dados.pressure_mb, dados.precip_mm, dados.humidity, dados.cloud,
    dados.feelslike_c, dados.windchill_c, dados.heatindex_c, dados.dewpoint_c,
    dados.vis_km, dados.uv, dados.gust_kph, dados.sig_ht_mt,
    dados.swell_ht_mt, dados.swell_dir_16_point, dados.swell_period_secs, dados.water_temp_c
  ];

  await pool.execute(query, values);
};

const buscarClimaNoBanco = async () => {
  const query = `
    SELECT 
    ID, MUNICIPIO, ESTADO, LAT, LNG, DATA_HORA, TEMP_C, TEMP_F, 
    CONDICAO_TEXTO, CONDICAO_ICON, WIND_MPH, WIND_KPH, WIND_GRAU, 
    WIND_DIRECAO, PRESSAO_MB, PRECIP_MM, UMIDADE, NUVENS, SENSA_C, 
    WINDCHILL_C, HEATINDEX_C, DEWPOINT_C, VIS_KM, UV, RAJADA_KPH, 
    ALT_ONDA_METRO, ALT_MAROL_METRO, DIR_MAROL, PERIODO_MAROL_SEG, TEMP_AGUA_C, 
    DATA_REGISTRO
FROM 
    railway.TB_GSPI_NT_Dados_Climaticos
WHERE 
    DATE(DATA_REGISTRO) = CURDATE()
ORDER BY 
    MUNICIPIO ASC,
    HOUR(DATA_HORA) ASC;
  `;

  const [rows] = await pool.execute(query);
  return rows;
};

module.exports = {
  salvarClimaHorario,
  buscarClimaNoBanco,
};
