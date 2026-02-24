import React, { useState } from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import axiosClient from '../lib/axios';
import ApplyNowModal from './Modals/ApplyNowModal';
import './Messenger.css';

const LinkPreview = ({ data, showApplyButton = true }) => {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });

    if (!data) return null;

    const { url, title, description, image } = data;

    const isInternal = data.is_internal_post;
    const Wrapper = isInternal ? 'div' : 'a';
    const wrapperProps = isInternal
        ? { className: 'link-preview-card internal-post' }
        : { href: url, target: '_blank', rel: 'noopener noreferrer', className: 'link-preview-card' };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!data.institute_id || !data.post_id) return;

        setApplying(true);
        setSubmissionStatus({ type: '', message: '' });

        try {
            await axiosClient.post(`/api/course/apply/${data.institute_id}`, {
                ...applyForm,
                course_title: data.title,
                post_id: data.post_id,
                privacy_consent: applyForm.privacyConsent
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully! We wish you all the best for your future.' });
            setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);

        } catch (error) {
            console.error('Error submitting application:', error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const handleModalChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (name === 'privacy_consent') {
            setApplyForm({ ...applyForm, privacyConsent: checked });
        } else {
            setApplyForm({ ...applyForm, [name]: type === 'checkbox' ? checked : value });
        }
    };

    return (
        <Wrapper {...wrapperProps}>
            {image && (
                <div className="preview-image">
                    <img src={image} alt={title} onError={(e) => e.target.style.display = 'none'} />
                </div>
            )}
            <div className="preview-content">
                <h5 className="preview-title">{title || parse_url_host(url)}</h5>
                {description && <p className="preview-desc">{description}</p>}

                {isInternal && data.institute_id && showApplyButton && (
                    <div className="preview-actions" style={{ marginTop: '10px' }}>
                        <button
                            className="btn-primary apply-btn-preview"
                            style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowApplyModal(true);
                            }}
                        >
                            Apply Course
                        </button>
                    </div>
                )}

                {!isInternal && (
                    <div className="preview-url">
                        <ExternalLink size={12} />
                        <span>{parse_url_host(url)}</span>
                    </div>
                )}
            </div>

            <ApplyNowModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                courseTitle={title}
                form={{ ...applyForm, privacy_consent: applyForm.privacyConsent }}
                onChange={handleModalChange}
                onSubmit={handleApplySubmit}
                isSubmitting={applying}
                status={submissionStatus}
            />
        </Wrapper>
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
