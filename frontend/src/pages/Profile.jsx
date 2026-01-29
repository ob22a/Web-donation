import React, { useState } from 'react';
import Toast from '../components/Toast';
import '../style/profile.css';
import '../style/drawer.css';

const Profile = () => {
    const [collapsed, setCollapsed] = useState({
        personal: false,
        preferences: true,
        security: true,
        payment: true
    });

    // Payment State
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, type: 'Telebirr', identifier: '**** 3921', isDefault: true }
    ]);
    const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
    const [newMethod, setNewMethod] = useState({ type: 'Telebirr', identifier: '' });

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const toggleCard = (card) => {
        setCollapsed(prev => ({ ...prev, [card]: !prev[card] }));
    };

    const handleAddMethod = (e) => {
        e.preventDefault();
        const method = {
            id: Date.now(),
            type: newMethod.type,
            identifier: newMethod.type === 'Telebirr'
                ? `**** ${newMethod.identifier.slice(-4)}`
                : newMethod.identifier.length > 4 ? `**** ${newMethod.identifier.slice(-4)}` : newMethod.identifier,
            isDefault: paymentMethods.length === 0
        };
        setPaymentMethods([...paymentMethods, method]);
        setIsAddMethodOpen(false);
        setNewMethod({ type: 'Telebirr', identifier: '' });
        setToastMessage(`${method.type} added successfully!`);
        setShowToast(true);
    };

    const banks = ['CBE', 'Awash', 'Telebirr', 'Zemen Bank', 'Dashen Bank', 'Abyssinia Bank'];

    return (
        <div className="profile-page-wrapper">
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

            <main className="page-content">
                <section className="profile-page">
                    <h1 className="profile-heading">My Profile</h1>

                    <div className="profile-layout">
                        <aside className="profile-sidebar">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar">
                                    <div className="profile-avatar-circle">OD</div>
                                    <button type="button" className="profile-avatar-upload" title="Upload image">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M512 144v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48h88l12.3-32.9c7-18.7 24.9-31.1 44.9-31.1h125.5c20 0 37.9 12.4 44.9 31.1L376 96h88c26.5 0 48 21.5 48 48zM376 288c0-66.2-53.8-120-120-120s-120 53.8-120 120 53.8 120 120 120 120-53.8 120-120zm-32 0c0 48.5-39.5 88-88 88s-88-39.5-88-88 39.5-88 88-88 88 39.5 88 88z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <button type="button" className="profile-upload-link">Upload image</button>
                                <div className="profile-name">
                                    <h2>Obssa Degefu</h2>
                                    <p>Ob22adegefu123@gmail.com</p>
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div>
                                    <div className="profile-stat-label">Total donated</div>
                                    <div className="profile-stat-value">ETB 0</div>
                                </div>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <div className="profile-stat-label">Campaigns supported</div>
                                    <div className="profile-stat-value">0</div>
                                </div>
                            </div>
                        </aside>

                        <div className="profile-main">
                            {/* Personal Information */}
                            <section className={`profile-card ${collapsed.personal ? 'collapsed' : ''}`}>
                                <header className="profile-card-header">
                                    <h2>Personal information</h2>
                                    <button type="button" className="profile-card-toggle" onClick={() => toggleCard('personal')}>
                                        {collapsed.personal ? 'Open' : 'Collapse'}
                                    </button>
                                </header>
                                {!collapsed.personal && (
                                    <div className="profile-card-body">
                                        <div className="profile-form-grid">
                                            <div className="profile-field">
                                                <label htmlFor="full-name">Full name</label>
                                                <input id="full-name" className="profile-input" type="text" defaultValue="Obssa Degefu" />
                                            </div>

                                            <div className="profile-email-panel">
                                                <div className="profile-email-title">Email</div>
                                                <div className="profile-email-meta">Primary</div>
                                                <div className="profile-button-row">
                                                    <button type="button" className="profile-save-button">+ Add secondary email</button>
                                                </div>
                                            </div>

                                            <div className="profile-field">
                                                <label htmlFor="phone">Phone</label>
                                                <input id="phone" className="profile-input" type="text" defaultValue="+251 987654321" />
                                            </div>
                                            <div className="profile-field">
                                                <label htmlFor="country">Country</label>
                                                <input id="country" className="profile-input" type="text" defaultValue="Ethiopia" />
                                            </div>
                                            <div className="profile-field">
                                                <label htmlFor="city">City</label>
                                                <input id="city" className="profile-input" type="text" defaultValue="Addis Ababa" />
                                            </div>
                                        </div>
                                        <div className="profile-button-row" style={{ marginTop: '1.25rem' }}>
                                            <button type="button" className="profile-save-button">Save changes</button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Preferences */}
                            <section className={`profile-card ${collapsed.preferences ? 'collapsed' : ''}`}>
                                <header className="profile-card-header">
                                    <div>
                                        <h2>Preferences</h2>
                                        <small>Notification & privacy settings</small>
                                    </div>
                                    <button type="button" className="profile-link-button" onClick={() => toggleCard('preferences')}>
                                        {collapsed.preferences ? 'Open' : 'Collapse'}
                                    </button>
                                </header>
                                {!collapsed.preferences && (
                                    <div className="profile-card-body">
                                        <div className="profile-preferences-grid">
                                            <div className="profile-checkbox-group">
                                                <label className="profile-checkbox-label">
                                                    <input type="checkbox" defaultChecked />
                                                    <span>Email me receipts</span>
                                                </label>
                                                <label className="profile-checkbox-label">
                                                    <input type="checkbox" defaultChecked />
                                                    <span>NGO updates</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="profile-button-row">
                                            <button type="button" className="profile-save-button">Save preferences</button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Security */}
                            <section className={`profile-card ${collapsed.security ? 'collapsed' : ''}`}>
                                <header className="profile-card-header">
                                    <div>
                                        <h2>Security</h2>
                                        <small>Change password, 2FA</small>
                                    </div>
                                    <button type="button" className="profile-link-button" onClick={() => toggleCard('security')}>
                                        {collapsed.security ? 'Open' : 'Collapse'}
                                    </button>
                                </header>
                                {!collapsed.security && (
                                    <div className="profile-card-body">
                                        <form className="profile-security-form" onSubmit={(e) => { e.preventDefault(); setToastMessage("Password changed successfully!"); setShowToast(true); }}>
                                            <div className="profile-security-field">
                                                <label htmlFor="current-password">Current password</label>
                                                <input id="current-password" type="password" required />
                                            </div>
                                            <div className="profile-security-field">
                                                <label htmlFor="new-password">New password</label>
                                                <input id="new-password" type="password" required />
                                            </div>
                                            <div className="profile-security-field">
                                                <label htmlFor="confirm-password">Confirm new password</label>
                                                <input id="confirm-password" type="password" required />
                                            </div>
                                            <div className="profile-button-row">
                                                <button type="submit" className="profile-save-button">Change password</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </section>

                            {/* Payment Methods */}
                            <section className={`profile-card ${collapsed.payment ? 'collapsed' : ''}`}>
                                <header className="profile-card-header">
                                    <div>
                                        <h2>Payment methods</h2>
                                        <small>Add or manage cards / TeleBirr / CBE</small>
                                    </div>
                                    <button type="button" className="profile-link-button" onClick={() => toggleCard('payment')}>
                                        {collapsed.payment ? 'Open' : 'Collapse'}
                                    </button>
                                </header>
                                {!collapsed.payment && (
                                    <div className="profile-card-body">
                                        <div className="profile-payment-content">
                                            <div className="profile-payment-section">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <h4>Saved Payment Methods</h4>
                                                    <button type="button" className="profile-payment-add-button" onClick={() => setIsAddMethodOpen(true)}>
                                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                                                        </svg>
                                                        Add Method
                                                    </button>
                                                </div>
                                                <div className="pm-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {paymentMethods.map(pm => (
                                                        <div key={pm.id} className="pm-item" style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #eef2f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span>{pm.type} ({pm.identifier})</span>
                                                            {pm.isDefault && <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Default</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </section>
            </main>

            {/* Add Payment Method Modal */}
            {isAddMethodOpen && (
                <div className="modal-overlay open" onClick={() => setIsAddMethodOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <h2 className="dashboard-title" style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Add Payment Method
                        </h2>
                        <form className="create-form" onSubmit={handleAddMethod}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select Method</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #eef2f0' }}
                                    value={newMethod.type}
                                    onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                                >
                                    {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    {newMethod.type === 'Telebirr' ? 'Phone Number' : 'Bank Account Number'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={newMethod.type === 'Telebirr' ? 'e.g. 0912345678' : 'Enter account number'}
                                    required
                                    value={newMethod.identifier}
                                    onChange={(e) => setNewMethod({ ...newMethod, identifier: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #eef2f0' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="modal-close-button" onClick={() => setIsAddMethodOpen(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-button" style={{ flex: 2 }}>
                                    Add Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
