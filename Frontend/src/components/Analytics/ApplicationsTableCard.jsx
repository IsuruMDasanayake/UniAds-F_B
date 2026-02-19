import React from 'react';
import { Search, X, Filter, History } from 'lucide-react';

const ApplicationsTableCard = ({
    children,
    search,
    onSearchChange,
    status,
    onStatusChange,
    totalApplications,
    onHistoryClick,
    isFetchingHistory,
    showHistoryButton
}) => {
    return (
        <div className="analytics-card-v2 applications-table-card">
            <div className="card-header-v2">
                <div className="header-text-group">
                    <h2 className="card-title-v2">Applications Performance</h2>
                    <p className="card-subtitle-v2">
                        {totalApplications} {totalApplications === 1 ? 'application' : 'applications'} found
                    </p>
                </div>

                <div className="header-actions-v2">
                    {/* Search Input */}
                    <div className="search-wrapper-v2">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student or course..."
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
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="viewed">Viewed</option>
                            <option value="contacted">Contacted</option>
                        </select>
                    </div>

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
