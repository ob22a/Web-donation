import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { getMyDonations, emailDonationReceipt } from "../apis/donations";
import { getCampaigns } from "../apis/campaigns";
import { getNGOs } from "../apis/ngo";
import { updateProfile } from "../apis/profile";
import Toast from "../components/Toast";
import "../style/DonorDashboard.css";
import "../style/base.css"; // Import base styles for consistency
function SavedRecurringList({ user, donations, onCancel, loading }) {
  const initial =
    (user && user.recurringDonations) ||
    donations.filter((d) => d.recurring) ||
    [];
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const src =
      (user && user.recurringDonations) ||
      donations.filter((d) => d.recurring) ||
      [];
    setItems(src);
  }, [user, donations]);

  const handleCancel = async (id) => {
    // optimistic UI
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    if (onCancel) onCancel(id);

    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to cancel recurring plan", data);
      }
    } catch (err) {
      console.error("Error cancelling recurring plan:", err);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="saved-recurring-empty">
        You have no saved recurring donations.
        <div className="saved-recurring-empty-cta">
          <Link to="/campaigns" className="btn primary-button">
            Start a Recurring Donation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-recurring-list">
      {items.map((r) => (
        <div key={r._id || r.id} className="saved-recurring-item">
          <div className="saved-recurring-content">
            <div className="saved-recurring-title">
              {r.campaignTitle ||
                r.campaignId?.title ||
                r.title ||
                "Saved Recurring"}
            </div>
            <div className="saved-recurring-details">
              {r.amount || r.value
                ? `${(r.amount || r.value).toLocaleString()} ETB`
                : "Amount not set"}{" "}
              • {r.frequency || r.freq || "—"}
            </div>
            <div className="saved-recurring-next-charge">
              Next charge:{" "}
              {r.nextCharge ? new Date(r.nextCharge).toLocaleDateString() : "—"}
            </div>
          </div>
          <div className="saved-recurring-actions">
            <button
              className="btn primary-button"
              onClick={() => handleCancel(r._id || r.id)}
              disabled={loading}
            >
              Cancel
            </button>
            <Link
              to={`/recurring/${r._id || r.id}`}
              className="btn primary-button"
            >
              Manage
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
function CampaignCard({ campaign }) {
  const progress = campaign.raisedAmount
    ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
    : 0;

  return (
    <div className="card dashboard-campaign-card">
      <div className="card-image-wrapper">
        {campaign.ngo?.logo && (
          <img
            src={campaign.ngo.logo}
            className="ngo-logo"
            alt={`${campaign.ngo.name} logo`}
          />
        )}
        {campaign.coverImage ? (
          <img
            src={campaign.coverImage}
            className="card-main-image"
            alt={campaign.title}
          />
        ) : (
          <div className="dashboard-campaign-image-placeholder">
            {campaign.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="card-body">
        <h3 className="dashboard-campaign-title">{campaign.title}</h3>
        {campaign.ngo?.name && (
          <p className="dashboard-campaign-ngo">by {campaign.ngo.name}</p>
        )}
        <div className="dashboard-campaign-progress">
          <div className="dashboard-campaign-progress-bar">
            <div
              className="dashboard-campaign-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="dashboard-campaign-progress-stats">
            <span>
              ETB {campaign.raisedAmount?.toLocaleString() || 0} raised
            </span>
            <span>Goal: ETB {campaign.goalAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
        <Link
          to={`/campaigns/${campaign._id}`}
          className="btn primary-button full-width"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}
function NGOCard({ ngo }) {
  return (
    <div className="card ngo-card">
      <div className="card-image-wrapper">
        {ngo.logo && (
          <img src={ngo.logo} className="ngo-logo" alt={`${ngo.name} logo`} />
        )}
        {ngo.bannerImage ? (
          <img
            src={ngo.bannerImage}
            className="card-main-image"
            alt={ngo.name}
          />
        ) : (
          <div className="dashboard-ngo-image-placeholder">
            {ngo.name?.charAt(0) || "N"}
          </div>
        )}
      </div>
      <div className="card-body">
        <h3>{ngo.name}</h3>
        {ngo.description && (
          <p className="dashboard-ngo-description">
            {ngo.description.length > 100
              ? `${ngo.description.substring(0, 100)}...`
              : ngo.description}
          </p>
        )}
        <div className="dashboard-ngo-stats">
          {ngo.campaignsCount > 0 && (
            <span className="dashboard-ngo-stat">
              {ngo.campaignsCount} active campaign
              {ngo.campaignsCount !== 1 ? "s" : ""}
            </span>
          )}
          {ngo.totalRaised > 0 && (
            <span className="dashboard-ngo-stat">
              ETB {ngo.totalRaised.toLocaleString()} raised
            </span>
          )}
        </div>
        <Link to={`/ngos/${ngo._id}`} className="btn primary-button full-width">
          View NGO
        </Link>
      </div>
    </div>
  );
}
const DonorDashboard = () => {
  const { user, login } = useAuth();
  const { loading, error, fetchData } = useFetch();
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Recurring donation settings
  const [recurring, setRecurring] = useState({
    enabled: user?.recurringDonation?.enabled ?? false,
    amount: user?.recurringDonation?.amount ?? 0,
    frequency: user?.recurringDonation?.frequency ?? "monthly",
  });
  useEffect(() => {
    if (user) {
      setRecurring({
        enabled: user.recurringDonation?.enabled ?? false,
        amount: user.recurringDonation?.amount ?? 0,
        frequency: user.recurringDonation?.frequency ?? "monthly",
      });
    }
  }, [user]);
  const loadDashboardData = useCallback(async () => {
    try {
      // Load donations
      const donationsResponse = await fetchData(getMyDonations);
      if (donationsResponse.donations) {
        setDonations(donationsResponse.donations);
      }

      // Load active campaigns
      const campaignsResponse = await fetchData(getCampaigns);
      if (campaignsResponse.campaigns) {
        // Filter to show only active campaigns (you might want to add a status field)
        const activeCampaigns = campaignsResponse.campaigns.filter(
          (campaign) => campaign.status === "active" || !campaign.status, // Show all if no status field
        );
        // Show only a few campaigns (e.g., 3)
        setCampaigns(activeCampaigns.slice(0, 3));
      }

      // Load NGOs
      const ngosResponse = await fetchData(getNGOs);
      if (ngosResponse.ngos) {
        // Get NGOs the user has donated to
        const donatedNgoIds = [
          ...new Set(
            donationsResponse.donations
              ?.map((d) => d.campaignId?.ngo?._id)
              .filter((id) => id),
          ),
        ];

        // Sort NGOs: ones the user has donated to first, then others
        const sortedNGOs = ngosResponse.ngos.sort((a, b) => {
          const aDonated = donatedNgoIds.includes(a._id);
          const bDonated = donatedNgoIds.includes(b._id);
          if (aDonated && !bDonated) return -1;
          if (!aDonated && bDonated) return 1;
          return 0;
        });

        // Show only a few NGOs (e.g., 3)
        setNgos(sortedNGOs.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  }, [fetchData]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, loadDashboardData]);
  const totalDonated = useMemo(() => {
    return donations.reduce((acc, d) => acc + (d.amount || 0), 0);
  }, [donations]);
  const handleSaveRecurring = async () => {
    try {
      const response = await fetchData(updateProfile, {
        recurringDonation: recurring,
      });
      if (response.user) {
        login(response.user);
        setToastMessage("Recurring donation settings saved!");
        setShowToast(true);
      }
    } catch (err) {
      console.error("Failed to save recurring settings:", err);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <main className="dashboard">
      {showToast && <Toast message={toastMessage} onClose={handleCloseToast} />}
      {error && <div className="api-error-banner dashboard-error">{error}</div>}

      {/* PROFILE */}
      <section className="profile-card">
        <div className="circle dashboard-avatar">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Avatar"
              className="dashboard-avatar-img"
            />
          ) : (
            <span className="dashboard-avatar-initials">{initials}</span>
          )}
        </div>
        <div className="dashboard-profile-info">
          <h2>Welcome, {user?.name || "Valued Donor"}!</h2>
          <p className="dashboard-profile-subtitle">
            {donations.length > 0
              ? `You've made ${donations.length} impact${donations.length > 1 ? "s" : ""} across the platform!`
              : "You haven't donated yet — start by exploring campaigns below."}
          </p>
        </div>
        <Link to="/profile" className="btn primary-button">
          Edit Profile
        </Link>
      </section>

      {/* OVERVIEW */}
      <section className="section">
        <h3>Donation Overview</h3>
        <div className="card green-card dashboard-overview-grid">
          <div className="dashboard-stat">
            <div className="dashboard-stat-label">Total Donated</div>
            <div className="dashboard-stat-value">
              {(user?.totalDonated || totalDonated).toLocaleString()}{" "}
              <small>ETB</small>
            </div>
          </div>
          <div className="dashboard-stat">
            <div className="dashboard-stat-label">Contributions</div>
            <div className="dashboard-stat-value">
              {user?.campaignsSupportedCount || donations.length}
            </div>
          </div>
          <div className="dashboard-stat">
            <div className="dashboard-stat-label">NGOs Supported</div>
            <div className="dashboard-stat-value">
              {
                [
                  ...new Set(
                    donations
                      .map((d) => d.campaignId?.ngo?._id)
                      .filter((id) => id),
                  ),
                ].length
              }
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE CAMPAIGNS SECTION */}
      <section className="section">
        <div className="dashboard-section-header">
          <h3>Active Campaigns</h3>
        </div>
        {campaigns.length > 0 ? (
          <>
            <div className="grid-container dashboard-campaigns-grid">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
            <div className="dashboard-section-footer">
              <Link to="/campaigns" className="btn primary-button">
                Browse Active Campaigns
              </Link>
            </div>
          </>
        ) : (
          <div className="card dashboard-empty-section">
            <p className="dashboard-empty-message">
              No active campaigns found.
            </p>
            <Link to="/campaigns" className="btn primary-button">
              Browse Campaigns
            </Link>
          </div>
        )}
      </section>

      {/* NGOs SECTION */}
      <section className="section">
        <div className="dashboard-section-header">
          <h3>{donations.length > 0 ? "Your NGOs" : "Featured NGOs"}</h3>
        </div>
        {ngos.length > 0 ? (
          <>
            <div className="grid-container dashboard-ngos-grid">
              {ngos.map((ngo) => (
                <NGOCard key={ngo._id} ngo={ngo} />
              ))}
            </div>
            <div className="dashboard-section-footer">
              <Link to="/ngos" className="btn primary-button">
                {donations.length > 0 ? "Browse All NGOs" : "Browse NGOs"}
              </Link>
            </div>
          </>
        ) : (
          <div className="card dashboard-empty-section">
            <p className="dashboard-empty-message">
              {donations.length > 0
                ? "You haven't donated to any NGOs yet."
                : "No NGOs found."}
            </p>
            <Link to="/ngos" className="btn primary-button">
              Browse NGOs
            </Link>
          </div>
        )}
      </section>

      {/* TRANSACTION HISTORY */}
      <section className="section">
        <h3>Transaction History</h3>
        <div className="card dashboard-transactions-card">
          {donations.length > 0 ? (
            <div className="dashboard-transactions-table-container">
              <table className="dashboard-transactions-table">
                <thead className="dashboard-transactions-thead">
                  <tr>
                    <th>NGO</th>
                    <th>Campaign</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody className="dashboard-transactions-tbody">
                  {donations.map((d) => (
                    <tr key={d._id} className="dashboard-transactions-row">
                      <td className="dashboard-transactions-cell">
                        {d.campaignId?.ngo?.name || "—"}
                      </td>
                      <td className="dashboard-transactions-cell">
                        {d.campaignId?.title || "Unknown Campaign"}
                      </td>
                      <td className="dashboard-transactions-cell dashboard-transactions-amount">
                        {d.amount.toLocaleString()} ETB
                      </td>
                      <td className="dashboard-transactions-cell dashboard-transactions-date">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="dashboard-transactions-cell">
                        {d.receiptEmailSent ? (
                          <span className="dashboard-receipt-sent">
                            Emailed{" "}
                            {d.receiptSentAt
                              ? new Date(d.receiptSentAt).toLocaleDateString()
                              : ""}
                          </span>
                        ) : (
                          <button
                            className="btn primary-button dashboard-receipt-btn"
                            onClick={async () => {
                              try {
                                const res = await emailDonationReceipt(d._id);
                                if (res && res.donation) {
                                  setDonations((prev) =>
                                    prev.map((p) =>
                                      p._id === d._id
                                        ? {
                                            ...p,
                                            receiptEmailSent: true,
                                            receiptSentAt:
                                              res.donation.receiptSentAt ||
                                              new Date().toISOString(),
                                          }
                                        : p,
                                    ),
                                  );
                                } else {
                                  // optimistic fallback
                                  setDonations((prev) =>
                                    prev.map((p) =>
                                      p._id === d._id
                                        ? {
                                            ...p,
                                            receiptEmailSent: true,
                                            receiptSentAt:
                                              new Date().toISOString(),
                                          }
                                        : p,
                                    ),
                                  );
                                }
                              } catch (err) {
                                console.error("Email receipt failed", err);
                              }
                            }}
                          >
                            Email me receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-no-transactions">
              No transactions yet. Receipts will appear here.
            </div>
          )}
          {donations.length > 0 && (
            <div className="dashboard-download-receipts">
              <button className="btn btn-outline">
                Download All Receipts (PDF)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Recurring donation settings removed per request */}

      {/* SAVED RECURRING DONATIONS */}
      <section className="section">
        <h3>Active Recurring Donations</h3>
        <div className="card green-card">
          <SavedRecurringList
            user={user}
            donations={donations}
            onCancel={(id) => {
              setDonations((prev) => prev.filter((d) => d._id !== id));
            }}
            loading={loading}
          />
        </div>
      </section>

      {/* Notifications & Security removed per request */}

      {/* COMMUNITY & BADGES */}
      <section className="section">
        <h3>Community & Recognition</h3>
        <div className="card green-card">
          {user?.badges?.length > 0 ? (
            <div className="dashboard-badges-container">
              {user.badges.map((badge, idx) => (
                <span key={idx} className="dashboard-badge">
                  🏆 {badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="dashboard-no-badges">
              Unlock badges and milestones by making your first donation!
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default DonorDashboard;
