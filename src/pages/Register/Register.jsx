import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUser, FaEnvelope, FaLock, FaTint, FaCity, FaPhone } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import "./Register.css";
import { formatPhone } from "../../utils/inputFormatters";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    blood: "",
    city: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const value = e.target.name === "phone" ? formatPhone(e.target.value) : e.target.value;
    setUser({ ...user, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (user.password !== user.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: user.name,
        email: user.email,
        password: user.password,
        blood: user.blood,
        city: user.city,
        phone: user.phone,
      });

      setMessage("Your account has been created successfully. Taking you to your dashboard...");
      window.setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create your account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel-wide">
        <div className="auth-hero">
          <span className="auth-pill">DonorHub</span>
          <h2>Create your account</h2>
          <p>Join a trusted community of donors and helpers making lifesaving support possible.</p>

          <div className="auth-highlights">
            <div>
              <strong>Fast</strong>
              <span>Registration</span>
            </div>
            <div>
              <strong>Safe</strong>
              <span>Verified access</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <h1>Register</h1>
          <p>Help strengthen your community with every donation.</p>

          <form onSubmit={handleSubmit}>
            {message && <p className="form-message success-message"><FaCheckCircle /> {message}</p>}
            {errorMessage && <p className="form-message error-message">{errorMessage}</p>}
            <div className="input-box">
              <FaUser className="input-icon" />
              <input type="text" name="name" placeholder="Full name" value={user.name} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input type="email" name="email" placeholder="Email address" value={user.email} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaLock className="input-icon" />
              <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleChange} minLength="6" required />
            </div>

            <div className="input-box">
              <FaLock className="input-icon" />
              <input type="password" name="confirmPassword" placeholder="Confirm password" value={user.confirmPassword} onChange={handleChange} minLength="6" required />
            </div>

            <div className="input-box">
              <FaTint className="input-icon" />
              <select name="blood" value={user.blood} onChange={handleChange} required>
                <option value="">Select blood group</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
            </div>

            <div className="input-box">
              <FaCity className="input-icon" />
              <input type="text" name="city" placeholder="City" value={user.city} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaPhone className="input-icon" />
              <input type="tel" name="phone" placeholder="0300-1234567" value={user.phone} onChange={handleChange} pattern="[0-9]{4}-[0-9]{7}" inputMode="numeric" maxLength="12" required />
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register"}
            </button>

            <p className="auth-link">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
