import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { getNGOs } from '../apis/ngo';
import { getCampaignsByNgo } from '../apis/campaigns';
import { createDonation } from '../apis/donations';
import { updateProfile } from '../apis/profile';
import Toast from '../components/Toast';
import '../style/ngos-description.css';

const NGOs = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const { loading, error, fetchData } = useFetch();
    const [ngos, setNgos] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNGO, setSelectedNGO] = useState(null);
    const [ngoCampaigns, setNgoCampaigns] = useState([]);
    const [donationData, setDonationData] = useState({ campaign: '', amount: '', isRecurrent: false, frequency: 'monthly' });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadNGOs = async () => {
            try {
                const response = await fetchData(getNGOs);
                if (response.ngos) {
                    setNgos(response.ngos);
                }
            } catch (err) {
                console.error('Failed to load NGOs:', err);
            }
        };
        loadNGOs();
    }, [fetchData]);

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() !== '' || ngos.length === 0 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ngos.length);
        }, 5000); // Auto-scroll every 5 seconds

        return () => clearInterval(interval);
    }, [ngos.length, searchQuery, isHovered]);

    const filteredNGOs = ngos.filter(ngo =>
        (ngo.ngoName || ngo.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ngo.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const nextNGO = () => {
        if (filteredNGOs.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % filteredNGOs.length);
    };

    const prevNGO = () => {
        if (filteredNGOs.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + filteredNGOs.length) % filteredNGOs.length);
    };

    // Live payment method from user profile
    const paymentMethod = useMemo(() => {
        if (!user || !user.paymentMethods || user.paymentMethods.length === 0) {
            return "No registered payment method";
        }
        const defaultMethod = user.paymentMethods.find(m => m.isDefault) || user.paymentMethods[0];
        return `${defaultMethod.type} (${defaultMethod.identifier})`;
    }, [user]);

    const openModal = async (ngo) => {
        if (!user) {
            setToastMessage("Please login to donate to this NGO.");
            setShowToast(true);
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        // Only donors need a payment method check (NGOs might be testing or recorded as Guest/Manual)
        if (user.role === 'donor' && (!user.paymentMethods || user.paymentMethods.length === 0)) {
            setToastMessage("Please add a payment method in your profile settings before donating.");
            setShowToast(true);
            setTimeout(() => navigate('/profile'), 2000);
            return;
        }

        setSelectedNGO(ngo);
        setIsModalOpen(true);
        setNgoCampaigns([]);
        setDonationData({ campaign: '', amount: '', isRecurrent: false, frequency: 'monthly' });

        try {
            const response = await getCampaignsByNgo(ngo._id);
            if (response.campaigns) {
                // Additional filter for 'active' just in case, though backend now handles it.
                const activeOnes = response.campaigns.filter(c => c.status === 'active' || !c.status);
                setNgoCampaigns(activeOnes);
                if (activeOnes.length > 0) {
                    setDonationData(prev => ({ ...prev, campaign: activeOnes[0]._id }));
                }
            }
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNGO(null);
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!selectedNGO || !donationData.campaign || !donationData.amount) return;

        try {
            // ---- Data Integration: Use real user data ----
            // Why: Replaces hardcoded placeholder payment method with the user's actual default method.
            const defaultMethod = user?.paymentMethods?.find(m => m.isDefault) || user?.paymentMethods?.[0];
            const methodPayload = defaultMethod ? {
                type: defaultMethod.type,
                identifier: defaultMethod.identifier
            } : { type: 'Guest/Manual', identifier: 'Manual Entry' };

            const response = await fetchData(createDonation, {
                campaignId: donationData.campaign,
                donorId: user && user.role === 'donor' ? (user.id || user._id) : null,
                donorName: user ? user.name : 'Guest Donor',
                amount: Number(donationData.amount),
                isAnnonymous: false,
                method: methodPayload
            });

            if (response.donation) {
                // ---- Data Integration: Sync Recurring Settings ----
                // Why: If user opted for recurrence during donation, we save it to their profile.
                if (donationData.isRecurrent && user) {
                    await fetchData(updateProfile, {
                        recurringDonation: {
                            enabled: true,
                            amount: Number(donationData.amount),
                            frequency: donationData.frequency
                        }
                    });
                }

                // ---- Data Integration: Refresh User Stats ----
                // Why: A donation updates donor stats on the backend. 
                // Refreshing the profile ensures the UI displays the latest totalDonated and badges.
                refreshProfile();

                setToastMessage(`Success! You donated ${donationData.amount} ETB to ${selectedNGO.name || selectedNGO.ngoName}`);
                setShowToast(true);
                closeModal();
            }
        } catch (err) {
            console.error('Donation failed:', err);
        }
    };

    const currentNGO = filteredNGOs[currentIndex];

    return (
        <div className="ngos-page-wrapper">
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
            {error && <div className="api-error-banner" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

            <section className="ngos-hero" style={{ position: 'relative', paddingBottom: '3rem' }}>
                <h1 className="ngos-title">Explore Registered NGOs</h1>

                <div className="search-container" style={{ maxWidth: '400px', margin: '1.5rem auto 0', padding: '0 1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by name or mission..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid var(--accent-green)', outline: 'none', boxShadow: 'var(--shadow)' }}
                    />
                </div>
            </section>

            <section className="ngos-section">
                {loading && ngos.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>Loading NGOs...</p>
                ) : (
                    // If user has typed a search query, show a grid of matching NGO cards
                    (searchQuery && searchQuery.trim() !== '') ? (
                        filteredNGOs.length > 0 ? (
                            <div className="ngos-grid">
                                {filteredNGOs.map((ngo) => (
                                    <article key={ngo._id} className="ngo-card">
                                        <img
                                            className="ngo-card-image"
                                            src={ngo.bannerImage || `https://picsum.photos/seed/${ngo._id}/400/250`}
                                            alt={ngo.name || ngo.ngoName}
                                        />
                                        <div className="ngo-card-body">
                                            <h2 className="ngo-card-title">{ngo.name || ngo.ngoName}</h2>
                                            <p className="ngo-card-description">{ngo.description || "No description provided."}</p>
                                            <div className="ngo-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                <button className="primary-button ngo-card-button" style={{ flex: 1 }} onClick={() => openModal(ngo)}>Donate</button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center' }}>No NGOs found matching your search.</p>
                        )
                    ) : (
                        // No search query: show carousel of NGOs (as before)
                        filteredNGOs.length > 0 ? (
                            <div
                                className="carousel-wrapper"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <button onClick={prevNGO} className="carousel-btn" style={{ background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>◀</button>

                                <article className="ngo-card" style={{ flex: 1 }}>
                                    <img
                                        className="ngo-card-image"
                                        src={currentNGO.bannerImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop"}
                                        alt={currentNGO.name || currentNGO.ngoName}
                                    />
                                    <div className="ngo-card-body">
                                        <h2 className="ngo-card-title">{currentNGO.name || currentNGO.ngoName}</h2>
                                        <p className="ngo-card-description">{currentNGO.description || "No description provided."}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button
                                                className="primary-button ngo-card-button"
                                                style={{ flex: 1 }}
                                                onClick={() => openModal(currentNGO)}
                                            >
                                                Donate
                                            </button>
                                        </div>
                                    </div>
                                </article>

                                <button onClick={nextNGO} className="carousel-btn" style={{ background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>▶</button>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center' }}>{searchQuery ? "No NGOs found matching your search." : "No NGOs registered yet."}</p>
                        )
                    )
                )}
            </section>

            {/* Donation Modal */}
            {isModalOpen && selectedNGO && (
                <div className="modal-overlay open" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <h2 className="dashboard-title" style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Donate to {selectedNGO.name}
                        </h2>

                        <form className="create-form" onSubmit={handleDonate}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select Campaign</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #eef2f0' }}
                                    value={donationData.campaign}
                                    onChange={(e) => setDonationData({ ...donationData, campaign: e.target.value })}
                                    required
                                >
                                    {ngoCampaigns.length > 0 ? (
                                        ngoCampaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)
                                    ) : (
                                        <option value="">No active campaigns</option>
                                    )}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Payment Method</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={paymentMethod}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #eef2f0', background: '#f9fafb', color: '#6b7280' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="profile-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={donationData.isRecurrent}
                                        onChange={(e) => setDonationData({ ...donationData, isRecurrent: e.target.checked })}
                                    />
                                    <span>Make this a recurrent donation</span>
                                </label>
                                {donationData.isRecurrent && (
                                    <select
                                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ddd' }}
                                        value={donationData.frequency}
                                        onChange={(e) => setDonationData({ ...donationData, frequency: e.target.value })}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Donation Amount (ETB)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    required
                                    min="1"
                                    value={donationData.amount}
                                    onChange={(e) => setDonationData({ ...donationData, amount: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #eef2f0' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="modal-close-button" onClick={closeModal} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-button" style={{ flex: 2 }}>
                                    Send Donation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGOs;
