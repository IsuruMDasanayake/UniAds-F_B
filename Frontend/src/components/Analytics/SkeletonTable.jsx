import React from 'react';

const SkeletonTable = ({ rows = 5, cols = 5 }) => {
    return (
        <div className="skeleton-table">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="skeleton-table-row">
                    {[...Array(cols)].map((_, j) => (
                        <div key={j} className="skeleton-table-cell">
                            <div className="skeleton-loader"></div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SkeletonTable;
