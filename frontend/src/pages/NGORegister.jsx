import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext'
import '../style/register.css';

const NGORegister = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        login('ngo');
        navigate('/ngo-profile-setup'); // Leads to filling info
    };

    return (
        <div className="page-content">
            <div className="auth-section">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2 className="auth-title">NGO Registration</h2>
                    <div>
                        <label>NGO Name</label>
                        <input required type="text" placeholder="Official Registered Name" />
                    </div>
                    <div>
                        <label>Email</label>
                        <input required type="email" placeholder="contact@ngo.org" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input required type="password" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="primary-button">
                        Register NGO
                    </button>
                    <div className="auth-secondary-action">
                        <span>Already have an account?</span>
                        <Link to="/login" className="link-button"> Login </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NGORegister;
