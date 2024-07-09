import { Chart, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const generateScatterPlot = (valuesX, valuesY) => {
  const ctx = document.getElementById('scatterPlot').getContext('2d');
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Scatter Plot',
        data: valuesX.map((x, i) => ({ x, y: valuesY[i] })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    },
    options: {
      scales: {
        x: { type: 'linear', position: 'bottom' },
        y: { type: 'linear', position: 'left' },
      },
    },
  });
};
