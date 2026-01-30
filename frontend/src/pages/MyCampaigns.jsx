import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getCampaigns, createCampaign } from '../apis/campaigns';
import Toast from '../components/Toast';
import '../style/mycampaigns.css';

/**
 * My Campaigns page - displays and manages campaigns for authenticated NGO.
 * 
 * Architecture: Lists all campaigns created by the logged-in NGO with filtering
 * by status. Allows creating new campaigns via modal form.
 * 
 * Performance optimizations:
 * - useCallback for event handlers
 * - useMemo for filtered campaigns list
 * - Proper useEffect dependencies
 */
const MyCampaigns = () => {
    const { loading, error, fetchData } = useFetch();
    const [campaigns, setCampaigns] = useState([]);
    const [filter, setFilter] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    /**
     * Load campaigns from API.
     * 
     * Why useCallback: Used in useEffect. Memoization prevents effect from
     * re-running unnecessarily when component re-renders.
     */
    const loadCampaigns = useCallback(async () => {
        try {
            const response = await fetchData(getCampaigns);
            if (response.campaigns) {
                setCampaigns(response.campaigns);
            }
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        }
    }, [fetchData]);

    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        loadCampaigns();
        return () => { document.body.className = ''; };
    }, [loadCampaigns]); // Depend on memoized loadCampaigns

    /**
     * Filter campaigns by status.
     * 
     * Why useMemo: Filtering runs on every render when campaigns or filter changes.
     * Memoization prevents unnecessary re-filtering when other state updates.
     */
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c =>
            filter === 'All' ? true : c.status?.toLowerCase() === filter.toLowerCase()
        );
    }, [campaigns, filter]);

    /**
     * Handle campaign creation.
     * 
     * Why useCallback: Used in form onSubmit. Prevents unnecessary re-renders.
     */
    const handleCreate = useCallback(async (e) => {
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
                setCampaigns(prev => [response.campaign, ...prev]);
                setIsCreateOpen(false);
                setShowToast(true);
            }
        } catch (err) {
            console.error('Failed to create campaign:', err);
        }
    }, [fetchData]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleCloseToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const handleOpenCreate = useCallback(() => {
        setIsCreateOpen(true);
    }, []);

    const handleCloseCreate = useCallback(() => {
        setIsCreateOpen(false);
    }, []);

    // Extract inline styles to prevent object recreation
    const errorBannerStyle = { color: 'red', marginBottom: '1rem', textAlign: 'center' };
    const createButtonStyle = { width: 'auto', paddingInline: '1.5rem', margin: 0 };
    const modalTitleStyle = { color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' };
    const modalActionsStyle = { display: 'flex', gap: '1rem', marginTop: '1rem' };
    const buttonFlex1Style = { flex: 1 };
    const buttonFlex2Style = { flex: 2 };

    return (
        <div className="container">
            {showToast && <Toast message="Campaign created successfully!" onClose={handleCloseToast} />}
            {error && <div className="api-error-banner" style={errorBannerStyle}>{error}</div>}

            <div className="header">
                <h2 className="title">My Campaigns</h2>

                <button
                    className="primary-button"
                    style={createButtonStyle}
                    onClick={handleOpenCreate}
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
                <div className="modal-overlay open" onClick={handleCloseCreate}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="dashboard-title" style={modalTitleStyle}>
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

                            <div className="modal-actions" style={modalActionsStyle}>
                                <button type="button" className="modal-close-button" onClick={handleCloseCreate} style={buttonFlex1Style}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-button" style={buttonFlex2Style} disabled={loading}>
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
