import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';
import ChartCard from './ChartCard';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DemographicCharts = ({ demographics, loading }) => {
    if (loading) {
        return (
            <div className="demographics-grid-v2">
                <ChartCard loading={true} />
                <ChartCard loading={true} />
                <ChartCard loading={true} />
                <ChartCard loading={true} />
            </div>
        );
    }

    if (!demographics) return null;

    const { gender = {}, age_groups = {}, districts = {}, education_levels = {} } = demographics;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Poppins', sans-serif", size: 12, weight: 600 },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: "'Poppins', sans-serif", weight: 700 }
            }
        },
        scales: {
            y: { beginAtZero: true, display: false },
            x: { display: false }
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9', borderDash: [5, 5] },
                ticks: { font: { family: "'Poppins', sans-serif" } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Poppins', sans-serif", weight: 600 } }
            }
        }
    };

    const genderLabels = Object.keys(gender);
    const genderColors = genderLabels.map(label => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel === 'male') return '#3b82f6'; // Blue
        if (lowerLabel === 'female') return '#ec4899'; // Rose
        if (lowerLabel === 'other') return '#10b981'; // Green
        return '#cbd5e1'; // Light grey fallback
    });

    const genderData = {
        labels: genderLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
            data: Object.values(gender),
            backgroundColor: genderColors,
            hoverOffset: 15,
            borderWidth: 0
        }]
    };

    const ageData = {
        labels: Object.keys(age_groups),
        datasets: [{
            label: 'Users',
            data: Object.values(age_groups),
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            barThickness: 30
        }]
    };

    const districtData = {
        labels: Object.keys(districts),
        datasets: [{
            label: 'Users',
            data: Object.values(districts),
            backgroundColor: '#10b981',
            borderRadius: 8,
            barThickness: 25
        }]
    };

    const eduData = {
        labels: Object.keys(education_levels),
        datasets: [{
            data: Object.values(education_levels),
            backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    };

    return (
        <div className="demographics-grid-v2">
            <ChartCard title="Gender Distribution">
                <div style={{ height: '300px' }}>
                    <Pie data={genderData} options={chartOptions} />
                </div>
            </ChartCard>

            <ChartCard title="Age Distribution">
                <div style={{ height: '300px' }}>
                    <Bar data={ageData} options={barOptions} />
                </div>
            </ChartCard>

            <ChartCard title="Top Districts">
                <div style={{ height: '300px' }}>
                    <Bar data={districtData} options={{ ...barOptions, indexAxis: 'y' }} />
                </div>
            </ChartCard>

            <ChartCard title="Education Levels">
                <div style={{ height: '300px' }}>
                    <Pie data={eduData} options={chartOptions} />
                </div>
            </ChartCard>
        </div>
    );
};

export default DemographicCharts;
