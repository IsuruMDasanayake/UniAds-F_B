import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import './LineChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ title, data, labels, color = '#3b82f6', loading = false }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                titleFont: {
                    family: "'Poppins', sans-serif",
                    size: 13,
                    weight: 700
                },
                bodyColor: '#475569',
                bodyFont: {
                    family: "'Poppins', sans-serif",
                    size: 12,
                    weight: 600
                },
                borderColor: '#e2e8f0',
                borderWidth: 2,
                padding: 12,
                displayColors: false,
                cornerRadius: 8,
                caretSize: 6,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                callbacks: {
                    label: (context) => ` ${context.parsed.y}`,
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 11,
                        weight: 600
                    },
                    color: '#94a3b8',
                    padding: 8
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: '#f1f5f9',
                    borderDash: [8, 4],
                    lineWidth: 1
                },
                ticks: {
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 11,
                        weight: 600
                    },
                    color: '#94a3b8',
                    maxTicksLimit: 6,
                    padding: 12
                },
                border: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            line: {
                borderWidth: 3
            },
            point: {
                hoverBorderWidth: 3
            }
        }
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data: data,
                borderColor: color,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                    gradient.addColorStop(0, `${color}40`); // 25% opacity
                    gradient.addColorStop(0.5, `${color}20`); // 12% opacity
                    gradient.addColorStop(1, `${color}00`); // 0% opacity
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: color,
                pointBorderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: color,
                pointHoverBorderWidth: 3,
            },
        ],
    };

    if (loading) return <div className="analytics-line-chart-component skeleton"></div>;

    return (
        <div className="analytics-line-chart-component">
            <div className="line-chart-header">
                <h3 className="line-chart-title">{title}</h3>
            </div>
            <div className="chart-canvas-wrapper">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default LineChart;
