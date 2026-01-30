import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getCampaign } from '../apis/campaigns';
import { createDonation, getDonationsByCampaign } from '../apis/donations';
import { useAuth } from '../context/AuthContext';
import '../style/CampaignDetail.css';

/**
 * Campaign detail page component.
 * 
 * Architecture: Displays campaign information, donation form, and list of donors.
 * Uses separate API calls for campaign data and donations (with pagination).
 * 
 * Data flow:
 * 1. On mount: Load campaign data and first page of donations
 * 2. On donation submit: Refresh both campaign totals and donation list
 * 3. Pagination: Load specific page of donations without reloading campaign
 */
const CampaignDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { loading, error, fetchData } = useFetch();

    const [campaign, setCampaign] = useState(null);
    const [donors, setDonors] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    const [formData, setFormData] = useState({ name: '', amount: '', isAnonymous: false });
    const [donorFilter, setDonorFilter] = useState('');

    /**
     * Load campaign data from API.
     * 
     * Why useCallback: This function is used in useEffect dependencies.
     * Without useCallback, it would be recreated on every render, causing
     * the effect to run unnecessarily.
     */
    const loadCampaignData = useCallback(async () => {
        try {
            const response = await fetchData(getCampaign, id);
            if (response.campaign) {
                setCampaign(response.campaign);
            }
        } catch (err) {
            console.error('Failed to load campaign:', err);
        }
    }, [id, fetchData]); // Depend on id and fetchData (fetchData is stable from useFetch)

    /**
     * Load donations for a specific page.
     * 
     * Why useCallback: Used in useEffect and pagination handlers.
     * Memoization prevents unnecessary re-renders and effect re-runs.
     */
    const loadDonations = useCallback(async (pageNum) => {
        try {
            const response = await fetchData(getDonationsByCampaign, id, pageNum);
            if (response.donations) {
                setDonors(response.donations);
                setPagination(response.pagination);
            }
        } catch (err) {
            console.error('Failed to load donations:', err);
        }
    }, [id, fetchData]); // Depend on id and fetchData

    /**
     * Initialize page: Set body class and load data.
     * 
     * Why body class: Allows page-specific styling via CSS.
     * The cleanup function removes the class when component unmounts.
     * 
     * Dependencies: loadCampaignData and loadDonations are memoized with useCallback,
     * so they're stable references. The effect only re-runs if the campaign ID changes.
     */
    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        loadCampaignData();
        loadDonations(1);
        return () => { document.body.className = ''; };
    }, [loadCampaignData, loadDonations]);

    /**
     * Calculate campaign progress percentage.
     * 
     * Why useMemo: This calculation runs on every render if campaign changes.
     * Memoization prevents recalculating when other state updates (e.g., formData).
     */
    const progress = useMemo(() => {
        if (!campaign) return 0;
        // Cap at 100% to handle cases where raised exceeds target
        return Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
    }, [campaign]);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            campaignId: id,
            donorId: user ? user.id : null,
            amount: Number(formData.amount),
            isAnnonymous: formData.isAnonymous,
            // If the user name is provided manually, we might want to handle it (backend allows donorId: null)
        };

        try {
            const response = await fetchData(createDonation, payload);
            if (response.newDonation) {
                setFormData({ name: '', amount: '', isAnonymous: false });
                loadCampaignData(); // Refresh totals
                loadDonations(1); // Refresh donor list
                alert('Donation recorded successfully!');
            }
        } catch (err) {
            console.error('Failed to record donation:', err);
        }
    };

    /**
     * Filter donors by name (client-side filtering).
     * 
     * Why useMemo: Filtering runs on every render when donors or donorFilter changes.
     * Memoization prevents unnecessary re-filtering when other state updates.
     * 
     * Note: This is client-side filtering of the current page only. For full-text
     * search across all donations, backend filtering would be needed.
     */
    const filteredDonors = useMemo(() => {
        // Backend filtering for donor name is not yet implemented, doing simple local filter for current page
        return donors.filter(d => (d.donorId?.name || 'Anonymous').toLowerCase().includes(donorFilter.toLowerCase()));
    }, [donors, donorFilter]);

    if (loading && !campaign) return <div className="container">Loading Campaign...</div>;
    if (!campaign) return <div className="container">Campaign not found.</div>;

    return (
        <div className="container campaign-detail-container">
            {error && <div className="api-error-banner" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <section className="campaign-info-card">
                <div className="campaign-badge">{campaign.status}</div>
                <h1 className="campaign-title-large">{campaign.title}</h1>
                <p className="campaign-desc-text">{campaign.description}</p>

                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Total Raised</span>
                        <span className="stat-value highlight">{(campaign.raisedAmount || 0).toLocaleString()} <small>ETB</small></span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Target Goal</span>
                        <span className="stat-value">{(campaign.targetAmount || 0).toLocaleString()} <small>ETB</small></span>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="custom-progress">
                        <div className="custom-progress-inner" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        <span>{progress.toFixed(1)}% Completed</span>
                        {campaign.ngo && (
                            <div className="ngo-mini-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary-green)' }}>Organized by {campaign.ngo.ngoName}</span>
                                {campaign.ngo.bannerImage && (
                                    <img src={campaign.ngo.bannerImage} alt="NGO Banner" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eef2f0' }} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="interaction-grid">
                <section className="form-panel">
                    <h3 className="panel-title">Record Donation</h3>
                    <form onSubmit={handleManualSubmit}>
                        <div className="input-row">
                            <label>Donor Identity</label>
                            <input
                                type="text"
                                placeholder={user ? user.name : "Guest"}
                                value={user ? user.name : formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={formData.isAnonymous || !!user}
                                required={!formData.isAnonymous && !user}
                            />
                        </div>
                        <div className="checkbox-row">
                            <input
                                type="checkbox"
                                id="anon-check"
                                checked={formData.isAnonymous}
                                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                            />
                            <label htmlFor="anon-check">Keep this contribution anonymous</label>
                        </div>
                        <div className="input-row">
                            <label>Amount (ETB)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                required
                                min="1"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="primary-button" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm & Record'}
                        </button>
                    </form>
                </section>

                <section className="list-panel">
                    <div className="panel-title">
                        <span>Recent Donors</span>
                        <input
                            type="text"
                            className="donor-filter-input"
                            placeholder="Filter active list..."
                            value={donorFilter}
                            onChange={(e) => setDonorFilter(e.target.value)}
                        />
                    </div>

                    <ul className="donors-ul">
                        {filteredDonors.map(donor => (
                            <li key={donor._id} className="donor-li">
                                <div className="donor-main-info">
                                    <span className="donor-name-text">
                                        {donor.isAnnonymous ? 'Anonymous' : (donor.donorId?.name || 'Guest Donor')}
                                    </span>
                                    <span className="donor-date-text">{new Date(donor.createdAt).toDateString()}</span>
                                </div>
                                <span className="donor-amount-text">
                                    {donor.amount.toLocaleString()} <small>ETB</small>
                                </span>
                            </li>
                        ))}
                        {filteredDonors.length === 0 && (
                            <li style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                No donors found matching "{donorFilter}"
                            </li>
                        )}
                    </ul>

                    {pagination.totalPages > 1 && (
                        <div className="pagination-footer">
                            <button
                                className="pg-btn"
                                disabled={pagination.currentPage === 1}
                                onClick={() => loadDonations(pagination.currentPage - 1)}
                            >
                                Previous
                            </button>
                            <span className="pg-info">Page {pagination.currentPage} of {pagination.totalPages}</span>
                            <button
                                className="pg-btn"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => loadDonations(pagination.currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CampaignDetail;
