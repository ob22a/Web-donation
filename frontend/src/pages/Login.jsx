import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { loginUser } from '../apis/auth';
import '../style/login-style.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { loading, error, fetchData } = useFetch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetchData(loginUser, { email, password });
            if (response.user) {
                login(response.user);
                // Redirect based on role if needed, or default to profile
                if (response.user.role === 'ngo') {
                    navigate('/dashboard');
                } else {
                    navigate('/profile');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <div className="page-center">
            <div className="login-form-container">
                <h2 className="form-title">Login</h2>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="relative-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="form-input pr-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title="Password visibility toggle"
                            >
                                <div className="relative">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`password-icon ${showPassword ? 'hidden' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c0 5-4 9-10 9S2 17 2 12s4-9 10-9 10 4 10 9z"
                                        />
                                    </svg>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`password-slash ${!showPassword ? 'hidden' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 3l18 18"
                                        />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="cta-container mt-4 mb-2">
                        <span className="cta-text"> Create new account? </span>
                        <Link to="/register" className="register-btn">Register</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
