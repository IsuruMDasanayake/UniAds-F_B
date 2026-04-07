import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const INITIAL_FORM_DATA = {
    career_category: '', career_field: '', education_level: '', job_description: '', career_tags: '',
    stream_or_subject_interest: '', al_stream_required: '', recommended_degree_or_course: '',
    alternative_path: '', certifications_or_extra_training: '', typical_university_subjects: '', postgrad_path: '',
    entry_level_job: '', mid_level_job: '', senior_level_job: '', key_skills_required: '',
    recommended_soft_skills: '', recommended_first_step: '', career_difficulty: '',
    industry_growth_in_sri_lanka: '', global_demand_level: '', average_starting_salary_lkr: '',
    future_salary_range_lkr: '', remote_work_possibility: '', freelance_opportunity: '',
    automation_risk: '', study_duration_years: '', local_job_availability: '', international_opportunity: ''
};

const CareerGuidanceModal = ({ show, onClose, mode, guidanceData, onSave }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // basic, education, career, market

    useEffect(() => {
        if (guidanceData && mode === 'edit') {
            setFormData({ ...INITIAL_FORM_DATA, ...guidanceData });
        } else {
            setFormData(INITIAL_FORM_DATA);
        }
        setActiveTab('basic');
    }, [guidanceData, mode, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving:', error?.message || error);
            alert('Failed to save data. Please check required fields.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!show) return null;

    const InputLine = ({ label, name, type = 'text', required = false, isTextarea = false, isFull = false }) => (
        <div className={`cgm-form-group ${isFull ? 'full' : ''}`}>
            <label>{label} {required && <span className="text-red-500">*</span>}</label>
            {isTextarea ? (
                <textarea name={name} value={formData[name] || ''} onChange={handleChange} required={required} />
            ) : (
                <input type={type} name={name} value={formData[name] || ''} onChange={handleChange} required={required} />
            )}
        </div>
    );

    return (
        <div className="cgm-modal-overlay">
            <div className="cgm-modal-content admin-glass-card">
                <div className="cgm-modal-header">
                    <h2>{mode === 'add' ? 'Add Career Guidance' : 'Edit Career Guidance'}</h2>
                    <button className="cgm-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="cgm-modal-tabs">
                    <button type="button" className={`cgm-modal-tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Basic Info</button>
                    <button type="button" className={`cgm-modal-tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>Education & Path</button>
                    <button type="button" className={`cgm-modal-tab-btn ${activeTab === 'career' ? 'active' : ''}`} onClick={() => setActiveTab('career')}>Career & Skills</button>
                    <button type="button" className={`cgm-modal-tab-btn ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>Market Insights</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <div className="cgm-modal-body">
                        {activeTab === 'basic' && (
                            <div className="cgm-form-grid">
                                <InputLine label="Career Category" name="career_category" required />
                                <InputLine label="Career Field (Specific)" name="career_field" required />
                                <InputLine label="Education Level Target" name="education_level" />
                                <InputLine label="Career Tags (Comma Separated)" name="career_tags" />
                                <InputLine label="Job Description" name="job_description" isTextarea isFull />
                            </div>
                        )}

                        {activeTab === 'education' && (
                            <div className="cgm-form-grid">
                                <InputLine label="A/L Stream Required" name="al_stream_required" />
                                <InputLine label="Stream or Subject Interest" name="stream_or_subject_interest" />
                                <InputLine label="Recommended Degree/Course" name="recommended_degree_or_course" />
                                <InputLine label="Alternative Path" name="alternative_path" />
                                <InputLine label="Postgrad Path" name="postgrad_path" />
                                <InputLine label="Typical Uni Subjects" name="typical_university_subjects" isTextarea isFull />
                                <InputLine label="Certifications / Extra Training" name="certifications_or_extra_training" isTextarea isFull />
                            </div>
                        )}

                        {activeTab === 'career' && (
                            <div className="cgm-form-grid">
                                <InputLine label="Entry Level Job" name="entry_level_job" />
                                <InputLine label="Mid Level Job" name="mid_level_job" />
                                <InputLine label="Senior Level Job" name="senior_level_job" />
                                <InputLine label="Career Difficulty (e.g., Hard, Moderate)" name="career_difficulty" />
                                <InputLine label="Recommended First Step" name="recommended_first_step" isTextarea isFull />
                                <InputLine label="Key Skills Required" name="key_skills_required" isTextarea isFull />
                                <InputLine label="Recommended Soft Skills" name="recommended_soft_skills" isTextarea isFull />
                            </div>
                        )}

                        {activeTab === 'market' && (
                            <div className="cgm-form-grid">
                                <InputLine label="Industry Growth (Sri Lanka)" name="industry_growth_in_sri_lanka" />
                                <InputLine label="Global Demand Level" name="global_demand_level" />
                                <InputLine label="Average Starting Salary (LKR)" name="average_starting_salary_lkr" />
                                <InputLine label="Future Salary Range (LKR)" name="future_salary_range_lkr" />
                                <InputLine label="Remote Work Possibility" name="remote_work_possibility" />
                                <InputLine label="Freelance Opportunity" name="freelance_opportunity" />
                                <InputLine label="Automation Risk" name="automation_risk" />
                                <InputLine label="Study Duration Years (e.g., 3-4)" name="study_duration_years" />
                                <InputLine label="Local Job Availability" name="local_job_availability" />
                                <InputLine label="International Opportunity" name="international_opportunity" />
                            </div>
                        )}
                    </div>

                    <div className="cgm-modal-actions">
                        <button type="button" className="cgm-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cgm-submit-btn" disabled={saving}>
                            {saving ? 'Saving...' : (mode === 'add' ? 'Save New Record' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CareerGuidanceModal;
