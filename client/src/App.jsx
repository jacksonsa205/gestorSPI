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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
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
