import React, { useState } from 'react';
import Modal from 'react-modal';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './ScatterPlotModal.css';
import MinimizeIcon from './components/MinimizeIcon';
import MaximizeIcon from './components/MaximizeIcon';
import CloseIcon from './components/CloseIcon';

Chart.register(...registerables);

const ScatterPlotModal = ({ isOpen, onClose, data, title }) => {
    const [isMaximized, setIsMaximized] = useState(false);

    const chartData = {
        datasets: [
            {
                label: title || '',
                data: data.map(([x, y]) => ({ x, y })),
                backgroundColor: 'rgba(75,192,192,1)',
                pointRadius: 8, // Set the radius of the points
                pointHoverRadius: 10, // Set the radius of the points when hovered
            },
        ],
    };

    const options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                ticks: {
                    font: {
                        size: 14, // Increase the font size of X-axis ticks
                    },
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 14, // Increase the font size of Y-axis ticks
                    },
                },
            },
        },
    };

    const handleMaximize = () => {
        setIsMaximized(true);
    };

    const handleMinimize = () => {
        setIsMaximized(false);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onClose} 
            ariaHideApp={false} 
            className={`modal-content ${isMaximized ? 'modal-maximized' : 'modal-normal'}`}
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2 className="modal-title">{title}</h2>
                <div className="modal-buttons">
                    {isMaximized ? (
                        <button onClick={handleMinimize} className="minimize-button" title="Minimize">
                            <MinimizeIcon />
                        </button>
                    ) : (
                        <button onClick={handleMaximize} className="maximize-button" title="Maximize">
                            <MaximizeIcon />
                        </button>
                    )}
                    <button onClick={onClose} className="close-button" title="Close">
                        <CloseIcon />
                    </button>
                </div>
            </div>
            <div className="chart-container">
                <Scatter data={chartData} options={options} />
            </div>
        </Modal>
    );
};

export default ScatterPlotModal;
