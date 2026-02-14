import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';
import { Filter, Loader2 } from 'lucide-react';
import ChartCard from './ChartCard';
import axiosClient from "../../lib/axios";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const INTERACTION_OPTIONS = [
    { label: 'All Interactions', value: 'all' },
    { label: 'Likes', value: 'likes' },
    { label: 'Event Interests', value: 'interests' },
    { label: 'Event Declines', value: 'declines' },
    { label: 'Ratings', value: 'ratings' },
    { label: 'Followers', value: 'followers' },
    { label: 'Applicants', value: 'applicants' },
    { label: 'Post Views', value: 'post_view' },
    { label: 'Event Views', value: 'event_view' },
    { label: 'Profile Views', value: 'profile_view' }
];

const DemographicChart = ({ title, type, initialData, chartType = 'pie', chartOptions = {} }) => {
    const [data, setData] = useState(initialData);
    const [filter, setFilter] = useState('all');
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (filter === 'all') {
            setData(initialData);
            return;
        }

        const fetchData = async () => {
            setFetching(true);
            try {
                const response = await axiosClient.get(`/api/institute/analytics/demographics`, {
                    params: { interaction_type: filter }
                });
                const newData = response.data.demographics[type];
                setData(newData);
            } catch (error) {
                console.error(`Error fetching demographics for ${type}:`, error);
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [filter, initialData, type]);

    const filterDropdown = (
        <div className="chart-filter-compact">
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select-minimal"
            >
                {INTERACTION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    // Prepare chart data based on type
    let preparedData;
    if (type === 'gender') {
        const labels = Object.keys(data || {});
        const colors = labels.map(label => {
            const lowerLabel = label.toLowerCase();
            if (lowerLabel === 'male') return '#3b82f6';
            if (lowerLabel === 'female') return '#ec4899';
            if (lowerLabel === 'other') return '#10b981';
            return '#cbd5e1';
        });

        preparedData = {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: Object.values(data || {}),
                backgroundColor: colors,
                hoverOffset: 15,
                borderWidth: 0
            }]
        };
    } else if (type === 'age_groups') {
        preparedData = {
            labels: Object.keys(data || {}),
            datasets: [{
                label: 'Users',
                data: Object.values(data || {}),
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                barThickness: 30
            }]
        };
    } else if (type === 'districts') {
        preparedData = {
            labels: Object.keys(data || {}),
            datasets: [{
                label: 'Users',
                data: Object.values(data || {}),
                backgroundColor: '#10b981',
                borderRadius: 8,
                barThickness: 25
            }]
        };
    } else if (type === 'education_levels') {
        preparedData = {
            labels: Object.keys(data || {}),
            datasets: [{
                data: Object.values(data || {}),
                backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        };
    }

    return (
        <ChartCard title={title} actions={filterDropdown}>
            <div style={{ height: '260px', position: 'relative' }}>
                {fetching && (
                    <div className="chart-overlay-loader">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                )}
                <div style={{ opacity: fetching ? 0.3 : 1, transition: 'opacity 0.2s', height: '100%' }}>
                    {chartType === 'pie' ? (
                        <Pie data={preparedData} options={chartOptions} />
                    ) : (
                        <Bar data={preparedData} options={chartOptions} />
                    )}
                </div>
            </div>
        </ChartCard>
    );
};

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

    const baseOptions = {
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
        }
    };

    const pieOptions = {
        ...baseOptions,
        scales: {
            y: { display: false },
            x: { display: false }
        }
    };

    const barOptions = {
        ...baseOptions,
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

    return (
        <div className="demographics-grid-v2">
            <DemographicChart
                title="Gender Distribution"
                type="gender"
                initialData={gender}
                chartType="pie"
                chartOptions={pieOptions}
            />

            <DemographicChart
                title="Age Distribution"
                type="age_groups"
                initialData={age_groups}
                chartType="bar"
                chartOptions={barOptions}
            />

            <DemographicChart
                title="Top Districts"
                type="districts"
                initialData={districts}
                chartType="bar"
                chartOptions={{ ...barOptions, indexAxis: 'y' }}
            />

            <DemographicChart
                title="Education Levels"
                type="education_levels"
                initialData={education_levels}
                chartType="pie"
                chartOptions={pieOptions}
            />
        </div>
    );
};

export default DemographicCharts;
