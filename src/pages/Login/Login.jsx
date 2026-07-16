import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [user, setUser] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(() => {
    const logoutMessage = sessionStorage.getItem("logoutMessage");
    sessionStorage.removeItem("logoutMessage");
    return logoutMessage || "";
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(user.email, user.password);
      setMessage("Sign in successful. Taking you to your dashboard...");
      window.setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign in. Please check your details and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-hero">
          <span className="auth-pill">Blood Bank</span>
          <h2>Welcome back</h2>
          <p>Access your donor dashboard and stay connected to urgent requests in seconds.</p>

          <div className="auth-highlights">
            <div>
              <strong>24/7</strong>
              <span>Support</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Updates</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <h1>Sign in</h1>
          <p>Continue managing your Blood Bank account.</p>

          <form onSubmit={handleSubmit}>
            {message && <p className="form-message success-message"><FaCheckCircle /> {message}</p>}
            {errorMessage && <p className="form-message error-message">{errorMessage}</p>}
            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={user.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Log in"}
            </button>

            <p className="auth-link">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
