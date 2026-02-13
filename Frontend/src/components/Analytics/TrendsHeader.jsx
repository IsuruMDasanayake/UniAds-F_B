import React from 'react';
import { Repeat } from 'lucide-react';
import PeriodFilter from './PeriodFilter';

const TrendsHeader = ({ range, setRange, compare, setCompare, loading }) => {
    return (
        <div className="trends-header-v2">
            <div className="header-text">
                <h1 className="trends-page-title-v2">Performance Trends</h1>
                <p className="trends-page-subtitle-v2">Visualize growth and engagement over time</p>
            </div>

            <div className="trends-controls-group-v2">
                <div className="trends-period-filter-wrapper">
                    <PeriodFilter
                        period={parseInt(range)}
                        setPeriod={(val) => setRange(String(val))}
                        size="medium" // We'll control the "small" switch via CSS media queries on the wrapper
                    />
                </div>
            </div>
        </div>
    );
};

export default TrendsHeader;
