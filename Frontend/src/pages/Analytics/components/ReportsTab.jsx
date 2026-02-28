import React, { useState } from 'react';
import { FileText, Download, Calendar, CheckCircle2, ChevronDown, Loader2, BarChart3, Users, Layout, CalendarDays, Star } from 'lucide-react';
import axiosClient from '../../../lib/axios';
import './ReportsTab.css';

const ReportsTab = () => {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('Overview Summary');
    const [dateRange, setDateRange] = useState('Last 30 days');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [format, setFormat] = useState('CSV');
    const [options, setOptions] = useState({
        includeCharts: false,
        detailedRecords: true
    });

    const reportTypes = [
        { id: 'Overview Summary', icon: <BarChart3 size={18} />, desc: 'General performance metrics and overview.' },
        { id: 'Applications Report', icon: <Users size={18} />, desc: 'Detailed breakdown of course applications.' },
        { id: 'Posts Performance', icon: <Layout size={18} />, desc: 'Engagement data for all your published posts.' },
        { id: 'Events Performance', icon: <CalendarDays size={18} />, desc: 'Traking interest and views for your events.' },
        { id: 'Reviews Summary', icon: <Star size={18} />, desc: 'Summary of student ratings and feedback.' }
    ];

    const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom range'];

    const handleDownload = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', reportType);
            params.append('range', dateRange);
            params.append('format', format);
            params.append('include_charts', options.includeCharts);
            params.append('detailed_records', options.detailedRecords);

            if (dateRange === 'Custom range') {
                params.append('start_date', customRange.start);
                params.append('end_date', customRange.end);
            }

            const response = await axiosClient.get(`/api/institute/reports/download?${params.toString()}`, {
                responseType: 'blob'
            });

            const extension = format.toLowerCase();
            const blob = new Blob([response.data], {
                type: format === 'PDF' ? 'application/pdf' : 'text/csv'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType.replace(/\s+/g, '_').toLowerCase()}_report.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download report:", error);
            alert("Failed to generate report. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rt-container">
            <div className="rt-header">
                <div className="rt-title">
                    {/* <FileText className="text-blue-500" size={24} /> */}
                    <div>
                        <h3>Download Reports</h3>
                        <p>Generate and export detailed analytics reports for your institute.</p>
                    </div>
                </div>
            </div>

            <div className="rt-grid">
                <div className="rt-config-section">
                    <div className="rt-config-card">
                        <h4 className="rt-config-title">1. Select Report Type</h4>
                        <div className="rt-type-list">
                            {reportTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className={`rt-type-item ${reportType === type.id ? 'active' : ''}`}
                                    onClick={() => setReportType(type.id)}
                                >
                                    <div className="rt-type-icon">{type.icon}</div>
                                    <div className="rt-type-info">
                                        <span className="rt-type-name">{type.id}</span>
                                        <span className="rt-type-desc">{type.desc}</span>
                                    </div>
                                    {reportType === type.id && <CheckCircle2 size={18} className="rt-active-check" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rt-options-section">
                    <div className="rt-config-card">
                        <h4 className="rt-config-title">2. Date Range</h4>
                        <div className="rt-range-selector">
                            {dateRanges.map((range) => (
                                <button
                                    key={range}
                                    className={`rt-range-btn ${dateRange === range ? 'active' : ''}`}
                                    onClick={() => setDateRange(range)}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        {dateRange === 'Custom range' && (
                            <div className="rt-custom-range">
                                <div className="rt-input-group">
                                    <label>From</label>
                                    <input
                                        type="date"
                                        value={customRange.start}
                                        onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                    />
                                </div>
                                <div className="rt-input-group">
                                    <label>To</label>
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rt-config-card">
                        <h4 className="rt-config-title">3. Export Options</h4>
                        <div className="rt-export-format">
                            <label>Format</label>
                            <div className="rt-format-toggle">
                                <button
                                    className={format === 'PDF' ? 'active' : ''}
                                    onClick={() => setFormat('PDF')}
                                >
                                    PDF
                                </button>
                                <button
                                    className={format === 'CSV' ? 'active' : ''}
                                    onClick={() => setFormat('CSV')}
                                >
                                    CSV
                                </button>
                            </div>
                        </div>

                        <div className="rt-options">
                            <label className="rt-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={options.includeCharts}
                                    onChange={(e) => setOptions({ ...options, includeCharts: e.target.checked })}
                                />
                                <span>Include visual charts</span>
                            </label>
                            <label className="rt-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={options.detailedRecords}
                                    onChange={(e) => setOptions({ ...options, detailedRecords: e.target.checked })}
                                />
                                <span>Include detailed raw records</span>
                            </label>
                        </div>
                    </div>

                    <button
                        className="rt-btn-download"
                        onClick={handleDownload}
                        disabled={loading || (dateRange === 'Custom range' && (!customRange.start || !customRange.end))}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        {loading ? 'Generating Report...' : `Download ${format} Report`}
                    </button>
                    <p className="rt-hint">Report generation might take a few seconds depending on the data volume.</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
