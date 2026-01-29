import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { getNGODonations } from '../apis/donations';
import '../style/AllDonations.css';

const AllDonations = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loading, error, fetchData } = useFetch();

    const [donations, setDonations] = useState([]);
    const [ngoDetails, setNgoDetails] = useState({
        ngoName: '',
        category: 'children',
        description: '',
        bannerImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop'
    });

    const [filters, setFilters] = useState({
        name: '',
        minAmount: '',
        date: ''
    });

    const loadData = useCallback(async () => {
        try {
            // Sync NGO details from user context
            if (user) {
                setNgoDetails({
                    ngoName: user.ngoName || '',
                    category: user.category || 'children',
                    description: user.description || '',
                    bannerImage: user.bannerImage || ngoDetails.bannerImage
                });
            }

            // Load Donations
            const donationsRes = await fetchData(getNGODonations);
            if (donationsRes.donations) {
                setDonations(donationsRes.donations);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    }, [user, fetchData]);

    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        loadData();
        return () => { document.body.className = ''; };
    }, [loadData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            const donorName = (d.isAnnonymous ? 'Anonymous' : (d.donorId?.name || 'Guest')).toLowerCase();
            const matchName = donorName.includes(filters.name.toLowerCase());
            const matchAmount = filters.minAmount ? d.amount >= Number(filters.minAmount) : true;
            const matchDate = filters.date ? new Date(d.createdAt).toISOString().split('T')[0] === filters.date : true;
            return matchName && matchAmount && matchDate;
        });
    }, [donations, filters]);

    return (
        <div className="container donations-container">
            {/* NGO Details Preview Section */}
            <section className="section-card" style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>NGO Information & Branding</h3>
                    <button
                        className="edit-poster-btn"
                        style={{ position: 'static' }}
                        onClick={() => navigate('/ngo-profile-setup')}
                    >
                        Edit Details
                    </button>
                </div>

                <div className="ngo-display-preview" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <img src={ngoDetails.bannerImage} alt="NGO Banner" style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '0.75rem' }} />
                    <div>
                        <h4 style={{ color: 'var(--primary-green)', fontSize: '1.4rem', marginBottom: '0.25rem' }}>{ngoDetails.ngoName}</h4>
                        <span className="campaign-tag" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>Category: {ngoDetails.category}</span>
                        <p style={{ color: 'var(--gray-text)', lineHeight: 1.5 }}>{ngoDetails.description}</p>
                    </div>
                </div>
            </section>

            <div className="header">
                <h2 className="title">NGO Donation History</h2>
            </div>

            {loading && donations.length === 0 && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading donations...</div>}
            {error && <div className="api-error-banner" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

            <div className="filters-bar">
                <div className="filter-group">
                    <label>Donor Name</label>
                    <input
                        type="text"
                        name="name"
                        value={filters.name}
                        onChange={handleFilterChange}
                        placeholder="Search donors..."
                    />
                </div>
                <div className="filter-group">
                    <label>Min Amount (ETB)</label>
                    <input
                        type="number"
                        name="minAmount"
                        value={filters.minAmount}
                        onChange={handleFilterChange}
                        placeholder="Min. contributions"
                    />
                </div>
                <div className="filter-group">
                    <label>Contribution Date</label>
                    <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Donations Grid */}
            <div className="donations-grid">
                {filteredDonations.length > 0 ? (
                    filteredDonations.map(donation => (
                        <article key={donation._id} className="donation-card">
                            <div className="campaign-tag">{donation.campaignId?.title || 'Unknown Campaign'}</div>
                            <h3 className="donor-name">{donation.isAnnonymous ? 'Anonymous' : (donation.donorId?.name || 'Guest Donor')}</h3>
                            <div className="donation-amount">
                                {donation.amount.toLocaleString()} <small>ETB</small>
                            </div>
                            <div className="donation-date">
                                {new Date(donation.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </article>
                    ))
                ) : (
                    !loading && (
                        <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                            <p>No donations found matching your search criteria.</p>
                        </div>
                    )
                )}
            </div>
        </div >
    );
};

export default AllDonations;
