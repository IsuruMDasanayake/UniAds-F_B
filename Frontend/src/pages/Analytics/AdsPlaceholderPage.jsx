import React from 'react';
import { Megaphone } from 'lucide-react';
import './AdsPlaceholderPage.css';

const AdsPlaceholderPage = () => {
    return (
        <div id="analytics-ads-page">
            <div className="placeholder-icon-wrapper">
                <Megaphone className="placeholder-icon" />
            </div>
            <h1 className="placeholder-title">Ads Manager Coming Soon</h1>
            <p className="placeholder-text">
                We are working hard to bring you powerful tools to promote your institute and reach more students.
            </p>
            <button className="notify-btn">
                Notify me when available
            </button>
        </div>
    );
};

export default AdsPlaceholderPage;
