import React, { useState, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/header.css';

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
    const { isLoggedIn, logout, user } = useAuth();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();

    /**
     * Toggle mobile navigation menu.
     * 
     * Why useCallback: This function is used in onClick handlers.
     * Memoization prevents unnecessary re-renders if Header is memoized.
     */
    const toggleNav = useCallback(() => {
        setIsNavOpen(prev => !prev);
    }, []); // No deps: setState function is stable

    /**
     * Handle logout and redirect to login page.
     * 
     * Why useCallback: Used in onClick handler. Memoization ensures
     * stable reference across re-renders.
     */
    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]); // Depend on logout and navigate

    // Derive user role flags for conditional rendering
    const isDonor = user?.role === 'donor';
    const isNGO = user?.role === 'ngo';

    // Logo redirects to dashboard for NGOs, home for others
    const logoRedirect = isNGO ? '/dashboard' : '/';

    return (
        <header className={`main-header ${isNavOpen ? 'nav-open' : ''} ${isLoggedIn ? 'logged-in' : ''}`}>
            <Link to={logoRedirect} className="brand-title">Bright Et</Link>
            {!isLoggedIn && (
                <button
                    className="nav-toggle"
                    aria-label="Toggle navigation"
                    aria-expanded={isNavOpen}
                    onClick={toggleNav}
                >
                    ☰
                </button>
            )}
            <nav className={`primary-nav ${isLoggedIn ? 'logged-in' : ''}`}>
                {!isLoggedIn && (
                    <>
                        <NavLink to="/" end>Home</NavLink>
                        <NavLink to="/ngos">NGOs</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register">Register</NavLink>
                    </>
                )}

                {isLoggedIn && isNGO && (
                    <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/my-campaigns">My Campaigns</NavLink>
                        <NavLink to="/donations">All Donations</NavLink>
                    </>
                )}

                {isLoggedIn && isDonor && (
                    <>
                        <NavLink to="/" end className="tab">Home</NavLink>
                        <NavLink to="/ngos" className="tab">NGOs</NavLink>
                        <NavLink to="/about" className="tab">About</NavLink>
                    </>
                )}

                {isLoggedIn && (
                    <button
                        type="button"
                        className="profile-trigger user-icon"
                        aria-label="Open profile menu"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            marginLeft: '1rem',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={onToggleDrawer}
                    >
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                                <title>Profile</title>
                                <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z"></path>
                            </svg>
                        )}
                    </button>
                )}
            </nav>
        </header>
    );
};

export default Header;
