import React from 'react';
import { Search, X, Filter, History, RefreshCw } from 'lucide-react';

const ApplicationsTableCard = ({
    children,
    title = "Applications Performance",
    subtitle,
    search,
    onSearchChange,
    searchPlaceholder = "Search...",
    status,
    onStatusChange,
    statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'new', label: 'New' },
        { value: 'viewed', label: 'Viewed' },
        { value: 'contacted', label: 'Contacted' }
    ],
    onRefresh,
    isRefreshing,
    showHistoryButton,
    onHistoryClick,
    isFetchingHistory
}) => {
    return (
        <div className="analytics-card-v2 applications-table-card">
            <div className="card-header-v2">
                <div className="header-text-group">
                    <h2 className="card-title-v2">{title}</h2>
                    {subtitle && <p className="card-subtitle-v2">{subtitle}</p>}
                </div>

                <div className="header-actions-v2">
                    {/* Search Input */}
                    <div className="search-wrapper-v2">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="search-input-v2"
                        />
                        {search && (
                            <button
                                className="clear-search-btn"
                                onClick={() => onSearchChange('')}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="filter-wrapper-v2">
                        <Filter className="filter-icon" size={18} />
                        <select
                            value={status}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="status-select-v2"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {onRefresh && (
                        <button
                            className={`action-btn-v2 refresh ${isRefreshing ? 'spinning' : ''}`}
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}

                    {showHistoryButton && (
                        <button
                            className="history-btn-v2"
                            onClick={onHistoryClick}
                            disabled={isFetchingHistory}
                            title="View Communication History"
                        >
                            <History size={18} className={isFetchingHistory ? 'animate-spin' : ''} />
                            <span>History</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="card-body-v2">
                {children}
            </div>
        </div>
    );
};

export default ApplicationsTableCard;
