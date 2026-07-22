import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaSearch, FaUserCheck, FaHandHoldingHeart } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import { getDonors, getNotifications, getRequests } from "../../services/firebaseService";
import "./Activity.css";

function Activity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const [donorData, requestData, notificationData] = await Promise.all([
          getDonors(),
          getRequests(),
          getNotifications(user.uid),
        ]);

        const donorActivities = Object.values(donorData)
          .filter((item) => item.userId === user.uid)
          .map((item) => ({ id: `donor-${item.id}`, title: `Donor application: ${item.approvalStatus || "Approved"}`, detail: `${item.blood} donor application in ${item.city}.`, createdAt: item.createdAt, type: "donor" }));
        const requestActivities = Object.values(requestData)
          .filter((item) => item.userId === user.uid)
          .map((item) => ({ id: `request-${item.id}`, title: `Blood request: ${item.status}`, detail: `${item.blood} requested for ${item.patientName} at ${item.hospital}.`, createdAt: item.createdAt, type: "request" }));
        const notificationActivities = Object.values(notificationData).map((item) => ({ id: `notification-${item.id}`, title: item.title, detail: item.message, createdAt: item.createdAt, type: item.type }));

        setActivities([...notificationActivities, ...requestActivities, ...donorActivities].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } catch (loadError) {
        setError(loadError.message || "Unable to load your activity.");
      } finally {
        setLoading(false);
      }
    };
    loadActivity();
  }, [user.uid]);

  const filteredActivities = useMemo(() => activities.filter((item) => {
    const text = `${item.title} ${item.detail} ${item.type}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [activities, query]);

  const timeLabel = (timestamp) => timestamp
    ? new Date(timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "Date unavailable";

  return (
    <div className="activity-page">
      <div className="back-btn-container"><button className="back-btn" onClick={() => navigate(-1)}>← Back</button></div>
      <div className="activity-shell">
        <div className="activity-header">
          <div><p className="eyebrow">Your activity</p><h1>Account timeline</h1><p>Real donor, request, and account updates from Firebase.</p></div>
          <div className="activity-badge"><FaHeartbeat /><span>DonorHub activity</span></div>
        </div>
        <div className="activity-toolbar">
          <div className="search-box"><FaSearch className="search-icon" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity" /></div>
          <div className="toolbar-chip">{activities.length} updates</div>
        </div>
        {loading && <p className="empty-state">Loading your activity...</p>}
        {error && <p className="empty-state">{error}</p>}
        {!loading && !error && <div className="activity-grid">
          {filteredActivities.map((activity) => (
            <div className="activity-card" key={activity.id}>
              <div className="activity-icon">{activity.type.includes("request") ? <FaHandHoldingHeart /> : <FaUserCheck />}</div>
              <div><h3>{activity.title}</h3><p>{activity.detail}</p><span>{timeLabel(activity.createdAt)}</span></div>
            </div>
          ))}
        </div>}
        {!loading && !error && filteredActivities.length === 0 && <p className="empty-state">No matching activity was found.</p>}
      </div>
    </div>
  );
}

export default Activity;
