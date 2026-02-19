import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    pagination,
    onPageChange,
    searchQuery,
    onSearchChange,
    loading,
    showSearch = true,
    onRowClick
}) => {
    return (
        <div className={`analytics-data-table-component ${loading ? 'table-loading' : ''}`}>
            {/* Real-time Refresh Progress Bar */}
            {loading && (
                <div className="table-refresh-progress">
                    <div className="progress-bar-segment"></div>
                </div>
            )}

            {/* Controls */}
            {showSearch && (
                <div className="table-controls">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead className="table-header">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="table-header-cell" style={col.headerStyle}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {loading && data.length === 0 ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="table-row">
                                    {columns.map((_, j) => (
                                        <td key={j} className="table-cell">
                                            <div className="skeleton-h-4 bg-slate-100 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr
                                    key={i}
                                    className={`table-row ${onRowClick ? 'clickable' : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col, j) => (
                                        <td key={j} className="table-cell">
                                            <div className="table-cell-content">
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="table-cell text-center text-slate-500 py-12">
                                    <div className="empty-results">
                                        <p className="font-semibold text-lg">No results found</p>
                                        <p className="text-sm opacity-60">Try adjusting your filters or search query</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="pagination">
                    <div className="pagination-info">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </div>
                    <div className="pagination-controls">
                        <button
                            disabled={!pagination.prev_page_url}
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            className="pagination-btn"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={!pagination.next_page_url}
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            className="pagination-btn"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
