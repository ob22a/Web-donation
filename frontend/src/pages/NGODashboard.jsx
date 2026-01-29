import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/ngoDashboardStyles.css';

const NGODashboard = () => {
    const navigate = useNavigate();

    const handleUpdate = (e) => {
        e.preventDefault();
        // In a real app, save to backend here
        navigate('/dashboard');
    };

    return (
        <div className="ngo-dashboard-container">
            <form className="ngo-dashboard-card" onSubmit={handleUpdate}>
                <h2 className="dashboard-title">NGO Profile Details</h2>

                <div className="form-group">
                    <label htmlFor="ngoName">NGO Name</label>
                    <input
                        type="text"
                        id="ngoName"
                        name="ngoName"
                        placeholder="Enter the official NGO name"
                        required
                        defaultValue="Example Charity Foundation"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        placeholder="A brief, one-line mission statement"
                        defaultValue="Protecting wildlife and restoring forests."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        defaultValue="environment"
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
                    <label htmlFor="story">Story</label>
                    <textarea
                        id="story"
                        name="story"
                        rows="5"
                        placeholder="Tell your organization's full story here. This will appear on your public profile."
                        defaultValue="Our foundation started in 2005 with a small team focused on local conservation. Over the years, our mission has grown to encompass large-scale reforestation efforts across the region, driven by community involvement and sustainable practices."
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>NGO Image</label>
                    <div className="image-upload-rectangular" style={{
                        border: '2px dashed var(--dark-green)',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        textAlign: 'center',
                        background: 'var(--light-green)',
                        cursor: 'pointer'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                        <p style={{ fontWeight: 600, color: 'var(--dark-green)' }}>Upload NGO Banner</p>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Recommended: 1200x600px (JPG, PNG)</span>
                    </div>
                </div>

                <button type="submit" className="primary-button">Update Profile</button>
            </form>
        </div>
    );
};

export default NGODashboard;
