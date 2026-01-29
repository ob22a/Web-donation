import React, { useState, useMemo, useEffect } from 'react';
import '../style/AllDonations.css';

// Mock Data
const MOCK_DONATIONS = [
    { id: 1, donor: 'Alemu Tadesse', amount: 5000, campaign: 'Education for 100 Children', date: '2023-10-15' },
    { id: 2, donor: 'Kebede Bekele', amount: 1500, campaign: 'Clean Water Initiative', date: '2023-10-18' },
    { id: 3, donor: 'Anonymous', amount: 300, campaign: 'Emergency Food Relief', date: '2023-10-20' },
    { id: 4, donor: 'Sara Abraham', amount: 10000, campaign: 'Education for 100 Children', date: '2023-10-22' },
    { id: 5, donor: 'Dawit Solomon', amount: 750, campaign: 'Medical Supplies for Hospital', date: '2023-10-25' },
];

const AllDonations = () => {
    const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop');
    const [isEditingPoster, setIsEditingPoster] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [filters, setFilters] = useState({
        name: '',
        minAmount: '',
        date: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleCloudinaryUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockCloudinaryUrl = URL.createObjectURL(selectedFile);
            setPosterUrl(mockCloudinaryUrl);
            setIsEditingPoster(false);
            setSelectedFile(null);
            alert('Poster updated successfully (Mock Cloudinary Upload)');
        } catch (error) {
            alert('Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const filteredDonations = useMemo(() => {
        return MOCK_DONATIONS.filter(d => {
            const matchName = d.donor.toLowerCase().includes(filters.name.toLowerCase());
            const matchAmount = filters.minAmount ? d.amount >= Number(filters.minAmount) : true;
            const matchDate = filters.date ? d.date === filters.date : true;
            return matchName && matchAmount && matchDate;
        });
    }, [filters]);

    useEffect(() => {
        document.body.className = 'page-my-campaigns';
        return () => { document.body.className = ''; };
    }, []);

    // NGO Editor State
    const [ngoDetails, setNgoDetails] = useState({
        name: "Abay Humanitarian Organization",
        category: "children",
        description: "Transforming lives through community-led social development projects and educational initiatives."
    });

    const handleSaveDetails = () => {
        setIsEditingPoster(false);
        alert("Organization profile updated!");
    };

    return (
        <div className="container donations-container">
            {/* NGO Details Editor Section */}
            <section className="section-card" style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>NGO Information & Branding</h3>
                    <button
                        className="edit-poster-btn"
                        style={{ position: 'static' }}
                        onClick={() => setIsEditingPoster(!isEditingPoster)}
                    >
                        {isEditingPoster ? 'Discard Changes' : 'Edit Details'}
                    </button>
                </div>

                {!isEditingPoster ? (
                    <div className="ngo-display-preview" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <img src={posterUrl} alt="NGO Banner" style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '0.75rem' }} />
                        <div>
                            <h4 style={{ color: 'var(--primary-green)', fontSize: '1.4rem', marginBottom: '0.25rem' }}>{ngoDetails.name}</h4>
                            <span className="campaign-tag" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>Category: {ngoDetails.category}</span>
                            <p style={{ color: 'var(--gray-text)', lineHeight: 1.5 }}>{ngoDetails.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="edit-donation" style={{ display: 'grid', gap: '1.25rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary-green)', marginBottom: '0.4rem' }}>Organization Name</label>
                            <input
                                type="text"
                                value={ngoDetails.name}
                                onChange={(e) => setNgoDetails({ ...ngoDetails, name: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e6eef0' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary-green)', marginBottom: '0.4rem' }}>Primary Category</label>
                                <select
                                    value={ngoDetails.category}
                                    onChange={(e) => setNgoDetails({ ...ngoDetails, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e6eef0' }}
                                >
                                    <option value="children">Children & Youth</option>
                                    <option value="women">Women Empowerment</option>
                                    <option value="environment">Environment</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary-green)', marginBottom: '0.4rem' }}>Banner Image</label>
                                <input type="file" style={{ width: '100%', fontSize: '0.85rem' }} accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary-green)', marginBottom: '0.4rem' }}>Mission Statement / Description</label>
                            <textarea
                                rows="3"
                                value={ngoDetails.description}
                                onChange={(e) => setNgoDetails({ ...ngoDetails, description: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e6eef0', resize: 'vertical' }}
                            />
                        </div>
                        <button
                            className="save-btn"
                            style={{ padding: '0.75rem', fontSize: '1rem' }}
                            onClick={handleSaveDetails}
                        >
                            Save Organization Profile
                        </button>
                    </div>
                )}
            </section>

            <div className="header">
                <h2 className="title">Platform Donations</h2>
            </div>

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
                        <article key={donation.id} className="donation-card">
                            <div className="campaign-tag">{donation.campaign}</div>
                            <h3 className="donor-name">{donation.donor}</h3>
                            <div className="donation-amount">
                                {donation.amount.toLocaleString()} <small>ETB</small>
                            </div>
                            <div className="donation-date">
                                {new Date(donation.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No donations match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllDonations;
