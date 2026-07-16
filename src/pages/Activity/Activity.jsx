import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaSearch, FaUserCheck, FaHandHoldingHeart } from "react-icons/fa";
import "./Activity.css";

function Activity() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const activities = useMemo(
    () => [
      {
        id: 1,
        title: "Urgent blood request opened",
        detail: "City hospital requested O- units for emergency surgery.",
        time: "10 min ago",
        type: "request",
      },
      {
        id: 2,
        title: "New donor matched",
        detail: "A donor from your city is available for a compatible donation.",
        time: "35 min ago",
        type: "donor",
      },
      {
        id: 3,
        title: "Donation confirmed",
        detail: "A recent donation entry was updated and confirmed.",
        time: "1 hr ago",
        type: "donation",
      },
      {
        id: 4,
        title: "Volunteer reminder sent",
        detail: "A reminder was sent to nearby donors for a scheduled drive.",
        time: "3 hrs ago",
        type: "system",
      },
    ],
    []
  );

  const filteredActivities = activities.filter((item) => {
    const haystack = `${item.title} ${item.detail} ${item.type}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="activity-page">
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="activity-shell">
        <div className="activity-header">
          <div>
            <p className="eyebrow">Live activity</p>
            <h1>Recent updates</h1>
            <p>Monitor important donor and request activity in one place.</p>
          </div>
          <div className="activity-badge">
            <FaHeartbeat />
            <span>Blood Bank activity</span>
          </div>
        </div>

        <div className="activity-toolbar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search activity"
            />
          </div>
          <div className="toolbar-chip">Updated just now</div>
        </div>

        <div className="activity-grid">
          {filteredActivities.map((activity) => (
            <div className="activity-card" key={activity.id}>
              <div className="activity-icon">
                {activity.type === "request" ? <FaHandHoldingHeart /> : <FaUserCheck />}
              </div>
              <div>
                <h3>{activity.title}</h3>
                <p>{activity.detail}</p>
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <p className="empty-state">No matching activity was found.</p>
        )}
      </div>
    </div>
  );
}

export default Activity;
