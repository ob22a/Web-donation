import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
    const { isLoggedIn, user } = useAuth();

    if (isLoggedIn) {
        if (user?.role === 'ngo') return <Navigate to="/dashboard" replace />;
        return <Navigate to="/donor-dashboard" replace />;
    }

    return (
        <div className="container">
            <h2 className="header-text">Home Page</h2>
            <div className="section-card">
                <p>Welcome to Bright Et. This is the landing area for guest users.</p>
                <button className="primary-button" style={{ width: 'auto', padding: '0.5rem 2rem', marginTop: '1rem' }}>
                    Explore NGOs
                </button>
            </div>
        </div>
    );
};

export default Home;
