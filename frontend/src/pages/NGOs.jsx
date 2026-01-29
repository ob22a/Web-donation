import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import '../style/ngos-description.css';

const NGOS = [
    {
        id: 1,
        name: "Macedonia Humanitarian Association",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop",
        description: "Supporting homeless and vulnerable communities in Addis Ababa.",
        campaigns: ["Shelter Expansion", "Food Program", "Medical Support"]
    },
    {
        id: 2,
        name: "Organization for Women in Self Employment (WISE)",
        image: "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=400&auto=format&fit=crop",
        description: "Empowering women through training and microfinance initiatives.",
        campaigns: ["Micro-grants", "Skills Training", "Business Mentorship"]
    },
    {
        id: 3,
        name: "Hope for Children Organization",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop",
        description: "Improving child welfare through education and health programs.",
        campaigns: ["School Supplies Drive", "Healthcare Kits", "Nutrition Support"]
    }
];

const NGOs = () => {
    const [selectedNGO, setSelectedNGO] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [donationData, setDonationData] = useState({ campaign: '', amount: '', isRecurrent: false, frequency: 'monthly' });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Carousel & Search State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNGOs = NGOS.filter(ngo =>
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const nextNGO = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredNGOs.length);
    };

    const prevNGO = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredNGOs.length) % filteredNGOs.length);
    };

    // Mock payment method
    const paymentMethod = "Telebirr (**** 3921)";

    const openModal = (ngo) => {
        setSelectedNGO(ngo);
        setDonationData({ campaign: ngo.campaigns[0], amount: '', isRecurrent: false, frequency: 'monthly' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNGO(null);
    };

    const handleDonate = (e) => {
        e.preventDefault();
        if (!selectedNGO) return;
        const recurrentText = donationData.isRecurrent ? ` (${donationData.frequency} donation)` : '';
        setToastMessage(`Success! You donated ${donationData.amount} ETB to ${selectedNGO.name}${recurrentText}`);
        setShowToast(true);
        closeModal();
    };

    const currentNGO = filteredNGOs[currentIndex];

    return (
        <div className="ngos-page-wrapper">
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

            <section className="ngos-hero" style={{ position: 'relative', paddingBottom: '3rem' }}>
                <h1 className="ngos-title">Available NGOs for Donation</h1>

                {/* Search Bar on top of carousel */}
                <div className="search-container" style={{ maxWidth: '400px', margin: '1.5rem auto 0', padding: '0 1rem' }}>
                    <input
                        type="text"
                        placeholder="Search NGOs..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid var(--accent-green)', outline: 'none', boxShadow: 'var(--shadow)' }}
                    />
                </div>
            </section>

            <section className="ngos-section">
                {filteredNGOs.length > 0 ? (
                    <div className="carousel-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                        <button onClick={prevNGO} className="carousel-btn" style={{ background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>◀</button>

                        <article className="ngo-card" style={{ flex: 1 }}>
                            <img
                                className="ngo-card-image"
                                src={currentNGO.image}
                                alt={currentNGO.name}
                            />
                            <div className="ngo-card-body">
                                <h2 className="ngo-card-title">{currentNGO.name}</h2>
                                <p className="ngo-card-description">{currentNGO.description}</p>
                                <button
                                    className="primary-button ngo-card-button"
                                    onClick={() => openModal(currentNGO)}
                                >
                                    Donate
                                </button>
                            </div>
                        </article>

                        <button onClick={nextNGO} className="carousel-btn" style={{ background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>▶</button>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center' }}>No NGOs found matching your search.</p>
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
                                    {selectedNGO.campaigns.map(c => <option key={c} value={c}>{c}</option>)}
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
