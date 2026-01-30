import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { registerUser } from '../apis/auth';
import '../style/register.css';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { loading, error, fetchData } = useFetch();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'donor'
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
                navigate('/ngos');
            }
        } catch (err) {
            console.error('Registration error:', err);
        }
    };

    return (
        <div className="page-content">
            <div className="auth-section">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2 className="auth-title">Register</h2>
                    {error && <div className="api-error-banner" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                    <div>
                        <label htmlFor="name">Name</label>
                        <input id="name" name="name" required type="text" placeholder="Your Name" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" required type="email" placeholder="example@gmail.com" value={form.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" required type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
                    </div>
                    <button type="submit" className="primary-button" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
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
