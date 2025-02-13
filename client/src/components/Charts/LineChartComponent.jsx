import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

const LineChartComponent = ({ data, title }) => {
  return (
    <Card className="chart-card">
      <Card.Body className="chart-card-body">
        <Card.Title className="chart-title">
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          {title}
        </Card.Title>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0066ff" 
                strokeWidth={2}
                dot={{ fill: '#0066ff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

LineChartComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  title: PropTypes.string.isRequired
};

export default LineChartComponent;