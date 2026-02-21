import React from 'react';
import { ExternalLink } from 'lucide-react';
import './Messenger.css';

const LinkPreview = ({ data }) => {
    if (!data) return null;

    const { url, title, description, image } = data;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-card">
            {image && (
                <div className="preview-image">
                    <img src={image} alt={title} onError={(e) => e.target.style.display = 'none'} />
                </div>
            )}
            <div className="preview-content">
                <h5 className="preview-title">{title || parse_url_host(url)}</h5>
                {description && <p className="preview-desc">{description}</p>}
                <div className="preview-url">
                    <ExternalLink size={12} />
                    <span>{parse_url_host(url)}</span>
                </div>
            </div>
        </a>
    );
};

const parse_url_host = (url) => {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return url;
    }
};

export default LinkPreview;
