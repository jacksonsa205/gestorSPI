import React, { useState } from "react";
import "./Dashboard.css";
import Sidebar from "../../components/Sidebar/Sidebar"; 
import Header from "../../components/Header/Header";
import CardSimples from "../../components/Cards/CardSimples/CardSimples";

import { faBuilding, faTasks, faExclamationCircle, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Dados mockados para o gráfico
const data = [
  { name: "Jan", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Feb", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Mar", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Apr", uv: 2780, pv: 3908, amt: 2000 },
  { name: "May", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Jun", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Jul", uv: 3490, pv: 4300, amt: 2100 },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Controla se a sidebar está aberta ou fechada
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); // Função que alterna o estado da sidebar

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} /> {/* Passa o estado de abertura da sidebar */}
      <div className={`dashboard-container ${isSidebarOpen ? 'open' : 'closed'}`}> {/* Classe condicional aqui */}
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>

          <div className="dashboard-cards">
            <CardSimples
              titulo="Total de Obras"
              icone={faBuilding}
              valor="167"
              isOpen={isSidebarOpen}
            />
            <CardSimples
              titulo="Pendentes"
              icone={faTasks}
              valor="116"
              isOpen={isSidebarOpen}
            />
            <CardSimples
              titulo="Priorizadas"
              icone={faExclamationCircle}
              valor="51"
              isOpen={isSidebarOpen}
            />
            <CardSimples
              titulo="Concluídas"
              icone={faThumbsUp}
              valor="51"
              isOpen={isSidebarOpen}
            />
          </div>

          <div className="dashboard-charts">
            <h2>Gráfico de Crescimento</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="uv" fill="#8884d8" />
                <Bar dataKey="pv" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
