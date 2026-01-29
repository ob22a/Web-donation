import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext'
import '../style/register.css';

const Register = () => {
    const navigate = useNavigate();

    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        login('donor');
        navigate('/ngos');
    };

    return (
        <div className="page-content">
            <div className="auth-section">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2 className="auth-title">Register</h2>
                    <div>
                        <label>Name</label>
                        <input required type="text" placeholder="Your Name" />
                    </div>
                    <div>
                        <label>Email</label>
                        <input required type="email" placeholder="example@gmail.com" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input required type="password" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="primary-button">
                        Register
                    </button>
                    <div className="auth-secondary-action">
                        <span>Are you an NGO?</span>
                        <Link to="/ngo-register" className="link-button">
                            Register as an NGO
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
