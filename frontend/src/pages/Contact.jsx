import React from "react";
import "../style/contact.css";

const contacts = [
  { label: "Email:", type: "link", value: "info@ethio-donations.org", href: "mailto:info@ethio-donations.org" },
  { label: "Phone:", type: "link", value: "+251 911287392", href: "tel:+251911287392" },
  { label: "Address:", type: "text", value: "Addis Ababa, Ethiopia" }
];

const Contact = () => {
  return (
    <section className="contact-section">
      <div className="contact-header">
        <h1 className="contact-title">Contact Information</h1>
        <p className="contact-subtitle">
          For inquiries, support, or partnership opportunities, please contact us:
        </p>
      </div>

      <div className="contact-card">
        {contacts.map((item, index) => (
          <div className="contact-row" key={index}>
            <span className="label">{item.label}</span>
            {item.type === "link" ? (
              <a className="value-link" href={item.href}>{item.value}</a>
            ) : (
              <span className="value-text">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Contact;
