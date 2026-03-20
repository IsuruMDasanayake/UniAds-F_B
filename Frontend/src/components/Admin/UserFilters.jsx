import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FilterComponents.css';
import { districts, educationLevels } from '../../lib/constants';

const UserFilters = ({ filters, onFilterChange, recipientEmail, onEmailChange }) => {
    const [expandedSections, setExpandedSections] = useState({
        districts: false,
        education: false,
        age: false,
        gender: false
    });

    const ageGroups = [
        "Under 18",
        "18-22",
        "23-30",
        "30+"
    ];

    const genders = ["Male", "Female", "Other"];

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

    const getSelectedCount = (filterKey) => {
        return filters[filterKey]?.length || 0;
    };

    return (
        <div className="broadcast-filter-components">
            {/* Single Email Input */}
            <div className="bfc-filter-section bfc-single-email-section">
                <label className="bfc-filter-label">Send to Specific Email</label>
                <input
                    type="email"
                    className="bfc-email-input"
                    placeholder="Enter email address..."
                    value={recipientEmail}
                    onChange={(e) => onEmailChange(e.target.value)}
                />
                {recipientEmail && (
                    <p className="bfc-filter-hint">
                        When email is provided, all filters below will be ignored
                    </p>
                )}
            </div>

            {/* Districts Filter */}
            <div className="bfc-filter-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('districts')}
                >
                    <span>
                        Districts
                        {getSelectedCount('districts') > 0 && (
                            <span className="bfc-selected-badge">{getSelectedCount('districts')} selected</span>
                        )}
                    </span>
                    {expandedSections.districts ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.districts && (
                    <div className="bfc-filter-content">
                        <div className="bfc-checkbox-grid">
                            {districts.map(district => (
                                <label key={district} className="bfc-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.districts?.includes(district) || false}
                                        onChange={() => handleCheckboxChange('districts', district)}
                                    />
                                    <span>{district}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Education Level Filter */}
            <div className="bfc-filter-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('education')}
                >
                    <span>
                        Education Level
                        {getSelectedCount('education_levels') > 0 && (
                            <span className="bfc-selected-badge">{getSelectedCount('education_levels')} selected</span>
                        )}
                    </span>
                    {expandedSections.education ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.education && (
                    <div className="bfc-filter-content">
                        <div className="bfc-checkbox-list">
                            {educationLevels.map(level => (
                                <label key={level} className="bfc-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.education_levels?.includes(level) || false}
                                        onChange={() => handleCheckboxChange('education_levels', level)}
                                    />
                                    <span>{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Age Group Filter */}
            <div className="bfc-filter-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('age')}
                >
                    <span>
                        Age Group
                        {getSelectedCount('age_groups') > 0 && (
                            <span className="bfc-selected-badge">{getSelectedCount('age_groups')} selected</span>
                        )}
                    </span>
                    {expandedSections.age ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.age && (
                    <div className="bfc-filter-content">
                        <div className="bfc-checkbox-list">
                            {ageGroups.map(group => (
                                <label key={group} className="bfc-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.age_groups?.includes(group) || false}
                                        onChange={() => handleCheckboxChange('age_groups', group)}
                                    />
                                    <span>{group}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Gender Filter */}
            <div className="bfc-filter-section">
                <button
                    className="bfc-filter-header"
                    onClick={() => toggleSection('gender')}
                >
                    <span>
                        Gender
                        {getSelectedCount('genders') > 0 && (
                            <span className="bfc-selected-badge">{getSelectedCount('genders')} selected</span>
                        )}
                    </span>
                    {expandedSections.gender ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.gender && (
                    <div className="bfc-filter-content">
                        <div className="bfc-checkbox-list">
                            {genders.map(gender => (
                                <label key={gender} className="bfc-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.genders?.includes(gender) || false}
                                        onChange={() => handleCheckboxChange('genders', gender)}
                                    />
                                    <span>{gender}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFilters;
