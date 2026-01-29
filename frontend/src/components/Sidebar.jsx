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
                        <NavLink to="/profile" className="drawer-avatar" onClick={onToggleDrawer} style={{ textDecoration: 'none', overflow: 'hidden' }}>
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.name?.split(' ').map(n => n[0]).join('') || 'U'
                            )}
                        </NavLink>
                        <h3>
                            <NavLink to="/profile" onClick={onToggleDrawer} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {user?.name}
                            </NavLink>
                        </h3>
                        <p>{user?.role === 'donor' ? 'Donor Account' : 'NGO Account'}</p>
                        <NavLink to="/profile" className="drawer-link" onClick={onToggleDrawer}>View profile</NavLink>
                    </div>

                    <div className="drawer-links">
                        <NavLink to={user?.role === 'ngo' ? '/dashboard' : '/donor-dashboard'} className={({ isActive }) => isActive ? 'active' : ''} onClick={onToggleDrawer}>Dashboard</NavLink>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={onToggleDrawer}>Edit Profile</NavLink>
                        {/* <NavLink to="#" onClick={(e) => e.preventDefault()}>Settings</NavLink> */}
                        {/* <NavLink to="#" className={({ isActive }) => isActive ? 'active' : ''} onClick={onToggleDrawer}>My Donations</NavLink> */}
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
