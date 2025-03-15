import { Container, Row, Col } from 'react-bootstrap';
import { 
  faClock,
  faExclamationTriangle,
  faTimesCircle,
  faClipboardCheck,
  faDraftingCompass,
  faFileInvoiceDollar,
  faHardHat,
  faCheckCircle,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from "../../../components/Layout/Layout";
import useAuthValidation from '../../../hooks/useAuthValidation';
import Loading from '../../../components/Loading/Loading';
import './MapaREM.css';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Configuração das etapas
const etapasConfig = [
  { etapa: 'PENDENTE', cor: '#dc3545', label: 'Pendente', icone: faClock },
  { etapa: 'PRIORIZADA', cor: '#E97132', label: 'Priorizada', icone: faExclamationTriangle },
  { etapa: 'CANCELADA', cor: '#6c757d', label: 'Cancelada', icone: faTimesCircle },
  { etapa: 'AVALIAÇÃO', cor: '#FA7A6C', label: 'Avaliação', icone: faClipboardCheck },
  { etapa: 'PROJETO', cor: '#9900CC', label: 'Projeto', icone: faDraftingCompass },
  { etapa: 'APROVACAO-CUSTO', cor: '#0C769E', label: 'Aprovação Custo', icone: faFileInvoiceDollar },
  { etapa: 'EXECUÇÃO', cor: '#00B050', label: 'Execução', icone: faHardHat },
  { etapa: 'CONCLUÍDAS', cor: '#0066FF', label: 'Concluídas', icone: faCheckCircle },
];

// Ícone personalizado para marcadores
const criarIcone = (cor) => L.divIcon({
  className: 'custom-icon',
  iconSize: [20, 20],
  html: `<div style="background-color: ${cor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`
});

const MapaREM = () => {
  const { loading, user, permissions } = useAuthValidation(2, 2, 1);
  const [obras, setObras] = useState([]);
  const [legendaVisivel, setLegendaVisivel] = useState(false);
  const [filtroEtapas, setFiltroEtapas] = useState(
    etapasConfig.reduce((acc, etapa) => ({ ...acc, [etapa.etapa]: true }), {})
  );

  useEffect(() => {
    const buscarObras = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/gestao-obra/buscar`);
        const data = await response.json();
        setObras(data);
      } catch (error) {
        console.error('Erro ao buscar obras:', error);
      }
    };
    buscarObras();
  }, []);

  // Filtra obras por etapas ativas
  const obrasFiltradas = obras.filter(obra => 
    obra && 
    etapasConfig.some(e => e.etapa === obra.ETAPA) && 
    filtroEtapas[obra.ETAPA]
  );

  // Contagem de criticidades por município
  const contarCriticidades = (municipio) => 
    obras.filter(obra => obra.MUNICIPIO === municipio)
      .reduce((acc, obra) => ({
        ...acc,
        [obra.CRITICIDADE]: (acc[obra.CRITICIDADE] || 0) + 1
      }), {});
 
// Função para agrupar as REMs por município
const agruparREMsPorMunicipio = (municipio) => {
    return obras
      .filter(obra => obra.MUNICIPIO === municipio)
      .map(obra => {
        // Formata a data para dd/mm/aaaa
        const dataFormatada = obra.ENTREGA
          ? new Date(obra.ENTREGA).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          : 'N/A'; // Caso a data não esteja disponível
  
        return {
          rem: obra.REM,
          dataEntrega: dataFormatada
        };
      });
  };

  // Renderiza ícone personalizado na legenda
  const renderIconeLegenda = (etapa) => (
    <div className="card-mapa-etapa-icon-wrapper" style={{ backgroundColor: etapa.cor }}>
      <FontAwesomeIcon 
        icon={etapa.icone} 
        className="card-mapa-etapa-icon" 
      />
    </div>
  );

  // Renderiza a legenda personalizada
  const renderLegenda = () => (
    <div 
      className="legenda-container" 
      style={{ display: legendaVisivel ? 'block' : 'none' }}
    >
      {etapasConfig.map((etapa) => (
        <div key={etapa.etapa} className="legenda-item">
          <label>
            <input
              type="checkbox"
              checked={filtroEtapas[etapa.etapa]}
              onChange={(e) => setFiltroEtapas(prev => ({
                ...prev,
                [etapa.etapa]: e.target.checked
              }))}
            />
            {renderIconeLegenda(etapa)}
            <span>{etapa.label}</span>
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <Layout
      title="Mapa Obras REM"
      content={
        <Container fluid className="mt-4">
          <Row>
            <Col>
              {!loading && permissions.canRead && (
                <MapContainer 
                  center={[-22.91527126881271, -47.073432593365936]} 
                  zoom={7} 
                  style={{ height: '600px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
  
                  {/* Legenda personalizada */}
                  <div 
                    className="leaflet-top leaflet-right"
                    onMouseEnter={() => setLegendaVisivel(true)}
                    onMouseLeave={() => setLegendaVisivel(false)}
                  >
                    <div className="leaflet-control">
                      <div className="legenda-trigger">
                        <FontAwesomeIcon icon={faList} />
                      </div>
                      {renderLegenda()}
                    </div>
                  </div>
  
                  {/* Marcadores filtrados */}
                  {etapasConfig.map((etapa) => (
                    <LayerGroup key={etapa.etapa}>
                        {obrasFiltradas
                        .filter(obra => obra.ETAPA === etapa.etapa)
                        .map(obra => (
                            <Marker
                            key={obra.REM}
                            position={[obra.LAT, obra.LONG]}
                            icon={criarIcone(etapa.cor)}
                            >
                            <Popup>
                                <div className="popup-container">
                                    <div className="popup-header">
                                    <h3 className="popup-title">{obra.MUNICIPIO} - {obra.CLUSTER}</h3>
                                    </div>
                                    <div className="popup-body">
                                    <div className="popup-section">
                                        <h4 className="popup-section-title">Criticidades</h4>
                                        <ul className="popup-list">
                                        {Object.entries(contarCriticidades(obra.MUNICIPIO)).map(([crit, count]) => (
                                            <li key={crit} className="popup-list-item">
                                            <span className="popup-list-label">{crit}:</span>
                                            <span className="popup-list-value">{count}</span>
                                            </li>
                                        ))}
                                        </ul>
                                    </div>
                                    <div className="popup-section">
                                        <h4 className="popup-section-title">Obras</h4>
                                        <div className="popup-table">
                                        <div className="popup-table-row popup-table-header">
                                            <div className="popup-table-cell">REMs</div>
                                            <div className="popup-table-cell">Data de Entrega</div>
                                        </div>
                                        {agruparREMsPorMunicipio(obra.MUNICIPIO).map((rem, index) => (
                                            <div key={index} className="popup-table-row">
                                            <div className="popup-table-cell">{rem.rem}</div>
                                            <div className="popup-table-cell">{rem.dataEntrega || 'N/A'}</div>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                    ))}
                </MapContainer>
              )}
            </Col>
          </Row>
        </Container>
      }
    />
  );
};

export default MapaREM;