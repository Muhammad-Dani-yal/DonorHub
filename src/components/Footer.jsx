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
            <h2>DonorHub</h2>
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
          <p><FaMapMarkerAlt /> Online Platform</p>
          <p><FaEnvelope /> TeamJawanPakistan@gmail.com</p>
          <p><FaPhoneAlt /> 0303-8623596</p>
        </div>

        <div className="footer-box">
          <h3>Follow</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/Danielle786" target="_blank" rel="noreferrer" aria-label="Facebook profile"><FaFacebookF /></a>
            <a href="https://www.instagram.com/mdn5477/" target="_blank" rel="noreferrer" aria-label="Instagram profile"><FaInstagram /></a>
            <a href="https://x.com/Danielle5477" target="_blank" rel="noreferrer" aria-label="X profile"><FaTwitter /></a>
            <a href="https://www.linkedin.com/in/muhammad-daniyal-21847b2aa/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <hr />
      <p className="copyright">© 2026 DonorHub • Trusted blood coordination platform</p>
    </footer>
  );
}

export default Footer;
