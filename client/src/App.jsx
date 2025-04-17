import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import Usuario from './pages/Usuario/Usuario';
import Acesso from './pages/Acesso/Acesso';
import LogAplicacao from './pages/LogAplicacao/LogAplicacao';
import EscalaPlantao from './pages/EscalaPlantao/EscalaPlantao';
import ConsultaOLT from './pages/NucleoTecnico/ConsultaOLT/ConsultaOLT';
import ConsultaPrioritaria from './pages/NucleoTecnico/ConsultaPrioritaria/ConsultaPrioritaria';
import OltIsolada from './pages/NucleoTecnico/OltIsolada/OltIsolada';
import OltUplink from './pages/NucleoTecnico/OltUplink/OltUplink';
import GestaoCarimbo from './pages/NucleoTecnico/GestaoCarimbo/GestaoCarimbo';
import OcorrenciasGV from './pages/NucleoTecnico/OcorrenciasGV/OcorrenciasGV';
import ReporteREM from './pages/GestaoObras/ReporteREM/ReporteREM';
import MapaREM from './pages/GestaoObras/Mapa/MapaREM';
import Telegram from './pages/Telegram/Telegram';
import Clima from './pages/Clima/Clima';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/gestao-obras/reporteREM" element={<ReporteREM />} />
        <Route path="/gestao-obras/mapaREM" element={<MapaREM />} />
        <Route path="/nucleo-tecnico-spi/consultaOLT" element={<ConsultaOLT />} />
        <Route path="/nucleo-tecnico-spi/consultaPrioritaria" element={<ConsultaPrioritaria />} />
        <Route path="/nucleo-tecnico-spi/olt-isolada" element={<OltIsolada />} />
        <Route path="/nucleo-tecnico-spi/olt-uplink" element={<OltUplink />} />
        <Route path="/nucleo-tecnico-spi/gestao-carimbo" element={<GestaoCarimbo />} />
        <Route path="/nucleo-tecnico-spi/ocorrencias-grande-vulto" element={<OcorrenciasGV />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Usuario/>} />
        <Route path="/acesso" element={<Acesso />} />
        <Route path="/log-aplicacao" element={<LogAplicacao />} />
        <Route path="/escala-plantao" element={<EscalaPlantao />} />
        <Route path="/Telegram" element={<Telegram />} />
        <Route path="/informacao-climatica" element={<Clima />} />
        
      </Routes>
    </Router>
  );
}

export default App;
