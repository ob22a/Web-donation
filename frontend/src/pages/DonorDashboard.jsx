import { useState } from "react";
import { Link } from "react-router-dom";
import "../style/DonorDashboard.css";

const DonorDashboard = () => {
  // ===== STATE =====
  const [enabled, setEnabled] = useState("Off");

  const [emailReceipts, setEmailReceipts] = useState(true);
  const [reminder, setReminder] = useState(true);
  const [expiringCards, setExpiringCards] = useState(true);

  return (
    <main className="dashboard">
      {/* PROFILE */}
      <section className="profile-card">
        <div className="circle">
          <span>LA</span>
        </div>
        <div>
          <h2>Welcome, Leoul Abel!</h2>
          <p>
            You haven’t donated yet —{" "}
            <strong>start by exploring campaigns below.</strong>
          </p>
        </div>
        <button className="edit-btn">Edit Profile</button>
      </section>

      {/* OVERVIEW */}
      <section className="section">
        <h3>Donation Overview</h3>
        <div className="card green-card">
          Once you donate, you’ll see your donation history here.
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="section">
        <h3>Active Campaigns</h3>
        <p className="center-msg">No active campaigns at the moment.</p>
      </section>

      {/* IMPACT */}
      <section className="section">
        <h3>Impact & Transparency</h3>
        <div className="card green-card">
          Your receipts and impact updates will appear here after your first
          donation.
        </div>
      </section>

      {/* SAVED CAMPAIGNS */}
      <section className="section">
        <h3>Saved Campaigns</h3>
        <div className="card green-card">
          Bookmark campaigns you care about to find them here.
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="section">
        <h3>Notifications</h3>
        <div className="card">No updates yet.</div>
      </section>

      {/* PAYMENT */}
      <section className="section">
        <h3>Payment & Settings</h3>
        <div className="card error-card">Failed to load payment methods</div>
      </section>

      {/* SAVED PAYMENTS */}
      <section className="section">
        <h4>Saved Payment Methods</h4>
        <div className="card green-card">
          You haven’t added any payment methods yet.
          <Link to="/add-payment" className="add-link">
            + Add Method
          </Link>
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

      {/* TRANSACTIONS */}
      <section className="section">
        <h3>Transaction History</h3>
        <div className="card">
          <p>No transactions yet.</p>
          <button className="download-btn">
            Download Receipts (PDF)
          </button>
        </div>
      </section>

      {/* SECURITY */}
      <section className="section">
        <h3>Notifications & Security</h3>
        <div className="card">
          <div className="checklist">
            <label>
              <input
                type="checkbox"
                checked={emailReceipts}
                onChange={() => setEmailReceipts(!emailReceipts)}
              />
              Email me receipts
            </label>

            <label>
              <input
                type="checkbox"
                checked={reminder}
                onChange={() => setReminder(!reminder)}
              />
              Remind me before recurring charges
            </label>

            <label>
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
          Unlock badges and milestones by making your first donation!
        </div>
      </section>
    </main>
  );
};

export default DonorDashboard;
