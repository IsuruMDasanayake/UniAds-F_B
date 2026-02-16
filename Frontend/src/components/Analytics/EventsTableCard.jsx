import React from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';

const EventsTableCard = ({
    children,
    search,
    onSearchChange,
    status,
    onStatusChange,
    sortConfig,
    onSortChange,
    totalEvents
}) => {
    return (
        <div className="analytics-card-v2 events-table-card">
            <div className="card-header-v2">
                <div className="header-text-group">
                    <h2 className="card-title-v2">Events Performance</h2>
                    <p className="card-subtitle-v2">
                        {totalEvents} {totalEvents === 1 ? 'event' : 'events'} found
                    </p>
                </div>

                <div className="header-actions-v2">
                    {/* Search Input */}
                    <div className="search-wrapper-v2">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search events..."
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
                            <option value="active">Active</option>
                            <option value="deactive">Deactive</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="filter-wrapper-v2 sort-wrapper">
                        <ArrowUpDown className="filter-icon" size={18} />
                        <select
                            value={`${sortConfig?.key || ''}-${sortConfig?.direction || ''}`}
                            onChange={(e) => {
                                const [key, direction] = e.target.value.split('-');
                                onSortChange({ key, direction });
                            }}
                            className="status-select-v2 sort-select"
                        >
                            <option value="-">Default Sort</option>
                            <option value="view_count-desc">Views: High to Low</option>
                            <option value="view_count-asc">Views: Low to High</option>
                            <option value="interested_count-desc">Interests: High to Low</option>
                            <option value="interested_count-asc">Interests: Low to High</option>
                            <option value="decline_count-desc">Declines: High to Low</option>
                            <option value="decline_count-asc">Declines: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card-body-v2">
                {children}
            </div>
        </div>
    );
};

export default EventsTableCard;
