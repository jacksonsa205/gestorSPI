import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
import './BarChart.css'; 

const BarChartComponent = ({ data, title, cor = '#0066ff' }) => {
  return (
    <div className="chart-background"> {/* Substituído o Card por um div com a classe chart-background */}
      <div className="chart-card-body">
        <div className="chart-title">
          <FontAwesomeIcon icon={faChartColumn} className="me-2" />
          {title}
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#666' }}
                tickLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                tickLine={{ stroke: '#ddd' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill={cor} // Usando a cor passada como parâmetro
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  fill="#333" 
                  fontSize={12} 
                  fontWeight="bold" 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

BarChartComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  cor: PropTypes.string // Adicionando o parâmetro cor como opcional
};

export default BarChartComponent;