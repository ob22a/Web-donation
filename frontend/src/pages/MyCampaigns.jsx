import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import '../style/mycampaigns.css';

const INITIAL_CAMPAIGNS = [
    {
        id: 123,
        title: "Education for 100 Children",
        status: "active",
        description: "Our goal is to provide school supplies and tuition fees for 100 underprivileged children this semester.",
        raised: 60000,
        target: 100000,
        progress: 60
    },
    {
        id: 456,
        title: "Clean Water Initiative - Phase I",
        status: "completed",
        description: "We successfully built a new well and distribution system in the rural community of Arba Minch.",
        raised: 250000,
        target: 200000,
        progress: 100
    }
];

const MyCampaigns = () => {
    const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
    const [filter, setFilter] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        return () => { document.body.className = ''; };
    }, []);

    const filteredCampaigns = campaigns.filter(c =>
        filter === 'All' ? true : c.status === filter.toLowerCase()
    );

    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newCampaign = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            target: Number(formData.get('target')),
            raised: Number(formData.get('raised')) || 0,
            status: formData.get('status'),
            progress: Math.min((Number(formData.get('raised')) / Number(formData.get('target'))) * 100, 100) || 0
        };
        setCampaigns([newCampaign, ...campaigns]);
        setIsCreateOpen(false);
        setShowToast(true);
    };

    return (
        <div className="container">
            {showToast && <Toast message="Campaign created successfully!" onClose={() => setShowToast(false)} />}

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
                {filteredCampaigns.map(campaign => (
                    <div key={campaign.id} className="campaign-card">
                        <div className="campaign-title">{campaign.title}</div>
                        <div className={`campaign-status ${campaign.status === 'completed' ? 'completed' : ''}`}>
                            Status: {campaign.status}
                        </div>
                        <div className="campaign-description">{campaign.description}</div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${campaign.progress}%` }}></div>
                        </div>
                        <div className="donation-info">
                            <span>Raised: {campaign.raised.toLocaleString()} ETB</span>
                            <span>Target: {campaign.target.toLocaleString()} ETB</span>
                        </div>
                        <Link to={`/campaign/${campaign.id}`} className="view-button">View</Link>
                    </div>
                ))}
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
                                <input type="number" name="target" required min="1" placeholder="e.g. 100000" />
                            </label>

                            <label>
                                Initial Raised (ETB)
                                <input type="number" name="raised" min="0" defaultValue="0" />
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
                                <button type="submit" className="modal-submit-button" style={{ flex: 2 }}>
                                    Create Campaign
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
