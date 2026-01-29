import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { updateNGO, uploadNgoBanner } from '../apis/ngo';
import '../style/ngoDashboardStyles.css';

const NGODashboard = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const { loading, error, fetchData } = useFetch();

    const [formData, setFormData] = useState({
        name: '', // Maps to User.name and controller check
        ngoName: '', // Maps to NGO.ngoName
        description: '',
        category: 'environment',
        story: '' // Optional/Additional info
    });

    const [bannerPreview, setBannerPreview] = useState(null);

    // Sync state if user data exists
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                ngoName: user.ngoName || '',
                description: user.description || '',
                category: user.category || 'environment',
                story: user.story || ''
            });
            if (user.bannerImage) setBannerPreview(user.bannerImage);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Controller requires name, category, description
            const response = await fetchData(updateNGO, formData);
            if (response.updatedNGO) {
                login(response.updatedNGO);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Update NGO error:', err);
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setBannerPreview(reader.result);
        reader.readAsDataURL(file);

        const uploadData = new FormData();
        uploadData.append('bannerImage', file);

        try {
            const response = await fetchData(uploadNgoBanner, uploadData);
            if (response.bannerImage) {
                login({ ...user, bannerImage: response.bannerImage });
            }
        } catch (err) {
            console.error('Banner upload error:', err);
        }
    };

    return (
        <div className="ngo-dashboard-container">
            {error && <div className="api-error-banner" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

            <form className="ngo-dashboard-card" onSubmit={handleUpdate}>
                <h2 className="dashboard-title">NGO Profile Details</h2>

                <div className="form-group">
                    <label htmlFor="name">Personal Name (Contact Person)</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter contact person name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="ngoName">Official NGO Name</label>
                    <input
                        type="text"
                        id="ngoName"
                        name="ngoName"
                        value={formData.ngoName}
                        onChange={handleChange}
                        placeholder="Enter the official NGO name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Short Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="A brief, one-line mission statement"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none' }}
                    >
                        <option value="children">Children & Youth</option>
                        <option value="women">Women Empowerment</option>
                        <option value="environment">Environment & Conservation</option>
                        <option value="health">Healthcare</option>
                        <option value="education">Education</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="story">Full Story / History (Optional)</label>
                    <textarea
                        id="story"
                        name="story"
                        rows="5"
                        value={formData.story}
                        onChange={handleChange}
                        placeholder="Tell your organization's full story here. This will appear on your public profile."
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>NGO Banner</label>
                    <label className="image-upload-rectangular" style={{
                        border: '2px dashed var(--dark-green)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        textAlign: 'center',
                        background: 'var(--light-green)',
                        cursor: 'pointer',
                        display: 'block'
                    }}>
                        <input type="file" hidden onChange={handleBannerUpload} accept="image/*" />
                        {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                        ) : (
                            <>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                                <p style={{ fontWeight: 600, color: 'var(--dark-green)' }}>Upload NGO Banner</p>
                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Recommended: 1200x600px (JPG, PNG)</span>
                            </>
                        )}
                    </label>
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default NGODashboard;
