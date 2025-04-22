import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Alert,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faSearch, faDownload, faTimesCircle, faTable } from '@fortawesome/free-solid-svg-icons';
import Layout from "../../components/Layout/Layout";
import Loading from '../../components/Loading/Loading';
import CardClima from '../../components/Cards/CardClima/CardClima';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Clima.css';
import useAuthValidation from '../../hooks/useAuthValidation';
import WhatsAppSender from '../../components/WhatsAppSender/WhatsAppSender';
import { registrarLog } from '../../hooks/logs';
import Papa from 'papaparse';

const Clima = () => {
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [dadosClima, setDadosClima] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState({
    pesquisa: '',
    municipio: ''
  });
  const [municipios, setMunicipios] = useState([]);
  const token = localStorage.getItem('token');

  // Validações: módulo 3 (Núcleo Técnico), sem submodulo, ação de leitura (1)
  const { loading, user, permissions } = useAuthValidation(9, null, 1);

  useEffect(() => {
    const carregarDadosClima = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/clima/buscar`);
        if (!response.ok) throw new Error('Erro ao carregar dados climáticos');
        
        const data = await response.json();
        setDadosClima(data);

        await registrarLog(
          token,
          'Consulta',
          'Clima - Página inicial carregada com sucesso'
        );

        // Extrai municípios para o filtro
        const municipiosUnicos = [...new Set(data.map(item => item.MUNICIPIO))]
          .filter(Boolean)
          .map(m => ({ value: m, label: m }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setMunicipios(municipiosUnicos);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
  
    carregarDadosClima();
  }, []);

  const toggleMapa = () => {
    setMostrarMapa(!mostrarMapa);
  };

  const handleDownloadCSV = async () => {
    try {
      const csvData = dadosClima.map(item => ({
        MUNICIPIO: item.MUNICIPIO,
        DATA_HORA: item.DATA_HORA,
        TEMP_C: item.TEMP_C,
        TEMP_F: item.TEMP_F,
        CONDICAO_TEXTO: item.CONDICAO_TEXTO,
        CONDICAO_ICON: item.CONDICAO_ICON,
        WIND_KPH: item.WIND_KPH,
        WIND_DIRECAO: item.WIND_DIRECAO,
        UMIDADE: item.UMIDADE,
        PRECIP_MM: item.PRECIP_MM,
        PRESSAO_MB: item.PRESSAO_MB,
        DEWPOINT_C: item.DEWPOINT_C,
        HEATINDEX_C: item.HEATINDEX_C,
        LAT: item.LAT,
        LNG: item.LNG
      }));

      const csv = Papa.unparse(csvData, {
        delimiter: ";",
        quotes: true,
        header: true,
        encoding: "UTF-8"
      });

      const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'dados_clima.csv';
      link.click();
      URL.revokeObjectURL(link.href);

      await registrarLog(
              token,
              'Download',
              'Clima - CSV baixado com sucesso'
            );

    } catch (error) {
      setErro(error.message);
    }
  };

  const resetarFiltros = () => {
    setFiltro({
      pesquisa: '',
      municipio: ''
    });
  };

  // Criar ícone personalizado para o marcador do mapa
  const criarIconeClima = (temp) => {
    const cor =
      temp >= 38 ? '#b71c1c' :     // vermelho escuro
      temp >= 35 ? '#d32f2f' :     // vermelho forte
      temp >= 32 ? '#f44336' :     // vermelho
      temp >= 29 ? '#ff5722' :     // laranja avermelhado
      temp >= 26 ? '#ff9800' :     // laranja
      temp >= 23 ? '#ffc107' :     // amarelo escuro
      temp >= 20 ? '#ffeb3b' :     // amarelo claro
      temp >= 17 ? '#cddc39' :     // verde amarelado
      temp >= 14 ? '#8bc34a' :     // verde limão
      temp >= 11 ? '#4caf50' :     // verde
                  '#388e3c';       // verde escuro
  
    const corFonte = (cor === '#ffeb3b' || cor === '#ffc107') ? 'black' : 'white';
    const tamanho = 32;
  
    return L.divIcon({
      className: 'custom-icon-clima',
      iconSize: [tamanho, tamanho],
      html: `
        <div style="
          background: ${cor}; 
          width: ${tamanho}px; 
          height: ${tamanho}px; 
          border-radius: 50%; 
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${corFonte};
          font-weight: bold;
          font-size: ${tamanho / 2}px;
        ">
          ${Math.round(temp)}°
        </div>
      `
    });
  };
  

  const horaAtual = new Date().getHours();

  // Filtra os dados antes de agrupar
  const dadosFiltrados = dadosClima.filter(item => {
    if (filtro.pesquisa && !item.MUNICIPIO.toLowerCase().includes(filtro.pesquisa.toLowerCase())) {
      return false;
    }
    if (filtro.municipio && item.MUNICIPIO !== filtro.municipio) {
      return false;
    }
    return true;
  });

  // Agrupa os dados por município
  const dadosAgrupados = dadosFiltrados.reduce((acc, item) => {
    const cidade = item.MUNICIPIO;
    if (!acc[cidade]) acc[cidade] = [];
    acc[cidade].push(item);
    return acc;
  }, {});

  // Formata os dados para os cards
  const climaFormatado = Object.keys(dadosAgrupados).map((cidade) => {
    // Ordena os registros por hora (0-23)
    const registros = dadosAgrupados[cidade]
      .map((item) => ({
        hora: new Date(item.DATA_HORA).getHours(),
        conditionText: item.CONDICAO_TEXTO, 
        conditionIcon: item.CONDICAO_ICON,
        temp: Math.round(parseFloat(item.TEMP_C)),
        vento: Math.round(parseFloat(item.WIND_KPH)),
        direcao: item.WIND_DIRECAO,
        umidade: item.UMIDADE,
        chuva: item.PRECIP_MM || 0,
        pressao: item.PRESSAO_MB,
        minTemp: Math.round(parseFloat(item.DEWPOINT_C)),
        maxTemp: Math.round(parseFloat(item.HEATINDEX_C)),
      }))
      .sort((a, b) => a.hora - b.hora);

    // Cria um array com todas as 24 horas preenchidas com null inicialmente
    const todasHoras = Array(24).fill(null);
    
    // Preenche os dados que temos
    registros.forEach(reg => {
      todasHoras[reg.hora] = reg;
    });

    // Encontra o índice da hora atual
    let indiceAtual = horaAtual;
    
    // Se não tiver dados para a hora atual, procura a próxima disponível
    if (!todasHoras[indiceAtual]) {
      for (let i = 1; i < 24; i++) {
        const proximaHora = (horaAtual + i) % 24;
        if (todasHoras[proximaHora]) {
          indiceAtual = proximaHora;
          break;
        }
      }
    }

    // Coleta as próximas 4 horas (incluindo a atual)
    const proximosRegistros = [];
    let horasColetadas = 0;
    let horaProcurada = indiceAtual;
    
    while (horasColetadas < 4) {
      if (todasHoras[horaProcurada]) {
        proximosRegistros.push(todasHoras[horaProcurada]);
        horasColetadas++;
      }
      horaProcurada = (horaProcurada + 1) % 24;
      
      // Proteção contra loop infinito
      if (horaProcurada === indiceAtual && horasColetadas === 0) {
        // Se não encontrou nenhum dado, usa o primeiro disponível
        const primeiroRegistro = registros[0];
        proximosRegistros.push(primeiroRegistro);
        horasColetadas++;
      }
    }

    const atual = registros[registros.length - 1];

    // Cria os detalhes mantendo a hora correta mas usando a temperatura principal para "Agora"
    const detalhes = proximosRegistros.map((r, index) => {
      const tempParaMostrar = index === 0 ? atual.temp : r.temp;
      return {
        hora: index === 0 ? 'Agora' : `${r.hora}h`,
        conditionText: r.conditionText,
        conditionIcon: r.conditionIcon,
        temp: tempParaMostrar, // Usa a temperatura principal para "Agora"
        vento: r.vento,
        direcao: r.direcao,
        umidade: r.umidade,
        chuva: r.chuva,
      };
    });

    return {
      cidade,
      temp: atual.temp,
      minTemp: atual.minTemp,
      maxTemp: atual.maxTemp,
      conditionText: atual.conditionText,
      conditionIcon: atual.conditionIcon,
      vento: atual.vento,
      direcao: atual.direcao,
      umidade: atual.umidade,
      pressao: atual.pressao,
      detalhes,
    };
  });

  const formatarDataHoraAtual = () => {
    const agora = new Date();
    return agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading || carregando) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página.</div>;
  }

  return (
    <Layout
      title="Informações Climáticas"
      content={
        <Container fluid className="clima-container">
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Row className="mb-3 align-items-center">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {mostrarMapa ? 'Mapa Climático' : 'Dados Climáticos'} 
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={toggleMapa}
                    className="d-flex align-items-center"
                  >
                    <FontAwesomeIcon 
                      icon={mostrarMapa ? faTable : faMap} 
                      className="me-2" 
                    />
                    {mostrarMapa ? 'Mostrar Cards' : 'Mostrar Mapa'} 
                  </Button>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="mb-4 filtros-section">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Pesquisar município"
                  value={filtro.pesquisa}
                  onChange={(e) => setFiltro({...filtro, pesquisa: e.target.value})}
                />
              </InputGroup>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button variant="secondary" onClick={resetarFiltros}>
                <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                Limpar Filtros
              </Button>
              <Button variant="success" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Baixar CSV
              </Button>
            </Col>
          </Row>

          {mostrarMapa ? (
            <MapContainer 
              center={[-22.91527126881271, -47.073432593365936]} 
              zoom={7} 
              style={{ height: '600px', width: '100%', position: 'relative' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {dadosFiltrados.map((clima, index) => (
                <Marker
                  key={index}
                  position={[clima.LAT, clima.LNG]}
                  icon={criarIconeClima(clima.TEMP_C)}
                >
                  <Popup>
                    <div className="popup-clima">
                      <h5>{clima.MUNICIPIO}</h5>
                      <p>
                        <strong>Temperatura:</strong> {Math.round(parseFloat(clima.TEMP_C))}°C ({clima.TEMP_F}°F)
                      </p>
                      <p>
                        <strong>Condição:</strong> {clima.CONDICAO_TEXTO}
                      </p>
                      <p>
                        <strong>Vento:</strong> {clima.WIND_KPH} km/h ({clima.WIND_DIRECAO})
                      </p>
                      <p>
                        <strong>Umidade:</strong> {clima.UMIDADE}%
                      </p>
                      <p>
                        <strong>Atualizado em:</strong> {new Date(clima.DATA_HORA).toLocaleString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <CardClima 
              weatherData={climaFormatado} 
              showWhatsAppButton={permissions.canEnviar}
              dataHoraAtual={formatarDataHoraAtual()}
            />
          )}
        </Container>
      }
    />
  );
};

export default Clima;