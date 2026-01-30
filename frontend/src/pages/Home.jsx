import heroImg from "../assets/images/hero-image.jpg";
import mekedoniaLogo from "../assets/images/mekedonia-logo.jpg";
import wiseLogo from "../assets/images/wise-logo.jpg";
import hopeLogo from "../assets/images/hope-logo.png";
import wiseImg from "../assets/images/wise-image.jpg";
import hopeImg from "../assets/images/hope-image.jpg";
import campaignImg from "../assets/images/default-campaign.png";
import { Link } from "react-router-dom";

import "../style/base.css";
import "../style/landing.css";
import "../style/responsive.css";

export default function Landing() {
  return (
    <div className="page-landing">
      <div className="main-wrapper">
        <main>
          {/* HERO */}
          <section className="hero-section">
            <div className="hero-card">
              <div className="hero-image">
                <img src={heroImg} alt="Ethiopian NGO Hero" />
              </div>
              <div className="hero-content">
                <h1>
                  Discover verified profiles with real stories and photos.
                </h1>
                <p>
                  Every donation is securely tracked on blockchain for full
                  transparency.
                  <br />
                  Give confidently and see your impact in real time.
                </p>
                <Link to="/ngos" className="btn primary-button">
                  Find NGOs to support
                </Link>
              </div>
            </div>
          </section>

          {/* FEATURED NGOs */}
          <section className="featured-section">
            <h2>Featured NGOs</h2>

            <div className="grid-container">
              <NGOCard
                logo={mekedoniaLogo}
                image={heroImg}
                title="Macedonia Humanitarian Association"
                text="Supporting homeless and vulnerable communities in Addis Ababa."
              />
              <NGOCard
                logo={wiseLogo}
                image={wiseImg}
                title="Organization for Women in Self Employment (WISE)"
                text="Empowering women through training and microfinance initiatives."
              />
              <NGOCard
                logo={hopeLogo}
                image={hopeImg}
                title="Hope for Children Organization"
                text="Improving child welfare through education and health programs."
              />
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link to="/ngos" className="btn primary-button">
                See All NGOs
              </Link>
            </div>
          </section>

          {/* WHY DONATE */}
          <section className="why-donate-section">
            <h2>Why Donate Here?</h2>
            <div className="grid-container">
              <Feature icon="✅" title="Verified NGOs" />
              <Feature icon="🔒" title="Secure Donations" />
              <Feature icon="🌍" title="Transparent Impact" />
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="testimonials-section">
            <h2>Testimonials & Success Stories</h2>
            <div className="grid-container">
              <Testimonial
                text="I was able to support a local NGO and see exactly how my donation was used."
                author="Alemu T."
                role="Donor"
              />
              <Testimonial
                text="Our organization received much-needed funds and showed real progress."
                author="Selamawit G."
                role="NGO Representative"
              />
              <Testimonial
                text="I can track my impact in real time. My money makes a difference."
                author="Mekdes A."
                role="Donor"
              />
            </div>
          </section>

          {/* CTA */}
          <section className="cta-section">
            <h2>Ready to make a difference?</h2>
            <p>Give confidently and see your impact in real time.</p>
            <div className="cta-buttons">
              <Link to="/ngos" className="btn primary-button">
                Find NGOs
              </Link>
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            </div>
          </section>

          {/* CAMPAIGNS */}
          <section className="campaigns-section">
            <h2>Active Campaigns</h2>
            <div className="campaign-card">
              <img src={campaignImg} alt="Campaign" />
              <div className="campaign-content">
                <h3>Clean Water for Rural Schools</h3>
                <p>
                  Help us build clean water infrastructure for three primary
                  schools.
                </p>
                <div className="campaign-meta">Target: 500,000 ETB</div>
                <Link to="#" className="btn primary-button">
                  Donate
                </Link>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link to="/campaigns" className="btn primary-button">
                See Other Campaigns
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* 🔹 Small reusable components */

function NGOCard({ logo, image, title, text }) {
  return (
    <div className="card ngo-card">
      <div className="card-image-wrapper">
        <img src={logo} className="ngo-logo" alt="Logo" />
        <img src={image} className="card-main-image" alt={title} />
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        <p>{text}</p>
        <button className="btn primary-button full-width">Donate</button>
      </div>
    </div>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="feature-box">
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      <p>Trusted, secure, and fully transparent donations.</p>
    </div>
  );
}

function Testimonial({ text, author, role }) {
  return (
    <div className="testimonial-card">
      <p>“{text}”</p>
      <span className="author">{author}</span>
      <span className="role">{role}</span>
    </div>
  );
}
