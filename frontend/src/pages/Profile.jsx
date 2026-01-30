import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { updateProfile } from '../apis/profile';
import { uploadProfilePicture } from '../apis/auth';
import { uploadNgoBanner } from '../apis/ngo';
import Toast from '../components/Toast';
import '../style/profile.css';
import '../style/drawer.css';

/**
 * Profile page component - allows users to manage their profile information.
 * 
 * Architecture: Large component handling multiple form sections (personal info,
 * preferences, security, payment methods, organization details). Uses collapsible
 * sections to organize the UI.
 * 
 * Performance optimizations:
 * - useCallback for all event handlers to prevent unnecessary re-renders
 * - useMemo for derived values (isNGO, banks array)
 * - Proper useEffect dependencies to prevent stale closures
 * 
 * State management: Local form state synced with auth context user object.
 * Changes are saved to backend and then reflected in auth context.
 */
const Profile = () => {
    const { user, login } = useAuth();
    const { loading, error, fetchData } = useFetch();

    // Memoize derived value to avoid recalculating on every render
    const isNGO = useMemo(() => user?.role === 'ngo', [user?.role]);

    const [collapsed, setCollapsed] = useState({
        personal: false,
        preferences: true,
        security: true,
        payment: true,
        organization: true
    });

    // Form states
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        phoneNumber: '',
        country: '',
        city: '',
        secondaryEmail: ''
    });

    // NGO-specific state
    const [ngoInfo, setNgoInfo] = useState({
        ngoName: '',
        category: 'children',
        description: '',
        story: ''
    });

    const [preferences, setPreferences] = useState({
        emailReceipts: true,
        ngoUpdates: true,
        notifyExpiringCards: true
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Local payment state for display - backend is source of truth
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
    const [newMethod, setNewMethod] = useState({ type: 'Telebirr', identifier: '', isDefault: false });

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
    const [tempEmail, setTempEmail] = useState('');

    // Memoize banks array - static data shouldn't be recreated on every render
    const banks = useMemo(() => ['Telebirr', 'CBE', 'Awash Bank', 'Abyssinia Bank', 'Zemen Bank'], []);

    /**
     * Sync local state when user changes.
     * 
     * Why only user in deps: isNGO is derived from user.role, so including it
     * would cause the effect to run twice when user changes. We only need to
     * sync when user object changes.
     */
    useEffect(() => {
        if (user) {
            setPersonalInfo({
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                country: user.country || '',
                city: user.city || '',
                secondaryEmail: user.secondaryEmail || ''
            });

            if (user.role === 'donor') {
                setPreferences({
                    emailReceipts: user.preference?.emailReceipts ?? true,
                    ngoUpdates: user.preference?.ngoUpdates ?? true,
                    notifyExpiringCards: user.preference?.notifyExpiringCards ?? true
                });
                setPaymentMethods(user.paymentMethods || []);
            } else if (user.role === 'ngo') {
                setNgoInfo({
                    ngoName: user.ngoName || '',
                    category: user.category || 'children',
                    description: user.description || '',
                    story: user.story || ''
                });
            }
        }
    }, [user]); // Only depend on user, not isNGO (derived value)

    /**
     * Toggle card collapse state.
     * 
     * Why useCallback: This function is passed to multiple onClick handlers.
     * Without memoization, it would be recreated on every render, causing
     * child components to re-render unnecessarily.
     */
    const toggleCard = useCallback((card) => {
        setCollapsed(prev => ({ ...prev, [card]: !prev[card] }));
    }, []); // No deps: setState function is stable

    /**
     * Handle personal information save.
     * 
     * Why useCallback: Used in form onSubmit. Memoization prevents form
     * from re-rendering unnecessarily when other state changes.
     */
    const handleSavePersonal = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await fetchData(updateProfile, personalInfo);
            if (response.user) {
                login(response.user);
                setToastMessage("Profile updated successfully!");
                setShowToast(true);
            }
        } catch (err) {
            console.error('Update profile error:', err);
        }
    }, [personalInfo, fetchData, login]);

    /**
     * Handle preferences save.
     * 
     * Why useCallback: Used in onClick handler. Prevents unnecessary re-renders.
     */
    const handleSavePreferences = useCallback(async () => {
        try {
            const response = await fetchData(updateProfile, { preference: preferences });
            if (response.user) {
                login(response.user);
                setToastMessage("Preferences saved!");
                setShowToast(true);
            }
        } catch (err) {
            console.error('Update preferences error:', err);
        }
    }, [preferences, fetchData, login]);

    /**
     * Handle NGO information save.
     * 
     * Why useCallback: Used in form onSubmit. Prevents unnecessary re-renders.
     */
    const handleSaveNGOInfo = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await fetchData(updateProfile, ngoInfo);
            if (response.user) {
                login(response.user);
                setToastMessage("Organization details updated!");
                setShowToast(true);
            }
        } catch (err) {
            console.error('Update NGO info error:', err);
        }
    }, [ngoInfo, fetchData, login]);

    /**
     * Handle password change.
     * 
     * Why useCallback: Used in form onSubmit. Prevents unnecessary re-renders.
     */
    const handlePasswordChange = useCallback(async (e) => {
        e.preventDefault();
        try {
            if (passwords.newPassword !== passwords.confirmPassword) {
                setToastMessage("Passwords do not match!");
                setShowToast(true);
                return;
            }
            const response = await fetchData(updateProfile, passwords);
            if (response.message === "Profile updated successfully") {
                setToastMessage("Password changed successfully!");
                setShowToast(true);
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setCollapsed(prev => ({ ...prev, security: true }));
            }
        } catch (err) {
            console.error('Password change error:', err);
        }
    }, [passwords, fetchData]);

    /**
     * Handle secondary email add.
     * 
     * Why useCallback: Used in form onSubmit. Prevents unnecessary re-renders.
     */
    const handleAddEmail = useCallback((e) => {
        e.preventDefault();
        setPersonalInfo(prev => ({ ...prev, secondaryEmail: tempEmail }));
        setIsAddEmailOpen(false);
    }, [tempEmail]);

    /**
     * Handle payment method add.
     * 
     * Why useCallback: Used in form onSubmit. Prevents unnecessary re-renders.
     */
    const handleAddMethod = useCallback(async (e) => {
        e.preventDefault();
        try {
            const methodPayload = {
                paymentMethods: true,
                newPaymentMethod: {
                    type: newMethod.type,
                    identifier: newMethod.identifier,
                    isDefault: paymentMethods.length === 0 || newMethod.isDefault
                }
            };
            const response = await fetchData(updateProfile, methodPayload);
            if (response.user) {
                login(response.user);
                setIsAddMethodOpen(false);
                setNewMethod({ type: 'Telebirr', identifier: '', isDefault: false });
                setToastMessage(`${newMethod.type} added successfully!`);
                setShowToast(true);
            }
        } catch (err) {
            console.error('Add payment method error:', err);
        }
    }, [newMethod, paymentMethods.length, fetchData, login]);

    /**
     * Handle NGO banner upload.
     * 
     * Why useCallback: Used in file input onChange. Prevents unnecessary re-renders.
     */
    const handleBannerUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('bannerImage', file);

        try {
            const response = await fetchData(uploadNgoBanner, formData);
            if (response.bannerImage) {
                login({ ...user, bannerImage: response.bannerImage });
                setToastMessage("Banner updated!");
                setShowToast(true);
            }
        } catch (err) {
            console.error('Banner upload error:', err);
        }
    }, [user, fetchData, login]);

    /**
     * Handle profile picture upload.
     * 
     * Why useCallback: Used in file input onChange. Prevents unnecessary re-renders.
     */
    const handleAvatarUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetchData(uploadProfilePicture, formData);
            if (response.profilePicture) {
                login({ ...user, profilePicture: response.profilePicture });
                setToastMessage("Profile picture updated!");
                setShowToast(true);
            }
        } catch (err) {
            console.error('Avatar upload error:', err);
        }
    }, [user, fetchData, login]);

    // Memoize user initials calculation
    const userInitials = useMemo(() => {
        return user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    }, [user?.name]);

    // Memoize close handlers to prevent Toast re-renders
    const handleCloseToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const handleCloseAddMethod = useCallback(() => {
        setIsAddMethodOpen(false);
    }, []);

    const handleCloseAddEmail = useCallback(() => {
        setIsAddEmailOpen(false);
    }, []);

    // Memoize handlers for secondary email button
    const handleOpenAddEmail = useCallback(() => {
        setTempEmail('');
        setIsAddEmailOpen(true);
    }, []);

    const handleChangeEmail = useCallback(() => {
        setTempEmail(personalInfo.secondaryEmail);
        setIsAddEmailOpen(true);
    }, [personalInfo.secondaryEmail]);

    if (!user) return <div className="profile-page-wrapper">Loading...</div>;

    // Extract inline styles to constants to prevent object recreation
    const avatarImageStyle = { objectFit: 'cover' };
    const uploadLabelStyle = { cursor: 'pointer' };
    const emailMetaStyle = { marginTop: '0.5rem', fontWeight: 500, color: 'var(--primary-text)' };
    const buttonRowStyle = { gridColumn: '1 / -1', marginTop: '1.25rem' };
    const bannerContainerStyle = { display: 'flex', gap: '1rem', alignItems: 'center' };
    const bannerImageStyle = { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' };
    const uploadButtonStyle = { cursor: 'pointer', margin: 0 };
    const paymentHeaderStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' };
    const paymentItemStyle = { padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #eef2f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const defaultBadgeStyle = { color: 'var(--primary-green)', fontWeight: 600 };
    const modalContentStyle = { maxWidth: '400px' };
    const modalTitleStyle = { color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' };
    const formGroupStyle = { marginBottom: '1rem' };
    const formGroupLargeStyle = { marginBottom: '1.5rem' };
    const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #eef2f0' };
    const modalActionsStyle = { display: 'flex', gap: '1rem' };
    const buttonFlex1Style = { flex: 1 };
    const buttonFlex2Style = { flex: 2 };
    const statsMarginStyle = { marginTop: '0.75rem' };
    const fieldFullWidthStyle = { gridColumn: '1 / -1' };

    return (
        <div className="profile-page-wrapper">
            {showToast && <Toast message={toastMessage} onClose={handleCloseToast} />}
            {error && <div className="api-error-banner">{error}</div>}

            <main className="page-content">
                <section className="profile-page">
                    <h1 className="profile-heading">My Profile</h1>

                    <div className="profile-layout">
                        <aside className="profile-sidebar">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt="Avatar" className="profile-avatar-circle" style={avatarImageStyle} />
                                    ) : (
                                        <div className="profile-avatar-circle">{userInitials}</div>
                                    )}
                                    <label className="profile-avatar-upload" title="Upload image" style={uploadLabelStyle}>
                                        <input type="file" hidden onChange={handleAvatarUpload} accept="image/*" />
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M512 144v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48h88l12.3-32.9c7-18.7 24.9-31.1 44.9-31.1h125.5c20 0 37.9 12.4 44.9 31.1L376 96h88c26.5 0 48 21.5 48 48zM376 288c0-66.2-53.8-120-120-120s-120 53.8-120 120 53.8 120 120 120 120-53.8 120-120zm-32 0c0 48.5-39.5 88-88 88s-88-39.5-88-88 39.5-88 88-88 88 39.5 88 88z"></path>
                                        </svg>
                                    </label>
                                </div>
                                <div className="profile-name">
                                    <h2>{user.name}</h2>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div>
                                    <div className="profile-stat-label">Total donated</div>
                                    <div className="profile-stat-value">ETB {user.totalDonated || 0}</div>
                                </div>
                                <div style={statsMarginStyle}>
                                    <div className="profile-stat-label">Campaigns supported</div>
                                    <div className="profile-stat-value">{user.campaignsSupportedCount || 0}</div>
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
                                        <form className="profile-form-grid" onSubmit={handleSavePersonal}>
                                            <div className="profile-field">
                                                <label htmlFor="full-name">Full name</label>
                                                <input id="full-name" className="profile-input" type="text" value={personalInfo.name} onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                                            </div>

                                            <div className="profile-email-panel">
                                                <div className="profile-email-title">Email</div>
                                                <div className="profile-email-meta">Secondary</div>
                                                <div className="profile-button-row">
                                                    {personalInfo.secondaryEmail ? (
                                                        <div className="profile-email-meta" style={emailMetaStyle}>
                                                            {personalInfo.secondaryEmail}
                                                            <button type="button" className="profile-link-button ml-2" onClick={handleChangeEmail} style={{ fontSize: '0.8rem' }}>Change</button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" className="profile-save-button" onClick={handleOpenAddEmail}>
                                                            + Add secondary email
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="profile-field">
                                                <label htmlFor="phone">Phone</label>
                                                <input id="phone" className="profile-input" type="text" value={personalInfo.phoneNumber} onChange={e => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })} />
                                            </div>
                                            <div className="profile-field">
                                                <label htmlFor="country">Country</label>
                                                <input id="country" className="profile-input" type="text" value={personalInfo.country} onChange={e => setPersonalInfo({ ...personalInfo, country: e.target.value })} />
                                            </div>
                                            <div className="profile-field">
                                                <label htmlFor="city">City</label>
                                                <input id="city" className="profile-input" type="text" value={personalInfo.city} onChange={e => setPersonalInfo({ ...personalInfo, city: e.target.value })} />
                                            </div>
                                            <div className="profile-button-row" style={buttonRowStyle}>
                                                <button type="submit" className="profile-save-button" disabled={loading}>
                                                    {loading ? 'Saving...' : 'Save changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </section>

                            {/* Preferences (Donor Only) */}
                            {!isNGO && (
                                <section className={`profile-card ${collapsed.preferences ? 'collapsed' : ''}`}>
                                    <header className="profile-card-header">
                                        <div>
                                            <h2>Preferences</h2>
                                            <small>Notification settings</small>
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
                                                        <input type="checkbox" checked={preferences.emailReceipts} onChange={e => setPreferences({ ...preferences, emailReceipts: e.target.checked })} />
                                                        <span>Email me receipts</span>
                                                    </label>
                                                    <label className="profile-checkbox-label">
                                                        <input type="checkbox" checked={preferences.ngoUpdates} onChange={e => setPreferences({ ...preferences, ngoUpdates: e.target.checked })} />
                                                        <span>NGO updates</span>
                                                    </label>
                                                    {/* Data Integration: Real preference from backend model */}
                                                    <label className="profile-checkbox-label">
                                                        <input type="checkbox" checked={preferences.notifyExpiringCards} onChange={e => setPreferences({ ...preferences, notifyExpiringCards: e.target.checked })} />
                                                        <span>Notify me of expiring cards</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="profile-button-row">
                                                <button type="button" className="profile-save-button" onClick={handleSavePreferences} disabled={loading}>
                                                    {loading ? 'Saving...' : 'Save preferences'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Security */}
                            <section className={`profile-card ${collapsed.security ? 'collapsed' : ''}`}>
                                <header className="profile-card-header">
                                    <div>
                                        <h2>Security</h2>
                                        <small>Change password</small>
                                    </div>
                                    <button type="button" className="profile-link-button" onClick={() => toggleCard('security')}>
                                        {collapsed.security ? 'Open' : 'Collapse'}
                                    </button>
                                </header>
                                {!collapsed.security && (
                                    <div className="profile-card-body">
                                        <form className="profile-security-form" onSubmit={handlePasswordChange}>
                                            <div className="profile-security-field">
                                                <label htmlFor="current-password">Current password</label>
                                                <input id="current-password" type="password" required value={passwords.oldPassword} onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })} />
                                            </div>
                                            <div className="profile-security-field">
                                                <label htmlFor="new-password">New password</label>
                                                <input id="new-password" type="password" required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                                            </div>
                                            <div className="profile-security-field">
                                                <label htmlFor="confirm-password">Confirm new password</label>
                                                <input id="confirm-password" type="password" required value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                                            </div>
                                            <div className="profile-button-row">
                                                <button type="submit" className="profile-save-button" disabled={loading}>
                                                    {loading ? 'Updating...' : 'Change password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </section>

                            {/* Organization Details (NGO Only) */}
                            {isNGO && (
                                <section className={`profile-card ${collapsed.organization ? 'collapsed' : ''}`}>
                                    <header className="profile-card-header">
                                        <div>
                                            <h2>Organization Details</h2>
                                            <small>NGO branding and mission</small>
                                        </div>
                                        <button type="button" className="profile-link-button" onClick={() => toggleCard('organization')}>
                                            {collapsed.organization ? 'Open' : 'Collapse'}
                                        </button>
                                    </header>
                                    {!collapsed.organization && (
                                        <div className="profile-card-body">
                                            <form className="profile-form-grid" onSubmit={handleSaveNGOInfo}>
                                                <div className="profile-field">
                                                    <label htmlFor="ngo-name">Official NGO Name</label>
                                                    <input id="ngo-name" className="profile-input" type="text" value={ngoInfo.ngoName} onChange={e => setNgoInfo({ ...ngoInfo, ngoName: e.target.value })} />
                                                </div>
                                                <div className="profile-field">
                                                    <label htmlFor="category">Category</label>
                                                    <select id="category" className="profile-input" value={ngoInfo.category} onChange={e => setNgoInfo({ ...ngoInfo, category: e.target.value })}>
                                                        <option value="children">Children & Youth</option>
                                                        <option value="women">Women Empowerment</option>
                                                        <option value="environment">Environment & Conservation</option>
                                                        <option value="health">Healthcare</option>
                                                        <option value="education">Education</option>
                                                    </select>
                                                </div>
                                                <div className="profile-field" style={fieldFullWidthStyle}>
                                                    <label htmlFor="description">Mission Statement</label>
                                                    <input id="description" className="profile-input" type="text" value={ngoInfo.description} onChange={e => setNgoInfo({ ...ngoInfo, description: e.target.value })} />
                                                </div>
                                                <div className="profile-field" style={fieldFullWidthStyle}>
                                                    <label htmlFor="story">Full Story / History</label>
                                                    <textarea id="story" className="profile-input" rows="4" value={ngoInfo.story} onChange={e => setNgoInfo({ ...ngoInfo, story: e.target.value })} />
                                                </div>
                                                <div className="profile-field" style={fieldFullWidthStyle}>
                                                    <label>Organization Banner</label>
                                                    <div style={bannerContainerStyle}>
                                                        {user.bannerImage && (
                                                            <img src={user.bannerImage} alt="NGO Banner" style={bannerImageStyle} />
                                                        )}
                                                        <label className="profile-save-button" style={uploadButtonStyle}>
                                                            <input type="file" hidden onChange={handleBannerUpload} accept="image/*" />
                                                            Upload Banner
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="profile-button-row" style={buttonRowStyle}>
                                                    <button type="submit" className="profile-save-button" disabled={loading}>
                                                        {loading ? 'Saving...' : 'Save Organization Details'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Payment Methods (Donor Only) */}
                            {!isNGO && (
                                <section className={`profile-card ${collapsed.payment ? 'collapsed' : ''}`}>
                                    <header className="profile-card-header">
                                        <div>
                                            <h2>Payment methods</h2>
                                            <small>Manage cards / TeleBirr / CBE</small>
                                        </div>
                                        <button type="button" className="profile-link-button" onClick={() => toggleCard('payment')}>
                                            {collapsed.payment ? 'Open' : 'Collapse'}
                                        </button>
                                    </header>
                                    {!collapsed.payment && (
                                        <div className="profile-card-body">
                                            <div className="profile-payment-content">
                                                <div className="profile-payment-section">
                                                    <div style={paymentHeaderStyle}>
                                                        <h4>Saved Payment Methods</h4>
                                                        <button type="button" className="profile-payment-add-button" onClick={() => setIsAddMethodOpen(true)}>
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                                                            </svg>
                                                            Add Method
                                                        </button>
                                                    </div>
                                                    <div className="pm-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {paymentMethods.length > 0 ? paymentMethods.map((pm, idx) => (
                                                            <div key={idx} className="pm-item" style={paymentItemStyle}>
                                                                <span>{pm.type} ({pm.identifier.length > 4 ? `**** ${pm.identifier.slice(-4)}` : pm.identifier})</span>
                                                                {pm.isDefault && <span style={defaultBadgeStyle}>Default</span>}
                                                            </div>
                                                        )) : <p>No payment methods saved.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Add Payment Method Modal */}
            {isAddMethodOpen && (
                <div className="modal-overlay open" onClick={handleCloseAddMethod}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={modalContentStyle}>
                        <h2 className="dashboard-title" style={modalTitleStyle}>
                            Add Payment Method
                        </h2>
                        <form className="create-form" onSubmit={handleAddMethod}>
                            <div className="form-group" style={formGroupStyle}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select Method</label>
                                <select
                                    style={inputStyle}
                                    value={newMethod.type}
                                    onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                                >
                                    {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={formGroupLargeStyle}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    {newMethod.type === 'Telebirr' ? 'Phone Number' : 'Bank Account Number'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={newMethod.type === 'Telebirr' ? 'e.g. 0912345678' : 'Enter account number'}
                                    required
                                    value={newMethod.identifier}
                                    onChange={(e) => setNewMethod({ ...newMethod, identifier: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div className="modal-actions" style={modalActionsStyle}>
                                <button type="button" className="modal-close-button" onClick={handleCloseAddMethod} style={buttonFlex1Style}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-button" style={buttonFlex2Style} disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Method'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Secondary Email Modal */}
            {isAddEmailOpen && (
                <div className="modal-overlay open" onClick={handleCloseAddEmail}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={modalContentStyle}>
                        <h2 className="dashboard-title" style={modalTitleStyle}>
                            Add Secondary Email
                        </h2>
                        <form className="create-form" onSubmit={handleAddEmail}>
                            <div className="form-group" style={formGroupLargeStyle}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. secondary@example.com"
                                    required
                                    value={tempEmail}
                                    onChange={(e) => setTempEmail(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div className="modal-actions" style={modalActionsStyle}>
                                <button type="button" className="modal-close-button" onClick={handleCloseAddEmail} style={buttonFlex1Style}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-button" style={buttonFlex2Style}>
                                    Confirm
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
