import React from "react";
import "../style/base.css";
import "../style/help.css";

const Help = () => {
  return (
    <main className="dashboard">
      <section className="section">
        <h3>Help & Support</h3>
        <div className="card help-card">
          <h4 className="help-title">Frequently Asked Questions</h4>

          <div className="help-faq">
            <h5>How do I make a donation?</h5>
            <p>
              Visit any NGO or campaign and click Donate. Follow the on-screen
              steps to complete your payment.
            </p>

            <h5>How do I request a receipt?</h5>
            <p>
              After donating, visit your Transaction History in the Donor
              Dashboard and click "Email me receipt" beside a donation.
            </p>

            <h5>How do I update my profile?</h5>
            <p>
              Open your profile from the header menu and click Edit Profile. You
              can update contact and payment details there.
            </p>

            <h5>Need more help?</h5>
            <p>
              If your question isn't answered here, email support at{" "}
              <a href="mailto:support@brightet.org">support@brightet.org</a> or
              use the Contact page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Help;
