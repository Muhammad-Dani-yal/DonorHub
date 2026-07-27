import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RequestBlood.css";
import {
  FaUser,
  FaTint,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { addRequest } from "../../services/firebaseService";
import { formatCnic, formatPhone } from "../../utils/inputFormatters";

function RequestBlood() {
  const navigate = useNavigate();
  const [request, setRequest] = useState({
    patientName: "", cnic: "", blood: "", hospital: "", city: "", phone: "", date: "", reason: "", urgency: "Normal",
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const value = event.target.name === "cnic"
      ? formatCnic(event.target.value)
      : event.target.name === "phone"
        ? formatPhone(event.target.value)
        : event.target.value;
    setRequest({ ...request, [event.target.name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await addRequest(request);
      setMessage("Your blood request has been submitted successfully. Taking you to the home page...");
      window.setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      setErrorMessage(error.message || "Unable to submit your request. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-page">
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="request-panel">
        <div className="request-hero">
          <p className="eyebrow">Need urgent support?</p>
          <h2>Request blood quickly</h2>
          <p>Share the details of the request so donors and helpers can respond faster.</p>
          <div className="request-tips">
            <div><FaInfoCircle /><span>Include hospital, city, and urgency level.</span></div>
            <div><FaInfoCircle /><span>Clear reasons help donors understand the need fast.</span></div>
          </div>
        </div>

        <div className="request-card">
          <h1>New request</h1>
          <p>Fill out the form below to send a request.</p>
          <form onSubmit={handleSubmit}>
            {message && <p className="request-message success-message"><FaCheckCircle /> {message}</p>}
            {errorMessage && <p className="request-message error-message">{errorMessage}</p>}
            <div className="input-box"><FaUser className="input-icon" /><input type="text" name="patientName" placeholder="Patient Name" value={request.patientName} onChange={handleChange} required /></div>
            <div className="input-box"><FaUser className="input-icon" /><input type="text" name="cnic" placeholder="CNIC: 12345-1234567-1" value={request.cnic} onChange={handleChange} pattern="[0-9]{5}-[0-9]{7}-[0-9]" inputMode="numeric" maxLength="15" required /></div>
            <div className="input-box blood-select-box"><FaTint className="input-icon" /><select name="blood" value={request.blood} onChange={handleChange} required><option value="">Select Blood Group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
            <div className="input-box"><FaHospital className="input-icon" /><input type="text" name="hospital" placeholder="Hospital Name" value={request.hospital} onChange={handleChange} required /></div>
            <div className="input-box"><FaMapMarkerAlt className="input-icon" /><input type="text" name="city" placeholder="City" value={request.city} onChange={handleChange} required /></div>
            <div className="input-box"><FaPhone className="input-icon" /><input type="tel" name="phone" placeholder="0300-1234567" value={request.phone} onChange={handleChange} pattern="[0-9]{4}-[0-9]{7}" inputMode="numeric" maxLength="12" required /></div>
            <div className="input-box"><FaCalendarAlt className="input-icon" /><input type="date" name="date" value={request.date} onChange={handleChange} required /></div>
            <div className="input-box urgency-select-box"><FaInfoCircle className="input-icon" /><select name="urgency" value={request.urgency} onChange={handleChange}><option>Normal</option><option>Urgent</option><option>Critical</option></select></div>
            <textarea name="reason" placeholder="Reason for Blood Request" value={request.reason} onChange={handleChange} required />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting request..." : "Submit Request"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestBlood;
