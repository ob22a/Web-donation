import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { getMyDonations, emailDonationReceipt } from "../apis/donations";
import "../style/DonorDashboard.css";

function SavedRecurringList({ user, donations, onCancel }) {
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
      <div style={{ padding: "1.5rem", textAlign: "center", color: "#6b7280" }}>
        You have no saved recurring donations.
        <div style={{ marginTop: "1rem" }}>
          <Link
            to="/campaigns"
            className="primary-button"
            style={{ display: "inline-block", padding: "0.5rem 1rem" }}
          >
            Start a Recurring Donation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      {items.map((r) => (
        <div
          key={r._id || r.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 0",
            borderBottom: "1px solid #eef2f0",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "var(--primary-green)" }}>
              {r.campaignTitle ||
                r.campaignId?.title ||
                r.title ||
                "Saved Recurring"}
            </div>
            <div style={{ color: "#6b7280" }}>
              {r.amount || r.value
                ? `${(r.amount || r.value).toLocaleString()} ETB`
                : "Amount not set"}{" "}
              • {r.frequency || r.freq || "—"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Next charge:{" "}
              {r.nextCharge ? new Date(r.nextCharge).toLocaleDateString() : "—"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="save-btn"
              onClick={() => handleCancel(r._id || r.id)}
            >
              Cancel
            </button>
            <Link
              to={`/recurring/${r._id || r.id}`}
              className="primary-button"
              style={{ padding: "0.4rem 0.75rem" }}
            >
              Manage
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

const DonorDashboard = () => {
  const { user } = useAuth();
  const { loading, error, fetchData } = useFetch();
  const [donations, setDonations] = useState([]);

  // Sync preferences from user model
  const [enabled, setEnabled] = useState("Off");
  const [emailReceipts, setEmailReceipts] = useState(
    user?.preference?.emailReceipts ?? true,
  );
  const [reminder, setReminder] = useState(
    user?.preference?.ngoUpdates ?? true,
  );
  const [expiringCards, setExpiringCards] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchData(getMyDonations);
        if (response.donations) {
          setDonations(response.donations);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    if (user) loadData();
  }, [user, fetchData]);

  const totalDonated = useMemo(() => {
    return donations.reduce((acc, d) => acc + (d.amount || 0), 0);
  }, [donations]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <main className="dashboard">
      {error && (
        <div
          className="api-error-banner"
          style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      {/* PROFILE */}
      <section className="profile-card">
        <div className="circle" style={{ overflow: "hidden" }}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <h2>Welcome, {user?.name || "Valued Donor"}!</h2>
          <p>
            {donations.length > 0
              ? `You've made ${donations.length} impact${donations.length > 1 ? "s" : ""} across the platform!`
              : "You haven’t donated yet — start by exploring campaigns below."}
          </p>
        </div>
        <Link to="/profile" className="edit-btn">
          Edit Profile
        </Link>
      </section>

      {/* OVERVIEW */}
      <section className="section">
        <h3>Donation Overview</h3>
        <div
          className="card green-card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              Total Donated
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--primary-green)",
              }}
            >
              {totalDonated.toLocaleString()} <small>ETB</small>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              Contributions
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--primary-green)",
              }}
            >
              {donations.length}
            </div>
          </div>
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="section">
        <h3>Active Campaigns</h3>
        <p className="center-msg" style={{ marginBottom: "1rem" }}>
          Help make a difference today.
        </p>
        <Link
          to="/ngos"
          className="primary-button"
          style={{
            display: "inline-block",
            width: "auto",
            padding: "0.6rem 2rem",
          }}
        >
          Browse NGOs
        </Link>
      </section>

      {/* IMPACT & TRANSACTIONS */}
      <section className="section">
        <h3>Transaction History</h3>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {donations.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    background: "#f9fafb",
                    borderBottom: "1px solid #eef2f0",
                  }}
                >
                  <tr>
                    <th style={{ padding: "1rem" }}>NGO</th>
                    <th style={{ padding: "1rem" }}>Campaign</th>
                    <th style={{ padding: "1rem" }}>Amount</th>
                    <th style={{ padding: "1rem" }}>Date</th>
                    <th style={{ padding: "1rem" }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr
                      key={d._id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "1rem" }}>{d.campaignId?.ngo?.name || '—'}</td>
                      <td style={{ padding: "1rem" }}>{d.campaignId?.title || "Unknown Campaign"}</td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {d.amount.toLocaleString()} ETB
                      </td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {d.receiptEmailSent ? (
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>
                            Emailed {d.receiptSentAt ? new Date(d.receiptSentAt).toLocaleDateString() : ''}
                          </span>
                        ) : (
                          <button
                            className="save-btn"
                            onClick={async () => {
                              try {
                                const res = await emailDonationReceipt(d._id);
                                if (res && res.donation) {
                                  setDonations((prev) => prev.map((p) => (p._id === d._id ? { ...p, receiptEmailSent: true, receiptSentAt: res.donation.receiptSentAt || new Date().toISOString() } : p)));
                                } else {
                                  // optimistic fallback
                                  setDonations((prev) => prev.map((p) => (p._id === d._id ? { ...p, receiptEmailSent: true, receiptSentAt: new Date().toISOString() } : p)));
                                }
                              } catch (err) {
                                console.error('Email receipt failed', err);
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
            <div
              style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}
            >
              No transactions yet. Receipts will appear here.
            </div>
          )}
          {donations.length > 0 && (
            <div style={{ padding: "1rem", textAlign: "right" }}>
              <button className="download-btn">
                Download All Receipts (PDF)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RECURRING DONATIONS (show saved recurring donations) */}
      <section className="section">
        <h3>Saved Recurring Donations</h3>
        <div className="card green-card">
          <SavedRecurringList
            user={user}
            donations={donations}
            onCancel={(id) => {
              // optimistic local removal; server call can be added later
              setDonations((prev) => prev.filter((d) => d._id !== id));
            }}
          />
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
