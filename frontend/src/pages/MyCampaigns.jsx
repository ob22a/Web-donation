import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getCampaigns, createCampaign } from '../apis/campaigns';
import Toast from '../components/Toast';
import '../style/mycampaigns.css';

const MyCampaigns = () => {
    const { loading, error, fetchData } = useFetch();
    const [campaigns, setCampaigns] = useState([]);
    const [filter, setFilter] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        const loadCampaigns = async () => {
            try {
                const response = await fetchData(getCampaigns);
                if (response.campaigns) {
                    setCampaigns(response.campaigns);
                }
            } catch (err) {
                console.error('Failed to load campaigns:', err);
            }
        };
        loadCampaigns();
        return () => { document.body.className = ''; };
    }, [fetchData]);

    const filteredCampaigns = campaigns.filter(c =>
        filter === 'All' ? true : c.status?.toLowerCase() === filter.toLowerCase()
    );

    const handleCreate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            title: formData.get('title'),
            description: formData.get('description'),
            targetAmount: Number(formData.get('targetAmount')),
            raisedAmount: Number(formData.get('raisedAmount')) || 0,
            status: formData.get('status')
        };

        try {
            const response = await fetchData(createCampaign, payload);
            if (response.campaign) {
                setCampaigns([response.campaign, ...campaigns]);
                setIsCreateOpen(false);
                setShowToast(true);
            }
        } catch (err) {
            console.error('Failed to create campaign:', err);
        }
    };

    return (
        <div className="container">
            {showToast && <Toast message="Campaign created successfully!" onClose={() => setShowToast(false)} />}
            {error && <div className="api-error-banner" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <div className="header">
                <h2 className="title">My Campaigns</h2>

                <button
                    className="primary-button"
                    style={{ width: 'auto', paddingInline: '1.5rem', margin: 0 }}
                    onClick={() => setIsCreateOpen(true)}
                >
                    + Create Campaign
                </button>
            </div>

            <div className="filter-buttons">
                {['All', 'Active', 'Completed'].map(f => (
                    <button
                        key={f}
                        className={`filter-button ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="campaign-grid">
                {loading && campaigns.length === 0 ? <p>Loading campaigns...</p> :
                    filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => {
                        const progress = campaign.targetAmount > 0
                            ? Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)
                            : 0;
                        return (
                            <div key={campaign._id} className="campaign-card">
                                <div className="campaign-title">{campaign.title}</div>
                                <div className={`campaign-status ${campaign.status === 'completed' ? 'completed' : ''}`}>
                                    Status: {campaign.status}
                                </div>
                                <div className="campaign-description">{campaign.description}</div>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="donation-info">
                                    <span>Raised: {(campaign.raisedAmount || 0).toLocaleString()} ETB</span>
                                    <span>Target: {(campaign.targetAmount || 0).toLocaleString()} ETB</span>
                                </div>
                                <Link to={`/campaign/${campaign._id}`} className="view-button">View</Link>
                            </div>
                        );
                    }) : <p>No campaigns found.</p>}
            </div>

            {/* Create Campaign Modal */}
            {isCreateOpen && (
                <div className="modal-overlay open" onClick={() => setIsCreateOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="dashboard-title" style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Create New Campaign
                        </h2>
                        <form className="create-form" onSubmit={handleCreate}>
                            <label>
                                Title
                                <input type="text" name="title" required placeholder="Campaign title" />
                            </label>

                            <label>
                                Description
                                <textarea name="description" rows="4" required placeholder="Short description"></textarea>
                            </label>

                            <label>
                                Target Amount (ETB)
                                <input type="number" name="targetAmount" required min="1" placeholder="e.g. 100000" />
                            </label>

                            <label>
                                Initial Raised (ETB)
                                <input type="number" name="raisedAmount" min="0" defaultValue="0" />
                            </label>

                            <label>
                                Status
                                <select name="status">
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </label>

                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="modal-close-button" onClick={() => setIsCreateOpen(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-button" style={{ flex: 2 }} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCampaigns;
