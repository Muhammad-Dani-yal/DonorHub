import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaTint, FaUserCheck } from "react-icons/fa";
import { deleteDonor, getDonors } from "../../services/firebaseService";
import "../RequestHistory/RequestHistory.css";

function DonorHistory() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState("Fulfilled");
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setError("");
      const data = await getDonors();
      setDonors(data ? Object.entries(data).map(([id, donor]) => ({ id, ...donor })) : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load donor history.");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const history = useMemo(
    () => donors.filter((donor) => donor.approvalStatus === filter),
    [donors, filter]
  );

  const counts = useMemo(() => ({
    Fulfilled: donors.filter((donor) => donor.approvalStatus === "Fulfilled").length,
    Rejected: donors.filter((donor) => donor.approvalStatus === "Rejected").length,
  }), [donors]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this donor history record?")) return;
    await deleteDonor(id);
    loadHistory();
  };

  return (
    <div className="history-page">
      <button className="back-btn" onClick={() => navigate("/admin")}><FaArrowLeft /> Admin dashboard</button>

      <header className="history-header">
        <FaUserCheck />
        <div><h1>Donor records and history</h1><p>Review fulfilled and rejected donor applications separately from blood requests.</p></div>
      </header>

      <div className="history-tabs" role="tablist" aria-label="Donor history status">
        {["Fulfilled", "Rejected"].map((status) => (
          <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>
            {status} <span>{counts[status]}</span>
          </button>
        ))}
      </div>

      {error && <p className="history-error">{error}</p>}

      <div className="history-grid">
        {history.map((donor) => (
          <article className="history-card" key={donor.id}>
            <div className="history-card-top">
              <div className="blood-circle"><FaTint /></div>
              <span className={`history-status ${donor.approvalStatus.toLowerCase()}`}>{donor.approvalStatus}</span>
            </div>
            <h2>{donor.name}</h2>
            <strong className="history-blood">{donor.blood}</strong>
            <p><FaMapMarkerAlt /> {donor.city}</p>
            <p><FaPhoneAlt /> {donor.phone}</p>
            <p className="history-date">Donation date: {donor.date || "Not provided"}</p>
            {donor.rejectionReason && <p className="history-reason"><strong>Reason:</strong> {donor.rejectionReason}</p>}
            <div className="donor-history-health">
              <span>Recent disease: {donor.recentDisease || "Not provided"}</span>
              <span>Allergies: {donor.hasAllergies || "Not provided"}</span>
            </div>
            <button className="history-delete" onClick={() => handleDelete(donor.id)}>Delete record</button>
          </article>
        ))}
      </div>

      {!error && history.length === 0 && (
        <div className="history-empty"><h2>No {filter.toLowerCase()} donor records</h2><p>Donor applications will move here automatically when their status changes.</p></div>
      )}
    </div>
  );
}

export default DonorHistory;
