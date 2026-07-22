import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaEnvelope, FaMapMarkerAlt, FaPhone, FaTint, FaUser, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import { resendVerificationEmail } from "../../services/firebaseService";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    blood: user?.blood || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile(form);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const sendVerification = async () => {
    setMessage("");
    setError("");
    try {
      await resendVerificationEmail();
      setMessage("Verification email sent. Check your inbox.");
    } catch (verificationError) {
      setError(verificationError.message || "Unable to send verification email.");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <button className="back-btn" onClick={() => navigate("/dashboard")}><FaArrowLeft /> Dashboard</button>
        <header className="profile-header"><FaUserCircle /><div><h1>My profile</h1><p>Keep your contact and donor details accurate.</p></div></header>

        <div className="profile-status-grid">
          <div><span>Role</span><strong>{user?.role || "user"}</strong></div>
          <div><span>Account</span><strong>{user?.accountStatus || "active"}</strong></div>
          <div><span>Email</span><strong>{user?.emailVerified ? "Verified" : "Not verified"}</strong></div>
        </div>

        {!user?.emailVerified && <button className="verification-btn" onClick={sendVerification}><FaEnvelope /> Resend verification email</button>}
        {message && <p className="profile-message success-message"><FaCheckCircle /> {message}</p>}
        {error && <p className="profile-message error-message">{error}</p>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <label><span>Full name</span><div className="input-group"><FaUser /><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div></label>
          <label><span>Email address</span><div className="input-group"><FaEnvelope /><input value={user?.email || ""} disabled /></div></label>
          <label><span>Phone number</span><div className="input-group"><FaPhone /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div></label>
          <label><span>City</span><div className="input-group"><FaMapMarkerAlt /><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div></label>
          <label><span>Blood group</span><div className="input-group"><FaTint /><select value={form.blood} onChange={(event) => setForm({ ...form, blood: event.target.value })}><option value="">Select blood group</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group}>{group}</option>)}</select></div></label>
          <button className="profile-save-btn" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
