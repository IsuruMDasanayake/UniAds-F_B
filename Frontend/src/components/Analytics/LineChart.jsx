import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import './LineChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ title, data, labels, color = '#3b82f6', datasets, loading = false, showLegend = false }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 11,
                        weight: 600
                    },
                    color: '#64748b'
                }
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
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                boxPadding: 4,
                usePointStyle: true,
                cornerRadius: 8,
                caretSize: 6,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                callbacks: {
                    label: (context) => ` ${context.dataset.label}: ${context.parsed.y}`,
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
                    padding: 8,
                    maxTicksLimit: 8
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
                },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            line: {
                borderWidth: 3,
                tension: 0.4
            },
            point: {
                radius: 0,
                hoverRadius: 6,
                hoverBorderWidth: 3
            }
        }
    };

    // Handle both single data/color prop AND multiple datasets prop
    let finalDatasets = [];

    if (datasets) {
        finalDatasets = datasets.map(ds => ({
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderWidth: 3,
            fill: ds.fill !== undefined ? ds.fill : false,
            ...ds, // Merge passed props like label, data, borderColor, borderDash, backgroundColor
        }));
    } else {
        // Backward compatibility for single dataset
        finalDatasets = [{
            label: title,
            data: data || [],
            borderColor: color,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                gradient.addColorStop(0, `${color}40`);
                gradient.addColorStop(0.5, `${color}20`);
                gradient.addColorStop(1, `${color}00`);
                return gradient;
            },
            fill: true,
            pointBorderColor: color,
            pointHoverBorderColor: color,
        }];
    }

    const chartData = {
        labels,
        datasets: finalDatasets
    };

    if (loading) return <div className="analytics-line-chart-component skeleton"></div>;

    return (
        <div className="analytics-line-chart-component">
            <div className={`chart-canvas-wrapper ${showLegend ? 'with-legend' : ''}`}>
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default LineChart;
