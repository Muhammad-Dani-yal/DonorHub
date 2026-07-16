import { Link } from "react-router-dom";
import "./Navbar.css";
import { FaHeartbeat, FaHome, FaUsers, FaHandHoldingHeart, FaClipboardList, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <FaHeartbeat className="logo-icon" />
        <span>Blood Bank</span>
      </Link>

      <ul className="nav-links">
        <li><Link to="/"><FaHome /> Home</Link></li>
        <li><Link to="/donors"><FaUsers /> Donors</Link></li>
        <li><Link to="/donate"><FaHandHoldingHeart /> Donate</Link></li>
        <li><Link to="/request"><FaHeartbeat /> Request blood</Link></li>
        <li><Link to="/requests"><FaClipboardList /> Requests</Link></li>
      </ul>

      <div className="auth-buttons">
        {user ? (
          <Link to="/dashboard" className="login-btn">Dashboard</Link>
        ) : (
          <>
            <Link to="/login" className="login-btn"><FaSignInAlt /> Login</Link>
            <Link to="/register" className="register-btn"><FaUserPlus /> Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
