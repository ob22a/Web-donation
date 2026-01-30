import React, { useState, useCallback, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../style/header.css";

/**
 * Header component - main navigation bar.
 *
 * Architecture: Displays different navigation links based on authentication status
 * and user role (donor vs NGO). Includes mobile menu toggle and profile drawer trigger.
 *
 * Responsive behavior: Mobile menu (hamburger) shown when not logged in.
 * Profile icon shown when logged in, opens sidebar drawer.
 */
const Header = ({ onToggleDrawer }) => {
  const { isLoggedIn, user } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  /**
   * Toggle mobile navigation menu.
   *
   * Why useCallback: This function is used in onClick handlers.
   * Memoization prevents unnecessary re-renders if Header is memoized.
   */
  const toggleNav = useCallback(() => {
    setIsNavOpen((prev) => !prev);
  }, []); // No deps: setState function is stable

  // Close nav helper
  const closeNav = useCallback(() => setIsNavOpen(false), []);

  // Close when clicking outside the nav or pressing Escape
  useEffect(() => {
    function handleDocClick(e) {
      if (!isNavOpen) return;
      const navEl = navRef.current;
      const toggleEl = toggleRef.current;
      if (
        navEl &&
        !navEl.contains(e.target) &&
        toggleEl &&
        !toggleEl.contains(e.target)
      ) {
        setIsNavOpen(false);
      }
    }

    function handleKey(e) {
      if (e.key === "Escape" && isNavOpen) setIsNavOpen(false);
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isNavOpen]);

  // Derive user role flags for conditional rendering
  const isDonor = user?.role === "donor";
  const isNGO = user?.role === "ngo";

  // Logo redirects to dashboard for NGOs, home for others
  const logoRedirect = isNGO ? "/dashboard" : "/";

  return (
    <header
      className={`main-header ${isNavOpen ? "nav-open" : ""} ${isLoggedIn ? "logged-in" : ""}`}
    >
      <Link to={logoRedirect} className="brand-title">
        Bright Et
      </Link>
      {!isLoggedIn && (
        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-label={isNavOpen ? "Close navigation" : "Toggle navigation"}
          aria-expanded={isNavOpen}
          onClick={toggleNav}
        >
          {isNavOpen ? "✕" : "☰"}
        </button>
      )}
      <nav
        ref={navRef}
        className={`primary-nav ${isLoggedIn ? "logged-in" : ""}`}
      >
        {!isLoggedIn && (
          <>
            <NavLink
              to="/"
              end
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              Home
            </NavLink>
            <NavLink
              to="/ngos"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              NGOs
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              About
            </NavLink>
            <NavLink
              to="/login"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              Register
            </NavLink>
          </>
        )}

        {isLoggedIn && isNGO && (
          <>
            <NavLink
              to="/dashboard"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/my-campaigns"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              My Campaigns
            </NavLink>
            <NavLink
              to="/donations"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              All Donations
            </NavLink>
          </>
        )}

        {isLoggedIn && isDonor && (
          <>
            <NavLink
              to="/"
              end
              className="tab"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              Home
            </NavLink>
            <NavLink
              to="/ngos"
              className="tab"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              NGOs
            </NavLink>
            <NavLink
              to="/about"
              className="tab"
              onClick={() => {
                if (isNavOpen) closeNav();
              }}
            >
              About
            </NavLink>
          </>
        )}

        {isLoggedIn && (
          <button
            type="button"
            className="profile-trigger user-icon"
            aria-label="Open profile menu"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              marginLeft: "1rem",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={onToggleDrawer}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 496 512"
                height="1.5em"
                width="1.5em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Profile</title>
                <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z"></path>
              </svg>
            )}
          </button>
        )}
      </nav>
      {/* navRef is attached to the <nav> element for outside-click detection */}
    </header>
  );
};

export default Header;
