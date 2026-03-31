import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Building2 } from 'lucide-react';
import axiosClient from '../../lib/axios';
import './FilterComponents.css';

const InstituteFilters = ({ filters, onFilterChange, selectedInstitutes, onInstituteSelect }) => {
    const [expandedSections, setExpandedSections] = useState({
        institutes: false,
        status: false,
        premium: false
    });

    const [institutes, setInstitutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInstitutes();
    }, []);

    const fetchInstitutes = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/api/admin/broadcast-mail/institutes/list');
            setInstitutes(response.data.data || []);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCheckboxChange = (filterKey, value) => {
        const currentValues = filters[filterKey] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(filterKey, newValues);
    };

    const handleInstituteToggle = (instituteId) => {
        const newSelected = selectedInstitutes.includes(instituteId)
            ? selectedInstitutes.filter(id => id !== instituteId)
            : [...selectedInstitutes, instituteId];
        onInstituteSelect(newSelected);
    };

    const getSelectedCount = (filterKey) => {
        return filters[filterKey]?.length || 0;
    };

    const filteredInstitutes = institutes.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statuses = ['Approved', 'Unapproved'];
    const premiumOptions = ['Premium', 'Non-premium'];

    return (
        <div className="broadcast-filter-components">
            {/* Institute Selection */}
            <div className="bfc-filter-section bfc-institute-select-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('institutes')}
                >
                    <span>
                        Select Institutes
                        {selectedInstitutes.length > 0 && (
                            <span className="bfc-selected-badge">{selectedInstitutes.length} selected</span>
                        )}
                    </span>
                    {expandedSections.institutes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.institutes && (
                    <div className="bfc-filter-content">
                        {selectedInstitutes.length > 0 && (
                            <p className="bfc-filter-hint">
                                When institutes are selected, status and premium filters will be ignored
                            </p>
                        )}
                        <div className="bfc-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search institutes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="bfc-institute-list">
                            {loading ? (
                                <p className="bfc-loading-text">Loading institutes...</p>
                            ) : filteredInstitutes.length > 0 ? (
                                filteredInstitutes.map(institute => (
                                    <label key={institute.id} className="bfc-checkbox-label bfc-institute-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedInstitutes.includes(institute.id)}
                                            onChange={() => handleInstituteToggle(institute.id)}
                                        />
                                        <div className="bfc-institute-avatar">
                                            {institute.profile_photo ? (
                                                <img src={institute.profile_photo} alt="" className="bfc-avatar-img" />
                                            ) : (
                                                <Building2 size={16} />
                                            )}
                                        </div>
                                        <div className="bfc-institute-info">
                                            <span className="bfc-institute-name">{institute.name}</span>
                                            <span className="bfc-institute-email">{institute.email}</span>
                                        </div>
                                        <div className="bfc-institute-badges">
                                            {!!institute.is_premium && (
                                                <span className="bfc-badge bfc-premium-badge">Premium</span>
                                            )}
                                            <span className={`bfc-badge bfc-status-badge ${institute.status}`}>
                                                {institute.status}
                                            </span>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="bfc-no-results">No institutes found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Filter */}
            <div className="bfc-filter-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('status')}
                >
                    <span>
                        Status
                        {getSelectedCount('statuses') > 0 && (
                            <span className="bfc-selected-badge">{getSelectedCount('statuses')} selected</span>
                        )}
                    </span>
                    {expandedSections.status ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.status && (
                    <div className="bfc-filter-content">
                        <div className="bfc-checkbox-list">
                            {statuses.map(status => (
                                <label key={status} className="bfc-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.statuses?.includes(status) || false}
                                        onChange={() => handleCheckboxChange('statuses', status)}
                                    />
                                    <span>{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Filter */}
            <div className="bfc-filter-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('premium')}
                >
                    <span>
                        Premium Status
                        {getSelectedCount('premium_options') > 0 && (
                            <span className="bfc-selected-badge">{getSelectedCount('premium_options')} selected</span>
                        )}
                    </span>
                    {expandedSections.premium ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.premium && (
                    <div className="bfc-filter-content">
                        <div className="bfc-checkbox-list">
                            {premiumOptions.map(option => (
                                <label key={option} className="bfc-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.premium_options?.includes(option) || false}
                                        onChange={() => handleCheckboxChange('premium_options', option)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstituteFilters;
