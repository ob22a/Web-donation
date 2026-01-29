import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/NDashboardStyle.css';

const NDashboard = () => {
    useEffect(() => {
        document.body.className = 'page-dashboard';
        return () => { document.body.className = ''; };
    }, []);

    return (
        <div className="dashboard-container">
            <h3 className="header-text">NGO Dashboard</h3>

            <div id="statistics-section" class="section-card">
                <h4 class="section-title">Statistics</h4>
                <div id="stats-content">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">15,520</div>
                            <div class="stat-label">Total Donations (ETB)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">78</div>
                            <div class="stat-label">Donors</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">4</div>
                            <div class="stat-label">Campaigns</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">198.97</div>
                            <div class="stat-label">Avg. Donation (ETB)</div>
                        </div>
                    </div>
                    <div class="mt-6 text-center">
                        <div style={{ fontWeight: 600 }}>Top Campaign:</div>
                        <div>School Supplies Drive (8,200 ETB)</div>
                    </div>
                </div>
            </div>

            <div id="campaigns-section" class="section-card">
                <div class="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 class="section-title" style={{ marginBottom: 0 }}>Your Campaigns</h4>
                    <Link to="/my-campaigns" class="btn btn-primary">
                        + Create New Campaign
                    </Link>
                </div>

                <div class="campaigns-list">
                    <div class="campaign-item">
                        <div class="campaign-info">
                            <h5>Clean Water for Rural School</h5>
                            <p>Install a borehole and water tanks to provide clean drinking water for the school and nearby community.</p>
                            <div class="campaign-meta">
                                Raised: <strong>12,300 ETB</strong> of 20,000 ETB
                            </div>
                        </div>
                        <div class="campaign-side">
                            <div class="progress-track">
                                <div class="progress-fill" style={{ width: '61%' }}></div>
                            </div>
                            <div class="campaign-actions">
                                <Link to="/campaign/1" class="btn">View</Link>
                                <button class="btn btn-primary">Edit</button>
                            </div>
                        </div>
                    </div>

                    <div class="campaign-item">
                        <div class="campaign-info">
                            <h5>School Supplies Drive</h5>
                            <p>Provide notebooks, pens and uniforms to underprivileged children in Addis Ababa.</p>
                            <div class="campaign-meta">
                                Raised: <strong>8,200 ETB</strong> of 8,200 ETB
                            </div>
                        </div>
                        <div class="campaign-side">
                            <div class="progress-track">
                                <div class="progress-fill" style={{ width: '100%' }}></div>
                            </div>
                            <div class="campaign-actions">
                                <Link to="/campaign/2" class="btn">View</Link>
                                <button class="btn btn-primary">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/my-campaigns" class="btn btn-secondary">All Campaigns</Link>
                </div>
            </div>

            <div id="donations-section" class="section-card">
                <h4 class="section-title">Recent Donations</h4>
                <div class="table-wrapper">
                    <table class="donation-table">
                        <thead>
                            <tr>
                                <th>Donor</th>
                                <th>Amount (ETB)</th>
                                <th>Campaign</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Abebe Kebede</td>
                                <td>500</td>
                                <td>Water Well Project</td>
                                <td>10/25/2024</td>
                            </tr>
                            <tr>
                                <td>Jane Doe</td>
                                <td>1,000</td>
                                <td>School Supplies Drive</td>
                                <td>10/24/2024</td>
                            </tr>
                            <tr>
                                <td>Anonymous</td>
                                <td>50</td>
                                <td>Water Well Project</td>
                                <td>10/23/2024</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-6 text-center">
                    <Link to="/donations" class="show-donations-btn">
                        Show all history
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NDashboard;
