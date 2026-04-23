import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Save, MapPin } from 'lucide-react';
import axiosClient from '../../../lib/axios';
import { getStorageUrl } from '../../../lib/config';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon not loading in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const ProfileSettingsTab = ({ institute, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        institute_name: institute.institute_name || '',
        institute_type: institute.institute_type || '',
        location: institute.location || '',
        email: institute.email || '',
        contact_number: institute.contact_number || '',
        website: institute.website || '',
        bio: institute.bio || '',
        slug: institute.slug || '',
    });

    const [position, setPosition] = useState(
        institute.latitude && institute.longitude
            ? [parseFloat(institute.latitude), parseFloat(institute.longitude)]
            : [6.9271, 79.8612] // Default to Colombo, Sri Lanka
    );

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [previewProfile, setPreviewProfile] = useState(institute.profile_photo ? getStorageUrl(institute.profile_photo) : '/images/profile.png');
    const [previewCover, setPreviewCover] = useState(institute.cover_photo ? getStorageUrl(institute.cover_photo) : '/images/cover.png');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrorMsg('File size exceeds 2MB limit.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'profile') {
                    setProfilePhoto(file);
                    setPreviewProfile(reader.result);
                } else {
                    setCoverPhoto(file);
                    setPreviewCover(reader.result);
                }
            };
            reader.readAsDataURL(file);
            setErrorMsg('');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        setUploadProgress(0);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key] || '');
        });

        if (position && position.length === 2) {
            data.append('latitude', position[0]);
            data.append('longitude', position[1]);
        }

        if (profilePhoto) data.append('profile_photo', profilePhoto);
        if (coverPhoto) data.append('cover_photo', coverPhoto);

        try {
            const response = await axiosClient.post(`/api/institutions/${institute.id}/update`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            if (response.data.success) {
                setSuccessMsg('Profile settings updated successfully!');

                // Update local storage
                const storedUser = JSON.parse(localStorage.getItem('APP_USER'));
                storedUser.institute = response.data.data?.institute ?? response.data.data;
                localStorage.setItem('APP_USER', JSON.stringify(storedUser));

                // If slug changed, reload the full page with the new slug url
                if (formData.slug !== institute.slug) {
                    setSuccessMsg('Slug updated! Redirecting to new URL...');
                    setTimeout(() => {
                        window.location.href = `/analytics/${formData.slug}/settings`;
                    }, 1500);
                } else {
                    setTimeout(() => setSuccessMsg(''), 4000);
                    // Refresh parent data if not redirecting
                    if (onRefresh) onRefresh();
                }
            }
        } catch (error) {
            console.error('Update profile error:', error?.message || error);
            if (error.response?.data?.errors) {
                const firstErrorKey = Object.keys(error.response.data.errors)[0];
                setErrorMsg(error.response.data.errors[firstErrorKey][0]);
            } else {
                setErrorMsg(error.response?.data?.message || 'Failed to update profile settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sp-profile-wrapper">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Public Profile Information</h3>

            <div className="sp-form-notice" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid #fee2e2' }}>
                <strong>Note:</strong> Primary identity details (Name, Type, Location, Email, Contact No, and Website) are locked. Please contact UniAds Administration for any changes.
            </div>

            {errorMsg && <div className="p-3 mb-4 rounded bg-red-50 text-red-600 border border-red-200">{errorMsg}</div>}
            {successMsg && <div className="p-3 mb-4 rounded bg-green-50 text-green-600 border border-green-200">{successMsg}</div>}

            <form onSubmit={handleSave}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Left Column - Photos */}
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <div className="sp-form-group">
                            <label>Profile Photo (Max 2MB)</label>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem', border: '2px solid #e2e8f0' }}>
                                <img src={previewProfile} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} style={{ fontSize: '0.85rem' }} />
                        </div>

                        <div className="sp-form-group" style={{ marginTop: '2rem' }}>
                            <label>Cover Photo (Max 2MB)</label>
                            <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', border: '2px solid #e2e8f0' }}>
                                <img src={previewCover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} style={{ fontSize: '0.85rem' }} />
                        </div>

                        <div className="sp-form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Exact Map Location</label>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Click on the map to pin your institute's exact location for students.</p>
                            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div style={{ flex: '2', minWidth: '300px' }}>
                        <div className="sp-form-row">
                            <div className="sp-form-group">
                                <label>Institute Name</label>
                                <input type="text" name="institute_name" value={formData.institute_name} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div className="sp-form-group">
                                <label>Institute Type</label>
                                <input type="text" name="institute_type" value={formData.institute_type} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                            </div>
                        </div>

                        <div className="sp-form-row">
                            <div className="sp-form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={formData.email} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div className="sp-form-group">
                                <label>Contact Number</label>
                                <input type="text" name="contact_number" value={formData.contact_number} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                            </div>
                        </div>

                        <div className="sp-form-row">
                            <div className="sp-form-group">
                                <label>Address</label>
                                <input type="text" name="location" value={formData.location} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div className="sp-form-group">
                                <label>Website</label>
                                <input type="text" name="website" value={formData.website} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                            </div>
                        </div>

                        <div className="sp-form-group">
                            <label>Profile URL Slug</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>uniads.com/institute/</span>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="your-institute-name"
                                    style={{ borderRadius: '0 8px 8px 0', outline: 'none' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>This uniquely identifies your profile. Keep it short and readable.</p>
                        </div>

                        <div className="sp-form-group">
                            <label>Bio / Description</label>
                            <textarea className="sp-form-group" name="bio" rows="6" value={formData.bio} onChange={handleChange} placeholder="Tell students about your institute..."></textarea>
                        </div>


                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button type="submit" className="sp-save-btn" disabled={loading} style={{ marginTop: 0 }}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {loading ? `Saving (${uploadProgress}%)` : 'Save Profile Settings'}
                    </button>
                    {loading && <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Uploading files, please wait...</span>}
                </div>
            </form>
        </div>
    );
};

export default ProfileSettingsTab;
