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
import WhatsAppSender from "../../../components/WhatsAppSender/WhatsAppSender";
import useAuthValidation from '../../../hooks/useAuthValidation';
import Loading from '../../../components/Loading/Loading';
import './MapaREM.css';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { registrarLog } from '../../../hooks/logs';

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
const criarIcone = (cor, quantidade) => {
  // Tamanho baseado na quantidade (mínimo 20, máximo 40)
  const tamanho = Math.min(20 + Math.sqrt(quantidade) * 5, 40);
  
  return L.divIcon({
    className: 'custom-icon',
    iconSize: [tamanho, tamanho],
    html: `
      <div style="
        background-color: ${cor}; 
        width: ${tamanho}px; 
        height: ${tamanho}px; 
        border-radius: 50%; 
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(tamanho/3, 10)}px;
      ">
        ${quantidade}
      </div>
    `
  });
};

const MapaREM = () => {
  const { loading, user, permissions } = useAuthValidation(2, 2, 1);
  const [obras, setObras] = useState([]);
  const token = localStorage.getItem('token'); 
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

        await registrarLog(
          token,
          'Consulta',
          'Gestão Obra - Mapa REM - Página carregada com sucesso'
        );

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

  // Adicione este componente antes do MapaREM
  const LegendaFixa = () => {
    return (
      <div className="leaflet-fixed-legend">
        <h5>Status das Obras</h5>
        <div className="legend-items">
          {etapasConfig.map((etapa) => (
            <div key={etapa.etapa} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: etapa.cor }}></div>
              <span style={{ fontSize: '12px' }}>{etapa.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };


  if (loading) {
    return <Loading />; 
  }

  if (!permissions.canRead) {
    return <div>Você não tem permissão para visualizar esta página. Contate o administrador.</div>;
  }

  return (
    <Layout
      title={
        <div className="d-flex justify-content-between align-items-center w-100">
          <span>Mapa Obras REM</span>
          {permissions.canEnviar && (
            <WhatsAppSender
              elementSelector="#mapa-obras-rem"
              fileName={`mapa_obras_rem_${formatarDataHoraAtual().replace(/[/,: ]/g, '_')}.png`}
              caption={`Mapa de Obras REM - ${formatarDataHoraAtual()}`}
              className="text-success p-1 me-2 fs-3"
              includeControls={true} // Isso garante que os controles de camada serão incluídos
            />
          )}
        </div>
      }
      content={
        <Container fluid className="mt-4">
          <Row>
            <Col>
              {!loading && permissions.canRead && (
                <MapContainer 
                id="mapa-obras-rem"
                center={[-22.91527126881271, -47.073432593365936]} 
                zoom={7} 
                style={{ height: '600px', width: '100%', position: 'relative' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
              
                {/* Legenda Fixa (apenas visual) */}
                <LegendaFixa />
              
                {/* Legenda interativa personalizada (mantida como estava) */}
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
              
                {/* Marcadores agrupados por localização */}
                {etapasConfig.map((etapa) => {
                  // Agrupa obras por município para esta etapa específica
                  const obrasPorMunicipio = obrasFiltradas
                    .filter(obra => obra.ETAPA === etapa.etapa)
                    .reduce((acc, obra) => {
                      const key = obra.MUNICIPIO;
                      if (!acc[key]) {
                        acc[key] = {
                          municipio: obra.MUNICIPIO,
                          cluster: obra.CLUSTER,
                          lat: obra.LAT,
                          long: obra.LONG,
                          quantidade: 0,
                          obras: []
                        };
                      }
                      acc[key].quantidade++;
                      acc[key].obras.push(obra);
                      return acc;
                    }, {});

                  return Object.values(obrasPorMunicipio).map((grupo) => (
                    <Marker
                      key={`${etapa.etapa}-${grupo.municipio}`}
                      position={[grupo.lat, grupo.long]}
                      icon={criarIcone(etapa.cor, grupo.quantidade)}
                    >
                      <Popup>
                        <div className="popup-container">
                          <div className="popup-header">
                            <h3 className="popup-title">{grupo.municipio} - {grupo.cluster}</h3>
                          </div>
                          <div className="popup-body">
                            <div className="popup-section">
                              <h4 className="popup-section-title">Criticidades</h4>
                              <ul className="popup-list">
                                {Object.entries(contarCriticidades(grupo.municipio)).map(([crit, count]) => (
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
                                {grupo.obras.map((obra, index) => (
                                  <div key={index} className="popup-table-row">
                                    <div className="popup-table-cell">{obra.REM}</div>
                                    <div className="popup-table-cell">
                                      {obra.ENTREGA ? new Date(obra.ENTREGA).toLocaleDateString('pt-BR') : 'N/A'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ));
                })}
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