import { useState } from "react";
import "./Donate.css";
import { addDonor } from "../../services/firebaseService";
import { useNavigate } from "react-router-dom";
import { formatCnic, formatPhone } from "../../utils/inputFormatters";

import {
  FaUser,
  FaTint,
  FaVenusMars,
  FaCity,
  FaPhoneAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaAllergies,
  FaShieldAlt,
} from "react-icons/fa";

function Donate() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donor, setDonor] = useState({
    name: "",
    age: "",
    blood: "",
    gender: "",
    city: "",
    phone: "",
    cnic: "",
    date: "",
    address: "",
    availability: "Available",
    recentDisease: "No",
    recentDiseaseDetails: "",
    hasAllergies: "No",
    allergyDetails: "",
    medicalNotes: "",
  });

  const handleChange = (e) => {
    const value = e.target.name === "cnic"
      ? formatCnic(e.target.value)
      : e.target.name === "phone"
        ? formatPhone(e.target.value)
        : e.target.value;
    setDonor({
      ...donor,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await addDonor(donor);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to register as a donor. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="donate-page">
      <div className="donate-shell">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft /> Dashboard
        </button>

        <div className="donate-header">
          <div className="donate-header-icon"><FaTint /></div>
          <div>
            <span className="donate-eyebrow">Donor application</span>
            <h1>Register as a blood donor</h1>
            <p>Provide accurate information. An administrator will review your application before it becomes public.</p>
          </div>
        </div>

        <form className="donate-professional-form" onSubmit={handleSubmit}>
          {errorMessage && <p className="donate-error-message">{errorMessage}</p>}

          <section className="donate-form-section">
            <div className="section-heading"><FaUser /><div><h2>Personal information</h2><p>Basic identity and blood group details.</p></div></div>
            <div className="donate-form-grid">
              <label><span>Full name</span><div className="input-group"><FaUser className="input-icon" /><input type="text" name="name" placeholder="Enter your full name" value={donor.name} onChange={handleChange} required /></div></label>
              <label><span>Age</span><div className="input-group"><FaUser className="input-icon" /><input type="number" name="age" placeholder="18–60" value={donor.age} onChange={handleChange} min="18" max="60" required /></div></label>
              <label><span>Blood group</span><div className="input-group"><FaTint className="input-icon" /><select name="blood" value={donor.blood} onChange={handleChange} required><option value="">Select blood group</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group}>{group}</option>)}</select></div></label>
              <label><span>Gender</span><div className="input-group"><FaVenusMars className="input-icon" /><select name="gender" value={donor.gender} onChange={handleChange} required><option value="">Select gender</option><option>Male</option><option>Female</option><option>Prefer not to say</option></select></div></label>
            </div>
          </section>

          <section className="donate-form-section">
            <div className="section-heading"><FaMapMarkerAlt /><div><h2>Contact and availability</h2><p>How the DonorHub team can reach you.</p></div></div>
            <div className="donate-form-grid">
              <label><span>City</span><div className="input-group"><FaCity className="input-icon" /><input type="text" name="city" placeholder="Your city" value={donor.city} onChange={handleChange} required /></div></label>
              <label><span>Phone number</span><div className="input-group"><FaPhoneAlt className="input-icon" /><input type="tel" name="phone" placeholder="0300-1234567" value={donor.phone} onChange={handleChange} pattern="[0-9]{4}-[0-9]{7}" inputMode="numeric" maxLength="12" required /></div></label>
              <label><span>CNIC</span><div className="input-group"><FaUser className="input-icon" /><input type="text" name="cnic" placeholder="12345-1234567-1" value={donor.cnic} onChange={handleChange} pattern="[0-9]{5}-[0-9]{7}-[0-9]" inputMode="numeric" maxLength="15" required /></div></label>
              <label><span>Available donation date</span><div className="input-group"><FaCalendarAlt className="input-icon" /><input type="date" name="date" value={donor.date} onChange={handleChange} required /></div></label>
              <label className="full-width"><span>Complete address</span><div className="input-group textarea-group"><FaMapMarkerAlt className="input-icon" /><textarea name="address" placeholder="Street, area, and nearby landmark" value={donor.address} onChange={handleChange} rows="3" required /></div></label>
            </div>
          </section>

          <section className="donate-form-section health-section">
            <div className="section-heading"><FaNotesMedical /><div><h2>Health screening</h2><p>This information helps administrators review donation suitability.</p></div></div>
            <div className="health-notice"><FaShieldAlt /><span>Your health information is used only for donor screening and administration.</span></div>
            <div className="donate-form-grid">
              <label><span>Any disease or significant illness in the past 6 months?</span><div className="input-group"><FaNotesMedical className="input-icon" /><select name="recentDisease" value={donor.recentDisease} onChange={handleChange} required><option>No</option><option>Yes</option></select></div></label>
              <label><span>Do you have any allergies?</span><div className="input-group"><FaAllergies className="input-icon" /><select name="hasAllergies" value={donor.hasAllergies} onChange={handleChange} required><option>No</option><option>Yes</option></select></div></label>
              {donor.recentDisease === "Yes" && <label className="full-width"><span>Disease or illness details</span><div className="input-group textarea-group"><FaNotesMedical className="input-icon" /><textarea name="recentDiseaseDetails" placeholder="Describe the condition, treatment, and recovery date" value={donor.recentDiseaseDetails} onChange={handleChange} rows="3" required /></div></label>}
              {donor.hasAllergies === "Yes" && <label className="full-width"><span>Allergy details</span><div className="input-group textarea-group"><FaAllergies className="input-icon" /><textarea name="allergyDetails" placeholder="List known food, medicine, or environmental allergies" value={donor.allergyDetails} onChange={handleChange} rows="3" required /></div></label>}
              <label className="full-width"><span>Medical notes (optional)</span><div className="input-group textarea-group"><FaNotesMedical className="input-icon" /><textarea name="medicalNotes" placeholder="Any other relevant medical information" value={donor.medicalNotes} onChange={handleChange} rows="3" /></div></label>
            </div>
          </section>

          <div className="donate-submit-row">
            <p>By submitting, you confirm that the information provided is accurate.</p>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? "Submitting application..." : "Submit for admin review"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Donate;
