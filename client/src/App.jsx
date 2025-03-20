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
import ReporteREM from './pages/GestaoObras/ReporteREM/ReporteREM';
import MapaREM from './pages/GestaoObras/Mapa/MapaREM';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/gestao-obras/reporteREM" element={<ReporteREM />} />
        <Route path="/gestao-obras/mapaREM" element={<MapaREM />} />
        <Route path="/nucleo-tecnico/consultaOLT" element={<ConsultaOLT />} />
        <Route path="/nucleo-tecnico/consultaPrioritaria" element={<ConsultaPrioritaria />} />
        <Route path="/nucleo-tecnico/olt-isolada" element={<OltIsolada />} />
        <Route path="/nucleo-tecnico/olt-uplink" element={<OltUplink />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Usuario/>} />
        <Route path="/acesso" element={<Acesso />} />
        <Route path="/log-aplicacao" element={<LogAplicacao />} />
        <Route path="/escala-plantao" element={<EscalaPlantao />} />
      </Routes>
    </Router>
  );
}

export default App;
