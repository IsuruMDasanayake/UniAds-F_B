import React, { useState } from 'react';
import { Users, Building2, FileText, Calendar, Download, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import axiosClient from '../../lib/axios';
import './ReportsPage.css';

const ReportsPage = () => {
    const [loading, setLoading] = useState({
        users: false,
        institutes: false,
        applications: false
    });

    const [filters, setFilters] = useState({
        users: { from_date: '', to_date: '' },
        institutes: { from_date: '', to_date: '' },
        applications: { from_date: '', to_date: '' }
    });

    const handleFilterChange = (type, field, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleExport = async (type) => {
        setLoading(prev => ({ ...prev, [type]: true }));
        try {
            const { from_date, to_date } = filters[type];

            const response = await axiosClient.get(`/api/admin/export/${type}`, {
                params: { from_date, to_date },
                responseType: 'blob'
            });

            // Create a temporary link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Export error for ${type}:`, error);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const reportStyles = {
        users: { icon: Users, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
        institutes: { icon: Building2, color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
        applications: { icon: FileText, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }
    };

    return (
        <div className="admin-reports-scope">
            <header className="reports-header">
                <div className="header-content">
                    <div>
                        <h1 className="text-2xl font-bold">System Reports</h1>
                        <p className="text-muted">Generate high-fidelity data exports for your records</p>
                    </div>
                </div>
            </header>

            <div className="reports-container">
                {Object.entries(reportStyles).map(([id, style]) => {
                    const Icon = style.icon;
                    const isCardLoading = loading[id];
                    const title = id.charAt(0).toUpperCase() + id.slice(1) + " Report";
                    const desc = id === 'users' ? 'Registered user metrics and profiles' :
                        id === 'institutes' ? 'Institute performance and status data' :
                            'Course application and enrollment history';

                    return (
                        <div key={id} className="report-row-card">
                            <div className="report-main-info">
                                <div className="report-icon-container" style={{ '--accent-color': style.color, '--glow-color': style.glow }}>
                                    <Icon size={24} />
                                </div>
                                <div className="report-text-content">
                                    <h3>{title}</h3>
                                    <p>{desc}</p>
                                </div>
                            </div>

                            <div className="report-controls">
                                <div className="date-filter-group">
                                    <div className="date-input-wrapper">
                                        <Calendar size={16} />
                                        <input
                                            type="date"
                                            value={filters[id].from_date}
                                            onChange={(e) => handleFilterChange(id, 'from_date', e.target.value)}
                                            placeholder="From"
                                        />
                                    </div>
                                    <ChevronRight size={14} className="date-separator" />
                                    <div className="date-input-wrapper">
                                        <Calendar size={16} />
                                        <input
                                            type="date"
                                            value={filters[id].to_date}
                                            onChange={(e) => handleFilterChange(id, 'to_date', e.target.value)}
                                            placeholder="To"
                                        />
                                    </div>
                                </div>

                                <button
                                    className={`report-export-btn ${id}`}
                                    onClick={() => handleExport(id)}
                                    disabled={isCardLoading}
                                >
                                    {isCardLoading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Download size={18} />
                                    )}
                                    <span>{isCardLoading ? 'Preparing' : 'Download Excel'}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportsPage;
