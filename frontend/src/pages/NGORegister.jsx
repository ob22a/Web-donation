import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { registerUser } from '../apis/auth';
import '../style/register.css';

const NGORegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { loading, error, fetchData } = useFetch();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ngo'
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetchData(registerUser, form);
            if (response.user) {
                login(response.user);
                navigate('/ngo-profile-setup');
            }
        } catch (err) {
            console.error('NGO Registration error:', err);
        }
    };

    return (
        <div className="page-content">
            <div className="auth-section">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2 className="auth-title">NGO Registration</h2>
                    {error && <div className="api-error-banner" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                    <div>
                        <label htmlFor="name">Contact Name</label>
                        <input id="name" name="name" required type="text" placeholder="Full Name" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" required type="email" placeholder="contact@ngo.org" value={form.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" required type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
                    </div>
                    <button type="submit" className="primary-button" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register NGO'}
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
