const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Cria uma instância do axios que ignora certificados SSL
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  }),
  timeout: 10000
});

class GeocodingService {
  constructor() {
    this.apiKey = process.env.API_GEOCODING;
    this.baseUrl = 'https://geocode.maps.co/search';
  }

  async getCoordinates(address) {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        params: {
          q: address,
          api_key: this.apiKey
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      }
      
      return null;
    } catch (error) {
      // Não mostra erros de certificado no log
      if (!error.message.includes('self-signed certificate')) {
        console.error(`Erro ao geocodificar ${address}:`, error.message);
      }
      return null;
    }
  }

  async getMunicipioCenter(municipio) {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        params: {
          q: `${municipio}, SP`, // Assume São Paulo como estado
          api_key: this.apiKey
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (error) {
      // Não mostra erros de certificado no log
      if (!error.message.includes('self-signed certificate')) {
        console.error(`Erro ao buscar centro de ${municipio}:`, error.message);
      }
      return null;
    }
  }
}

module.exports = new GeocodingService();