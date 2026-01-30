import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { getMyDonations } from "../apis/donations";
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
  const { user } = useAuth();
  const { loading, error, fetchData } = useFetch();
  const [donations, setDonations] = useState([]);

  // Sync preferences from user model
  const [enabled, setEnabled] = useState("Off");
  const [emailReceipts, setEmailReceipts] = useState(user?.preference?.emailReceipts ?? true);
  const [reminder, setReminder] = useState(user?.preference?.ngoUpdates ?? true);
  const [expiringCards, setExpiringCards] = useState(true);

  /**
   * Load donation data from API.
   * 
   * Why useCallback: Used in useEffect. Memoization prevents effect from
   * re-running unnecessarily when component re-renders.
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
  }, [user, loadData]); // Depend on memoized loadData instead of fetchData

  const totalDonated = useMemo(() => {
    return donations.reduce((acc, d) => acc + (d.amount || 0), 0);
  }, [donations]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  return (
    <main className="dashboard">
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
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-green)' }}>{totalDonated.toLocaleString()} <small>ETB</small></div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Contributions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-green)' }}>{donations.length}</div>
          </div>
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="section">
        <h3>Active Campaigns</h3>
        <p className="center-msg" style={{ marginBottom: '1rem' }}>Help make a difference today.</p>
        <Link to="/ngos" className="primary-button" style={{ display: 'inline-block', width: 'auto', padding: '0.6rem 2rem' }}>Browse NGOs</Link>
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
              value={enabled}
              onChange={(e) => setEnabled(e.target.value)}
            >
              <option value="Off">Off</option>
              <option value="On">On</option>
            </select>

            <label>Amount (ETB)</label>
            <input type="text" placeholder="e.g., 200" />

            <label>Frequency</label>
            <select>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <button className="save-btn">Save Recurring</button>
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
                checked={emailReceipts}
                onChange={() => setEmailReceipts(!emailReceipts)}
              />
              Email me receipts
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={reminder}
                onChange={() => setReminder(!reminder)}
              />
              Remind me before recurring charges
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={expiringCards}
                onChange={() => setExpiringCards(!expiringCards)}
              />
              Notify me about expiring cards
            </label>
          </div>

          <button className="save-btn">Save Preferences</button>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="section">
        <h3>Community & Recognition</h3>
        <div className="card green-card">
          {donations.length > 0
            ? "Congratulations! You've unlocked the 'Early Supporter' badge."
            : "Unlock badges and milestones by making your first donation!"}
        </div>
      </section>
    </main>
  );
};

export default DonorDashboard;
