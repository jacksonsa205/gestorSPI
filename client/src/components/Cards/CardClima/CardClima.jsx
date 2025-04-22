import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faBolt,
  faSmog,
  faMoon,
  faWind,
  faLocationArrow,
  faClock,          
  faDroplet,        
  faTemperatureHalf,
  faCompass,        
} from '@fortawesome/free-solid-svg-icons';
import './CardClima.css';

// Mapeamento unificado das condições climáticas
const weatherConfig = {
  // Condições ensolaradas
  'Sunny': {
    gradient: ['#FFD700', '#FFA500'],
    icon: faSun,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/113.png'
    },
    translation: 'Ensolarado'
  },
  'Clear': {
    gradient: ['#FFD700', '#FFA500'],
    icon: faSun,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/113.png'
    },
    translation: 'Céu limpo'
  },
  
  // Condições nubladas
  'Partly Cloudy': {
    gradient: ['#A9A9A9', '#778899'],
    icon: faCloud,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/116.png'
    },
    translation: 'Parcialmente nublado'
  },
  'Cloudy': {
    gradient: ['#A9A9A9', '#778899'],
    icon: faCloud,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/119.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/119.png'
    },
    translation: 'Nublado'
  },
  'Overcast': {
    gradient: ['#A9A9A9', '#778899'],
    icon: faCloud,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/122.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/122.png'
    },
    translation: 'Encoberto'
  },
  
  // Condições de chuva
  'Patchy rain nearby': {
    gradient: ['#4682B4', '#1E90FF'],
    icon: faCloudRain,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/176.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/176.png'
    },
    translation: 'Chuvas isoladas próximas'
  },
  'Light rain shower': {
    gradient: ['#4682B4', '#1E90FF'],
    icon: faCloudRain,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/353.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/353.png'
    },
    translation: 'Chuva leve'
  },
  'Patchy light drizzle': {
    gradient: ['#4682B4', '#1E90FF'],
    icon: faCloudRain,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/263.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/263.png'
    },
    translation: 'Garoa leve isolada'
  },
  'Light rain': {
    gradient: ['#4682B4', '#1E90FF'],
    icon: faCloudRain,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/296.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/296.png'
    },
    translation: 'Chuva fraca'
  },
  'Light drizzle': {
    gradient: ['#4682B4', '#1E90FF'],
    icon: faCloudRain,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/266.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/266.png'
    },
    translation: 'Garoa leve'
  },
  
  // Condições de tempestade
  'Thunder': {
    gradient: ['#4B0082', '#9400D3'],
    icon: faBolt,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/200.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/200.png'
    },
    translation: 'Trovoada'
  },
  'Patchy light rain in area with thunder': {
    gradient: ['#4B0082', '#9400D3'],
    icon: faBolt,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/386.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/386.png'
    },
    translation: 'Chuvas leves com trovoadas na região'
  },
  'Thundery outbreaks in nearby': {
    gradient: ['#4B0082', '#9400D3'],
    icon: faBolt,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/200.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/200.png'
    },
    translation: 'Trovoadas nas proximidades'
  },
  
  // Condições de neve
  'Snow': {
    gradient: ['#E6E6FA', '#ADD8E6'],
    icon: faSnowflake,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/179.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/179.png'
    },
    translation: 'Neve'
  },
  
  // Condições de neblina
  'Foggy': {
    gradient: ['#D3D3D3', '#C0C0C0'],
    icon: faSmog,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/248.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/248.png'
    },
    translation: 'Neblina'
  },
  'Mist': {
    gradient: ['#D3D3D3', '#C0C0C0'],
    icon: faSmog,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/143.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/143.png'
    },
    translation: 'Névoa'
  },
  
  // Condição padrão para casos não mapeados
  'default': {
    gradient: ['#A9A9A9', '#778899'],
    icon: faCloud,
    apiIcons: {
      day: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      night: '//cdn.weatherapi.com/weather/64x64/night/113.png'
    },
    translation: 'Condição desconhecida'
  }
};

// Função para determinar se é dia ou noite
const isDayTime = (hora) => {
  if (hora === 'Agora') {
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18;
  }
  const hour = parseInt(hora.split('h')[0]);
  return hour >= 6 && hour < 18;
};

// Mapeamento dos ângulos de rotação para cada direção
const windDirectionAngles = {
  'N': 0,
  'NNE': 22.5,
  'NE': 45,
  'ENE': 67.5,
  'E': 90,
  'ESE': 112.5,
  'SE': 135,
  'SSE': 157.5,
  'S': 180,
  'SSW': 202.5,
  'SW': 225,
  'WSW': 247.5,
  'W': 270,
  'WNW': 292.5,
  'NW': 315,
  'NNW': 337.5
};

// Componente da Seta de Direção
const WindDirectionArrow = ({ direction }) => {
  const angle = windDirectionAngles[direction] || 0;
  
  return (
    <FontAwesomeIcon 
      icon={faLocationArrow}
      style={{
        color: '#e74c3c',
        transform: `rotate(${angle}deg)`,
        transition: 'transform 0.3s ease',
        marginRight: '6px'
      }}
    />
  );
};

const CardClima = ({ weatherData }) => {
  return (
    <Row className="g-3 mb-4">
      {weatherData.map((weather, index) => {
        // Verifica se a condição climática existe no weatherConfig
        const normalize = (text) => text?.toLowerCase().replace(/\s+/g, ' ').trim();

        const conditionKey = Object.keys(weatherConfig).find(key =>
          normalize(key) === normalize(weather.conditionText)
        ) || 'default';

        
        const weatherCondition = weatherConfig[conditionKey];
        
        return (
          <Col key={index} xs={12} md={6} lg={4}>
            <Card className="card-clima-container">
              <Card.Body className="card-clima-body">
                {/* Cabeçalho com cidade e temperatura */}
                <div className="card-clima-header">
                  <div className="card-clima-cidade text-truncate">
                    {weather.cidade}
                    <div className="card-clima-condicao">
                      {weatherCondition.translation}
                    </div>
                  </div>
                  <div className="card-clima-temp-wrapper">
                    <div 
                      className="card-clima-icon-wrapper"
                      style={{ 
                        background: `linear-gradient(135deg, ${weatherCondition.gradient})`
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={weatherCondition.icon} 
                        className="card-clima-icon" 
                      />
                    </div>
                    <div>
                      <div className="card-clima-temp">
                        {weather.temp}°
                      </div>
                      <div className="card-clima-range">
                        {weather.minTemp}° - {weather.maxTemp}°
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tabela horizontal sem bordas */}
                <div className="card-clima-tabela">
                  {/* Linha de Horas */}
                  <div className="card-clima-row">
                    <div className="card-clima-label"><FontAwesomeIcon icon={faClock}/> Hora</div>
                    {weather.detalhes.map((detalhe, idx) => (
                      <div key={`hora-${idx}`} className="card-clima-value">
                        {detalhe.hora}
                      </div>
                    ))}
                  </div>
                  
                  {/* Linha de Ícones */}
                  <div className="card-clima-row">
                    <div className="card-clima-label"><FontAwesomeIcon icon={faSun}/> Clima</div>
                    {weather.detalhes.map((detalhe, idx) => {
                      // Corrige o link do backend (adiciona https: se necessário)
                      const iconUrl = detalhe.conditionIcon?.startsWith('//')
                        ? `https:${detalhe.conditionIcon}`
                        : detalhe.conditionIcon;

                      return (
                        <div key={`icone-${idx}`} className="card-clima-value">
                          <div className="card-clima-icon-small-wrapper">
                            {iconUrl ? (
                              <img
                                src={iconUrl}
                                alt={detalhe.conditionText}
                                className="card-clima-icon-small"
                                style={{ width: 25, height: 25 }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://cdn.weatherapi.com/weather/64x64/day/113.png"; 
                                }}
                              />
                            ) : (
                              <FontAwesomeIcon icon={faCloud} className="card-clima-icon-small" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Linha de Temperaturas */}
                
                  <div className="card-clima-row">
                  <div className="card-clima-label"><FontAwesomeIcon icon={faTemperatureHalf}/> Temp</div>
                    {weather.detalhes.map((detalhe, idx) => {
                      const temp = Math.floor(detalhe.temp); // Remove decimais se houver
                      return (
                        <div 
                          key={`temp-${idx}`} 
                          className="card-clima-value"
                          data-temp={temp} // Passa o valor inteiro como atributo
                        >
                          {temp}°
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Linha de Vento */}
                  <div className="card-clima-row">
                    <div className="card-clima-label"><FontAwesomeIcon icon={faWind}/> Vento</div>
                    {weather.detalhes.map((detalhe, idx) => (
                      <div key={`vento-${idx}`} className="card-clima-value">
                        {detalhe.vento} km/h
                      </div>
                    ))}
                  </div>
                  
                  {/* Linha de Direção */}
                  <div className="card-clima-row">
                    <div className="card-clima-label"><FontAwesomeIcon icon={faCompass}/> Dir</div>
                    {weather.detalhes.map((detalhe, idx) => (
                      <div key={`direcao-${idx}`} className="card-clima-value">
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          <WindDirectionArrow direction={detalhe.direcao} />
                          <span>{detalhe.direcao}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Linha de Umidade */}
                  <div className="card-clima-row">
                    <div className="card-clima-label"><FontAwesomeIcon icon={faDroplet}/> Umid</div>
                    {weather.detalhes.map((detalhe, idx) => (
                      <div key={`umidade-${idx}`} className="card-clima-value">
                        {detalhe.umidade}%
                      </div>
                    ))}
                  </div>
                  {/* Linha de Chuva*/}
                  <div className="card-clima-row">
                    <div className="card-clima-label"><FontAwesomeIcon icon={faCloudRain}/> Chuva</div>
                    {weather.detalhes.map((detalhe, idx) => (
                      <div 
                      key={`chuva-${idx}`} 
                      className="card-clima-value" 
                      data-chuva={`${detalhe.chuva}mm`}
                    >
                      {detalhe.chuva}mm
                    </div>
                    ))}
                  </div>
                </div>

              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default CardClima;