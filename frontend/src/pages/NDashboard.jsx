import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { getCampaigns } from '../apis/campaigns';
import { getNGOStats, getNGODonations } from '../apis/donations';
import '../style/NDashboardStyle.css';

/**
 * NGO Dashboard - displays statistics and campaigns for authenticated NGO.
 * 
 * Architecture: Shows total donations, campaign count, and list of campaigns.
 * Redirects to profile setup if NGO hasn't completed their profile.
 * 
 * Performance optimizations:
 * - useMemo for calculated stats
 * - useCallback for data loading function
 * - Proper useEffect dependencies
 */
const NDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loading, error, fetchData } = useFetch();
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState({ totalDonations: 0, campaignsCount: 0, donorsCount: 0 });
    const [recentDonations, setRecentDonations] = useState([]);

    /**
     * Load dashboard data from API.
     * 
     * Why: Fetches real backend statistics and donation history, replacing previous placeholders.
     */
    const loadDashboardData = useCallback(async () => {
        try {
            // 1. Fetch Campaigns
            const campaignsRes = await fetchData(getCampaigns);
            if (campaignsRes.campaigns) {
                setCampaigns(campaignsRes.campaigns);
            }

            // 2. Fetch Aggregated Stats
            const statsRes = await fetchData(getNGOStats);
            if (statsRes) {
                setStats({
                    totalDonations: statsRes.totalRaised || 0,
                    campaignsCount: statsRes.activeCampaignsCount || 0,
                    donorsCount: statsRes.donorsCount || 0
                });
            }

            // 3. Fetch Recent Donations
            const donationsRes = await fetchData(getNGODonations);
            if (donationsRes.donations) {
                setRecentDonations(donationsRes.donations.slice(0, 5));
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    }, [fetchData]);

    useEffect(() => {
        document.body.className = 'page-dashboard';

        // Redirect to profile setup if NGO hasn't completed profile
        if (user && user.role === 'ngo' && !user.ngoName) {
            navigate('/ngo-profile-setup');
            return;
        }

        loadDashboardData();
        return () => { document.body.className = ''; };
    }, [user, navigate, loadDashboardData]); // Include all dependencies

    const topCampaign = useMemo(() => {
        if (campaigns.length === 0) return null;
        return campaigns.reduce((prev, current) => (prev.raisedAmount > current.raisedAmount) ? prev : current);
    }, [campaigns]);

    if (loading && campaigns.length === 0) return <div className="dashboard-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            {error && <div className="api-error-banner" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <h3 className="header-text">NGO Dashboard</h3>

            <div id="statistics-section" className="section-card">
                <h4 className="section-title">Statistics</h4>
                <div id="stats-content">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{stats.totalDonations.toLocaleString()}</div>
                            <div className="stat-label">Total Raised (ETB)</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats.campaignsCount}</div>
                            <div className="stat-label">Active Campaigns</div>
                        </div>
                        {/* Data Integration: Real donor count from backend */}
                        <div className="stat-item">
                            <div className="stat-value">{stats.donorsCount}</div>
                            <div className="stat-label">Unique Donors</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {stats.campaignsCount > 0 ? (stats.totalDonations / stats.campaignsCount).toFixed(2) : '0'}
                            </div>
                            <div className="stat-label">Avg. per Campaign (ETB)</div>
                        </div>
                    </div>
                    {topCampaign && (
                        <div className="mt-6 text-center">
                            <div style={{ fontWeight: 600 }}>Top Campaign:</div>
                            <div>{topCampaign.title} ({topCampaign.raisedAmount.toLocaleString()} ETB)</div>
                        </div>
                    )}
                </div>
            </div>

            <div id="campaigns-section" className="section-card">
                <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 className="section-title" style={{ marginBottom: 0 }}>Your Campaigns</h4>
                    <Link to="/my-campaigns" className="btn btn-primary">
                        + Create New Campaign
                    </Link>
                </div>

                <div className="campaigns-list">
                    {campaigns.length > 0 ? campaigns.map(campaign => {
                        const progress = campaign.targetAmount > 0
                            ? Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)
                            : 0;
                        return (
                            <div key={campaign._id} className="campaign-item">
                                <div className="campaign-info">
                                    <h5>{campaign.title}</h5>
                                    <p>{campaign.description}</p>
                                    <div className="campaign-meta">
                                        Raised: <strong>{campaign.raisedAmount.toLocaleString()} ETB</strong> of {campaign.targetAmount.toLocaleString()} ETB
                                    </div>
                                </div>
                                <div className="campaign-side">
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="campaign-actions">
                                        <Link to={`/campaign/${campaign._id}`} className="btn">View</Link>
                                        <button className="btn btn-primary">Edit</button>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <p style={{ textAlign: 'center', padding: '2rem' }}>No campaigns found. Start by creating one!</p>}
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/my-campaigns" className="btn btn-secondary">All Campaigns</Link>
                </div>
            </div>

            <div id="donations-section" className="section-card">
                <h4 className="section-title">Recent Activity</h4>
                <div className="table-wrapper">
                    {/* Data Integration: Real recent donations from backend */}
                    {recentDonations.length > 0 ? (
                        <table className="donation-table">
                            <thead>
                                <tr>
                                    <th>Donor</th>
                                    <th>Campaign</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDonations.map(d => (
                                    <tr key={d._id}>
                                        <td>{d.isAnnonymous ? 'Anonymous' : (d.donorName || d.donorId?.name || 'Guest')}</td>
                                        <td>{d.campaignId?.title || 'Unknown'}</td>
                                        <td>{d.amount.toLocaleString()} ETB</td>
                                        <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                            No recent donations found.
                        </div>
                    )}
                </div>
                <div className="mt-6 text-center">
                    <Link to="/donations" className="show-donations-btn">
                        Show all history
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NDashboard;
