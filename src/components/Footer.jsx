import "./Footer.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaHeartbeat } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-box">
          <div className="footer-logo">
            <FaHeartbeat className="footer-logo-icon" />
            <h2>Blood Bank</h2>
          </div>
          <p>Trusted blood coordination for donors, hospitals, and communities.</p>
        </div>

        <div className="footer-box">
          <h3>Quick links</h3>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/donors">Donors</Link>
          <Link to="/donate">Donate</Link>
          <Link to="/request">Request blood</Link>
        </div>

        <div className="footer-box">
          <h3>Contact</h3>
          <p><FaMapMarkerAlt /> Seattle, WA</p>
          <p><FaEnvelope /> hello@bloodbank.app</p>
          <p><FaPhoneAlt /> +1 800 555 0148</p>
        </div>

        <div className="footer-box">
          <h3>Follow</h3>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <hr />
      <p className="copyright">© 2026 Blood Bank • Trusted blood coordination platform</p>
    </footer>
  );
}

export default Footer;