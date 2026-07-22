import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { FaBars, FaHeartbeat, FaHome, FaUsers, FaHandHoldingHeart, FaClipboardList, FaSignInAlt, FaUserPlus, FaUserShield, FaHistory, FaTimes, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const linkClass = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <FaHeartbeat className="logo-icon" />
        <span>DonorHub</span>
      </Link>

      <button className="mobile-menu-btn" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <FaTimes /> : <FaBars />}</button>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><Link className={linkClass("/")} onClick={closeMenu} to="/"><FaHome /> Home</Link></li>
        <li><Link className={linkClass("/donors")} onClick={closeMenu} to="/donors"><FaUsers /> Donors</Link></li>
        {user?.role !== "admin" && <li><Link className={linkClass("/donate")} onClick={closeMenu} to="/donate"><FaHandHoldingHeart /> Donate</Link></li>}
        {user?.role !== "admin" && <li><Link className={linkClass("/request")} onClick={closeMenu} to="/request"><FaHeartbeat /> Request blood</Link></li>}
        <li><Link className={linkClass("/requests")} onClick={closeMenu} to="/requests"><FaClipboardList /> Requests</Link></li>
        {user?.role === "user" && <li><Link className={linkClass("/profile")} onClick={closeMenu} to="/profile"><FaUserCircle /> Profile</Link></li>}
        {user?.role === "user" && <li><Link className={linkClass("/dashboard")} onClick={closeMenu} to="/dashboard"><FaUserShield /> Dashboard</Link></li>}
        {user?.role === "admin" && <li><Link className={linkClass("/admin")} onClick={closeMenu} to="/admin"><FaUserShield /> Admin</Link></li>}
        {user?.role === "admin" && <li><Link className={linkClass("/admin/request-history")} onClick={closeMenu} to="/admin/request-history"><FaHistory /> Request history</Link></li>}
        {user?.role === "admin" && <li><Link className={linkClass("/admin/donor-history")} onClick={closeMenu} to="/admin/donor-history"><FaHistory /> Donor history</Link></li>}
      </ul>

      <div className="auth-buttons">
        <ThemeToggle />
        <NotificationBell />
        {user ? (
          <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="login-btn">
            {user.role === "admin" ? "Admin dashboard" : "Dashboard"}
          </Link>
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
