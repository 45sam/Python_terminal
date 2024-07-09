import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register components explicitly
ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ChartComponent = ({ data }) => {
  const chartData = {
    datasets: [{
      label: 'Scatter Plot',
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  return (
    <div className="chart-container">
      <Scatter data={chartData} />
    </div>
  );
};

export default ChartComponent;
