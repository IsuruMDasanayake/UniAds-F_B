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
    loading
}) => {
    return (
        <div className="analytics-data-table-component">
            {/* Controls */}
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
                {/* Additional filters can go here */}
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead className="table-header">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="table-header-cell">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="table-row">
                                    {columns.map((_, j) => (
                                        <td key={j} className="table-cell">
                                            <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr key={i} className="table-row">
                                    {columns.map((col, j) => (
                                        <td key={j} className="table-cell">
                                            <div className="table-cell-actions">
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="table-cell text-center text-slate-500 py-8">
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="pagination-container">
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
