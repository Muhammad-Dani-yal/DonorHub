import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClipboardCheck, FaHospital, FaMapMarkerAlt, FaPhone, FaTint } from "react-icons/fa";
import { deleteRequest, getRequests } from "../../services/firebaseService";
import "./RequestHistory.css";

function RequestHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Fulfilled");
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setError("");
      const data = await getRequests();
      setRequests(data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load request history.");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const history = useMemo(
    () => requests.filter((item) => item.status === filter),
    [requests, filter]
  );

  const counts = useMemo(() => ({
    Fulfilled: requests.filter((item) => item.status === "Fulfilled").length,
    Rejected: requests.filter((item) => item.status === "Rejected").length,
  }), [requests]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this history record?")) return;
    await deleteRequest(id);
    loadHistory();
  };

  return (
    <div className="history-page">
      <button className="back-btn" onClick={() => navigate("/admin")}>
        <FaArrowLeft /> Admin dashboard
      </button>

      <header className="history-header">
        <FaClipboardCheck />
        <div>
          <h1>Request records and history</h1>
          <p>Review completed and rejected blood requests.</p>
        </div>
      </header>

      <div className="history-tabs" role="tablist" aria-label="Request history status">
        {["Fulfilled", "Rejected"].map((status) => (
          <button
            key={status}
            className={filter === status ? "active" : ""}
            onClick={() => setFilter(status)}
          >
            {status} <span>{counts[status]}</span>
          </button>
        ))}
      </div>

      {error && <p className="history-error">{error}</p>}

      <div className="history-grid">
        {history.map((item) => (
          <article className="history-card" key={item.id}>
            <div className="history-card-top">
              <div className="blood-circle"><FaTint /></div>
              <span className={`history-status ${item.status.toLowerCase()}`}>{item.status}</span>
            </div>
            <h2>{item.patientName}</h2>
            <strong className="history-blood">{item.blood}</strong>
            <p><FaHospital /> {item.hospital}</p>
            <p><FaMapMarkerAlt /> {item.city}</p>
            <p><FaPhone /> {item.phone}</p>
            <p className="history-date">Required date: {item.date || "Not provided"}</p>
            {item.rejectionReason && <p className="history-reason"><strong>Reason:</strong> {item.rejectionReason}</p>}
            <button className="history-delete" onClick={() => handleDelete(item.id)}>
              Delete record
            </button>
          </article>
        ))}
      </div>

      {!error && history.length === 0 && (
        <div className="history-empty">
          <h2>No {filter.toLowerCase()} records</h2>
          <p>Requests will appear here automatically when their status changes.</p>
        </div>
      )}
    </div>
  );
}

export default RequestHistory;
