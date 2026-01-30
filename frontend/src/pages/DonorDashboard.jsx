import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { getMyDonations } from "../apis/donations";
import { updateProfile } from "../apis/profile";
import Toast from "../components/Toast";
import "../style/DonorDashboard.css";

/**
 * Donor Dashboard - displays donation history and statistics for authenticated donor.
 * 
 * Architecture: Shows total donated amount, donation history, and preference settings.
 * 
 * Performance optimizations:
 * - useMemo for calculated total
 * - useCallback for data loading function
 * - Proper useEffect dependencies
 */
const DonorDashboard = () => {
  const { user, login } = useAuth();
  const { loading, error, fetchData } = useFetch();
  const [donations, setDonations] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // ---- Data Integration: Sync with real backend user model ----
  // Why: Replaces static frontend-only state with persistent data from the API.

  // Recurring donation state
  const [recurring, setRecurring] = useState({
    enabled: user?.recurringDonation?.enabled ?? false,
    amount: user?.recurringDonation?.amount ?? 0,
    frequency: user?.recurringDonation?.frequency ?? "monthly"
  });

  // Notification preferences
  const [prefs, setPrefs] = useState({
    emailReceipts: user?.preference?.emailReceipts ?? true,
    ngoUpdates: user?.preference?.ngoUpdates ?? true,
    notifyExpiringCards: user?.preference?.notifyExpiringCards ?? true
  });

  /**
   * Sync local state when user object updates from AuthContext.
   */
  useEffect(() => {
    if (user) {
      setRecurring({
        enabled: user.recurringDonation?.enabled ?? false,
        amount: user.recurringDonation?.amount ?? 0,
        frequency: user.recurringDonation?.frequency ?? "monthly"
      });
      setPrefs({
        emailReceipts: user.preference?.emailReceipts ?? true,
        ngoUpdates: user.preference?.ngoUpdates ?? true,
        notifyExpiringCards: user.preference?.notifyExpiringCards ?? true
      });
    }
  }, [user]);

  /**
   * Load donation data from API.
   */
  const loadData = useCallback(async () => {
    try {
      const response = await fetchData(getMyDonations);
      if (response.donations) {
        setDonations(response.donations);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [fetchData]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  /**
   * Calculate total donated locally for immediate feedback.
   * Note: This matches the user.totalDonated field from backend.
   */
  const totalDonated = useMemo(() => {
    return donations.reduce((acc, d) => acc + (d.amount || 0), 0);
  }, [donations]);

  /**
   * Data Integration: Save recurring donation settings to backend.
   * Replaces the previous non-functional static button.
   */
  const handleSaveRecurring = async () => {
    try {
      const response = await fetchData(updateProfile, { recurringDonation: recurring });
      if (response.user) {
        login(response.user); // Update global auth state
        setToastMessage("Recurring donation settings saved!");
        setShowToast(true);
      }
    } catch (err) {
      console.error('Failed to save recurring settings:', err);
    }
  };

  /**
   * Data Integration: Save notification preferences to backend.
   * Replaces the previous non-functional static button.
   */
  const handleSavePreferences = async () => {
    try {
      const response = await fetchData(updateProfile, { preference: prefs });
      if (response.user) {
        login(response.user); // Update global auth state
        setToastMessage("Notification preferences saved!");
        setShowToast(true);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  return (
    <main className="dashboard">
      {showToast && <Toast message={toastMessage} onClose={handleCloseToast} />}
      {error && <div className="api-error-banner" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

      {/* PROFILE */}
      <section className="profile-card">
        <div className="circle" style={{ overflow: 'hidden' }}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <h2>Welcome, {user?.name || 'Valued Donor'}!</h2>
          <p>
            {donations.length > 0
              ? `You've made ${donations.length} impact${donations.length > 1 ? 's' : ''} across the platform!`
              : "You haven’t donated yet — start by exploring campaigns below."}
          </p>
        </div>
        <Link to="/profile" className="edit-btn">Edit Profile</Link>
      </section>

      {/* OVERVIEW */}
      <section className="section">
        <h3>Donation Overview</h3>
        <div className="card green-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Donated</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-green)' }}>{(user?.totalDonated || totalDonated).toLocaleString()} <small>ETB</small></div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Contributions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-green)' }}>{user?.campaignsSupportedCount || donations.length}</div>
          </div>
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="section">
        <h3>Active Campaigns</h3>
        <p className="center-msg" style={{ marginBottom: '1rem' }}>Help make a difference today.</p>
        <div style={{ textAlign: 'center' }}>
          <Link to="/ngos" className="primary-button" style={{ display: 'inline-block', width: 'auto', padding: '0.6rem 2rem' }}>Browse NGOs</Link>
        </div>
      </section>

      {/* IMPACT & TRANSACTIONS */}
      <section className="section">
        <h3>Transaction History</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {donations.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #eef2f0' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Campaign</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem' }}>{d.campaignId?.title || 'Unknown Campaign'}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{d.amount.toLocaleString()} ETB</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
              No transactions yet. Receipts will appear here.
            </div>
          )}
          {donations.length > 0 && (
            <div style={{ padding: '1rem', textAlign: 'right' }}>
              <button className="download-btn">Download All Receipts (PDF)</button>
            </div>
          )}
        </div>
      </section>

      {/* RECURRING DONATIONS */}
      <section className="section">
        <h3>Recurring Donations</h3>
        <div className="card green-card">
          <div className="form-row">
            <label>Enable</label>
            <select
              value={recurring.enabled ? "On" : "Off"}
              onChange={(e) => setRecurring({ ...recurring, enabled: e.target.value === "On" })}
            >
              <option value="Off">Off</option>
              <option value="On">On</option>
            </select>

            <label>Amount (ETB)</label>
            <input
              type="number"
              placeholder="e.g., 200"
              value={recurring.amount}
              onChange={(e) => setRecurring({ ...recurring, amount: Number(e.target.value) })}
            />

            <label>Frequency</label>
            <select
              value={recurring.frequency}
              onChange={(e) => setRecurring({ ...recurring, frequency: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button className="save-btn" onClick={handleSaveRecurring} disabled={loading}>
            {loading ? "Saving..." : "Save Recurring"}
          </button>
        </div>
      </section>

      {/* SECURITY */}
      <section className="section">
        <h3>Notifications & Security</h3>
        <div className="card">
          <div className="checklist">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.emailReceipts}
                onChange={() => setPrefs({ ...prefs, emailReceipts: !prefs.emailReceipts })}
              />
              Email me receipts
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.ngoUpdates}
                onChange={() => setPrefs({ ...prefs, ngoUpdates: !prefs.ngoUpdates })}
              />
              Remind me before recurring charges
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.notifyExpiringCards}
                onChange={() => setPrefs({ ...prefs, notifyExpiringCards: !prefs.notifyExpiringCards })}
              />
              Notify me about expiring cards
            </label>
          </div>

          <button className="save-btn" onClick={handleSavePreferences} disabled={loading}>
            {loading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="section">
        <h3>Community & Recognition</h3>
        <div className="card green-card">
          {user?.badges?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {user.badges.map((badge, idx) => (
                <span key={idx} style={{ background: 'var(--primary-green)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  🏆 {badge}
                </span>
              ))}
            </div>
          ) : (
            "Unlock badges and milestones by making your first donation!"
          )}
        </div>
      </section>
    </main>
  );
};

export default DonorDashboard;
