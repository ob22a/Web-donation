import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/drawer.css';

const Sidebar = ({ isOpen, onToggleDrawer }) => {
    const { logout, user } = useAuth();

    return (
        <>
            <div className="drawer-overlay" onClick={onToggleDrawer}></div>
            <aside className="profile-drawer" id="profile-drawer" aria-hidden={!isOpen}>
                <button className="drawer-close" type="button" aria-label="Close menu" onClick={onToggleDrawer}>
                    ✕
                </button>
                <div className="drawer-content">
                    <div className="drawer-profile-card">
                        <div className="drawer-avatar">
                            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <h3>{user?.name}</h3>
                        <p>{user?.role === 'donor' ? 'Donor Account' : 'NGO Account'}</p>
                        <button type="button" className="drawer-link">View profile</button>
                    </div>

                    <div className="drawer-links">
                        <NavLink to="/donor-dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={onToggleDrawer}>Dashboard</NavLink>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={onToggleDrawer}>Edit Profile</NavLink>
                        <NavLink to="#" onClick={(e) => e.preventDefault()}>Settings</NavLink>
                        <NavLink to="/donations" className={({ isActive }) => isActive ? 'active' : ''} onClick={onToggleDrawer}>My Donations</NavLink>
                        {/* <Link to="/notifications">Notifications</Link> */}
                        <button type="button">Theme 🌞/🌙</button>
                        {/* <Link to="#">Need help?</Link> */}
                        <button type="button" onClick={() => { logout(); onToggleDrawer(); }}>Logout</button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
