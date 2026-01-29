import React from "react";
import "../style/about.css";

const features = [
  "Verified NGO profiles with real stories and photos, shared with consent, so donors see exactly who they are helping.",
  "Blockchain-powered public ledger logs every donation and its impact (e.g., “Donation A purchased ‘this’ for Child B”).",
  "Multi-language support (Amharic & Oromo) for wider accessibility.",
  "Integration with Tele birr/CBE and SMS OTP for secure, fraud-free donations.",
  "Automated donation process to help NGOs reach and support more people in need."
];

const About = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>About Ethiopian NGO Digital Donations</h1>
        <p>
          Many Ethiopian NGOs, like Macedonia, face challenges collecting
          digital donations due to security concerns and accessibility barriers,
          often relying on cash or insecure third-party tools. Our platform is
          designed to build trust, ensure security, and provide localized
          accessibility for all donors and organizations.
        </p>
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default About;
