import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { loginUser } from "../apis/auth";
import "../style/login-style.css";
import "../style/register.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { loading, error, fetchData } = useFetch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchData(loginUser, { email, password });
      if (response.user) {
        login(response.user);
        // Redirect based on role if needed, or default to profile
        if (response.user.role === "ngo") {
          navigate("/dashboard");
        } else {
          navigate("/donor-dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="page-content">
      <div className="auth-section">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2 className="auth-title">Login</h2>

          {error && (
            <div
              className="api-error-banner"
              style={{
                color: "red",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div className="relative-group">
              <input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                    className={`password-icon ${showPassword ? "hidden" : ""}`}
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
                    className={`password-slash ${!showPassword ? "hidden" : ""}`}
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

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-secondary-action">
            <span>Don't have an account?</span>
            <Link to="/register" className="link-button">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
