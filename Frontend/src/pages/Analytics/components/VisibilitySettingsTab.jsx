import React, { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import axiosClient from '../../../lib/axios';

const VisibilitySettingsTab = ({ institute }) => {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [settings, setSettings] = useState({
        followers_enabled: institute.followers_enabled ?? true,
        reviews_enabled: institute.reviews_enabled ?? true,
        chat_enabled: institute.chat_enabled ?? true,
        inquiries_enabled: institute.inquiries_enabled ?? true,
        applications_enabled: institute.applications_enabled ?? true,
    });

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            // Using a FormData object to send to apiUpdateProfile
            const formData = new FormData();
            formData.append('institute_name', institute.institute_name);
            formData.append('institute_type', institute.institute_type);
            formData.append('location', institute.location);
            formData.append('email', institute.email);
            formData.append('contact_number', institute.contact_number);
            formData.append('followers_enabled', settings.followers_enabled ? '1' : '0');
            formData.append('reviews_enabled', settings.reviews_enabled ? '1' : '0');
            formData.append('chat_enabled', settings.chat_enabled ? '1' : '0');
            formData.append('inquiries_enabled', settings.inquiries_enabled ? '1' : '0');
            formData.append('applications_enabled', settings.applications_enabled ? '1' : '0');

            const response = await axiosClient.post(`/api/institutions/${institute.id}/update`, formData);

            if (response.data.success) {
                setSuccessMsg('Visibility settings updated successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);

                // Update local storage
                const storedUser = JSON.parse(localStorage.getItem('APP_USER'));
                storedUser.institute = response.data.institute;
                localStorage.setItem('APP_USER', JSON.stringify(storedUser));
            }
        } catch (error) {
            console.error('Save error:', error);
            setErrorMsg(error.response?.data?.message || 'Failed to update visibility settings.');
        } finally {
            setLoading(false);
        }
    };

    const toggles = [
        { key: 'followers_enabled', label: 'Allow Followers', desc: 'Let users follow your institute to get updates on their feed.' },
        { key: 'reviews_enabled', label: 'Allow Reviews', desc: 'Enable users to leave ratings and reviews on your profile.' },
        { key: 'chat_enabled', label: 'Enable Chat', desc: 'Allow users to message you directly via the platform chat.' },
        { key: 'inquiries_enabled', label: 'Enable General Inquiries', desc: 'Display a contact form for users to send general questions.' },
        { key: 'applications_enabled', label: 'Allow Course Applications', desc: 'Let users apply to your active courses directly.' }
    ];

    return (
        <div className="settings-visibility-wrapper">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Visibility & Engagement</h3>

            {errorMsg && <div className="p-3 mb-4 rounded bg-red-50 text-red-600 border border-red-200">{errorMsg}</div>}
            {successMsg && <div className="p-3 mb-4 rounded bg-green-50 text-green-600 border border-green-200">{successMsg}</div>}

            <div className="toggle-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {toggles.map((toggle) => (
                    <div key={toggle.key} className="settings-toggle-group">
                        <div className="settings-toggle-info">
                            <h4>{toggle.label}</h4>
                            <p>{toggle.desc}</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings[toggle.key]}
                                onChange={() => handleToggle(toggle.key)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                ))}
            </div>

            <button
                className="settings-save-btn"
                onClick={handleSave}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    );
};

export default VisibilitySettingsTab;
