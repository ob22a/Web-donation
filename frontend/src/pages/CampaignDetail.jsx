import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style/CampaignDetail.css';

// Mock Data
const CAMPAIGN_DATA = {
    id: '123',
    title: 'Education for 100 Children',
    description: 'Our mission is to bridge the educational gap for 100 children in underserved communities. By providing essential school supplies, covering tuition fees, and offering mentorship, we aim to empower the next generation with the tools they need for a brighter future. Every contribution helps transform a life.',
    raised: 64200,
    target: 100000,
    status: 'In Progress',
    organizer: 'Bright Futures NGO'
};

const INITIAL_DONORS = [
    { id: 1, name: 'Abebe Bikila', amount: 500, date: '2023-10-01' },
    { id: 2, name: 'Chala Muleta', amount: 200, date: '2023-10-02' },
    { id: 3, name: 'Anonymous', amount: 1000, date: '2023-10-03' },
    { id: 4, name: 'Tigist Assefa', amount: 1500, date: '2023-10-05' },
    { id: 5, name: 'Hagos Gebre', amount: 300, date: '2023-10-06' },
    { id: 6, name: 'Fatima Ahmed', amount: 2500, date: '2023-10-08' },
];

const CampaignDetail = () => {
    const { id } = useParams();
    const [donors, setDonors] = useState(INITIAL_DONORS);
    const [page, setPage] = useState(1);
    const itemsPerPage = 4;

    const [formData, setFormData] = useState({ name: '', amount: '', isAnonymous: false });
    const [donorFilter, setDonorFilter] = useState('');

    const progress = Math.min((CAMPAIGN_DATA.raised / CAMPAIGN_DATA.target) * 100, 100);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const newDonor = {
            id: Date.now(),
            name: formData.isAnonymous ? 'Anonymous' : (formData.name || 'Anonymous'),
            amount: Number(formData.amount),
            date: new Date().toISOString().split('T')[0]
        };
        setDonors([newDonor, ...donors]);
        setFormData({ name: '', amount: '', isAnonymous: false });
    };

    const filteredDonors = useMemo(() => {
        return donors.filter(d => d.name.toLowerCase().includes(donorFilter.toLowerCase()));
    }, [donors, donorFilter]);

    const paginatedDonors = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredDonors.slice(start, start + itemsPerPage);
    }, [filteredDonors, page]);

    const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);

    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        return () => { document.body.className = ''; };
    }, []);

    return (
        <div className="container campaign-detail-container">
            <section className="campaign-info-card">
                <div className="campaign-badge">{CAMPAIGN_DATA.status}</div>
                <h1 className="campaign-title-large">{CAMPAIGN_DATA.title}</h1>
                <p className="campaign-desc-text">{CAMPAIGN_DATA.description}</p>

                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Total Raised</span>
                        <span className="stat-value highlight">{CAMPAIGN_DATA.raised.toLocaleString()} ETB</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Target Goal</span>
                        <span className="stat-value">{CAMPAIGN_DATA.target.toLocaleString()} ETB</span>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="custom-progress">
                        <div className="custom-progress-inner" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6b7280' }}>
                        <span>{progress.toFixed(1)}% Completed</span>
                        <span>By {CAMPAIGN_DATA.organizer}</span>
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
                                placeholder="Donor Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={formData.isAnonymous}
                                required={!formData.isAnonymous}
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
                        <button type="submit" className="primary-button">
                            Confirm & Record
                        </button>
                    </form>
                </section>

                <section className="list-panel">
                    <div className="panel-title">
                        <span>Recent Donors</span>
                        <input
                            type="text"
                            className="donor-filter-input"
                            placeholder="Search donors..."
                            value={donorFilter}
                            onChange={(e) => { setDonorFilter(e.target.value); setPage(1); }}
                        />
                    </div>

                    <ul className="donors-ul">
                        {paginatedDonors.map(donor => (
                            <li key={donor.id} className="donor-li">
                                <div className="donor-main-info">
                                    <span className="donor-name-text">{donor.name}</span>
                                    <span className="donor-date-text">{new Date(donor.date).toDateString()}</span>
                                </div>
                                <span className="donor-amount-text">
                                    {donor.amount.toLocaleString()} <small>ETB</small>
                                </span>
                            </li>
                        ))}
                        {paginatedDonors.length === 0 && (
                            <li style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                No donors found matching "{donorFilter}"
                            </li>
                        )}
                    </ul>

                    {totalPages > 1 && (
                        <div className="pagination-footer">
                            <button
                                className="pg-btn"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pg-info">Page {page} of {totalPages}</span>
                            <button
                                className="pg-btn"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
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
