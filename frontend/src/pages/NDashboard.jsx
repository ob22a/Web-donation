import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { getCampaigns } from '../apis/campaigns';
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

    /**
     * Load dashboard data from API.
     * 
     * Why useCallback: Used in useEffect. Memoization prevents effect from
     * re-running unnecessarily when component re-renders.
     */
    const loadDashboardData = useCallback(async () => {
        try {
            const response = await fetchData(getCampaigns);
            if (response.campaigns) {
                setCampaigns(response.campaigns);
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

    const stats = useMemo(() => {
        const totalDonations = campaigns.reduce((acc, c) => acc + (c.raisedAmount || 0), 0);
        const campaignsCount = campaigns.length;
        const topCampaign = campaigns.length > 0
            ? campaigns.reduce((prev, current) => (prev.raisedAmount > current.raisedAmount) ? prev : current)
            : null;

        return {
            totalDonations,
            campaignsCount,
            topCampaign
        };
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
                        {/* Donors and Avg are placeholders for now as backend lacks total stats endpoint */}
                        <div className="stat-item">
                            <div className="stat-value">-</div>
                            <div className="stat-label">Donors</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {stats.campaignsCount > 0 ? (stats.totalDonations / stats.campaignsCount).toFixed(2) : '0'}
                            </div>
                            <div className="stat-label">Avg. per Campaign (ETB)</div>
                        </div>
                    </div>
                    {stats.topCampaign && (
                        <div className="mt-6 text-center">
                            <div style={{ fontWeight: 600 }}>Top Campaign:</div>
                            <div>{stats.topCampaign.title} ({stats.topCampaign.raisedAmount.toLocaleString()} ETB)</div>
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
                    {/* Placeholder table since backend lacks global donation feed for NGO */}
                    <table className="donation-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Campaign</th>
                                <th>Goal</th>
                                <th>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.slice(0, 5).map(c => (
                                <tr key={c._id}>
                                    <td><span className={`status-badge ${c.status?.toLowerCase() || 'active'}`}>{c.status || 'Active'}</span></td>
                                    <td>{c.title}</td>
                                    <td>{c.targetAmount.toLocaleString()} ETB</td>
                                    <td>{((c.raisedAmount / c.targetAmount) * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
