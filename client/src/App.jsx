import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
// import Usuario from './pages/Usuario/Usuario';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/profile" element={<Usuario/>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
