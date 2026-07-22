import "./Dashboard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTint, FaArrowLeft, FaHandHoldingHeart, FaUsers, FaClipboardList, FaSignOutAlt, FaHeartbeat, FaSearch, FaHistory, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";

function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut();
      sessionStorage.setItem(
        "logoutMessage",
        "You have been logged out safely. Thank you for supporting our blood donor community — we hope to see you again soon!"
      );
      navigate("/login");
    } catch (error) {
      setLogoutError(error.message || "Unable to log out right now. Please try again.");
    }
  };

  const today = new Date();
  const dayLabel = today.toLocaleDateString("en", { weekday: "long" });
  const dateLabel = today.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });

  const actions = [
    {
      title: "My profile",
      route: "/profile",
      description: "Update your contact and donor details.",
      icon: FaUserCircle,
    },
    {
      title: "Donate blood",
      route: "/donate",
      description: "Share a life-saving gift in a few steps.",
      icon: FaTint,
    },
    {
      title: "Request blood",
      route: "/request",
      description: "Post urgent needs for patients quickly.",
      icon: FaHandHoldingHeart,
    },
    {
      title: "View donors",
      route: "/donors",
      description: "Find compatible supporters nearby.",
      icon: FaUsers,
    },
    {
      title: "My requests",
      route: "/requests",
      description: "Track your requests plus approved community needs.",
      icon: FaClipboardList,
    },
    {
      title: "View activity",
      route: "/activity",
      description: "Review recent donor and request events.",
      icon: FaHistory,
    },
  ];

  const filteredActions = actions.filter((action) => {
    const searchText = `${action.title} ${action.description}`.toLowerCase();
    return searchText.includes(search.toLowerCase());
  });

  const insights = [
    {
      label: "Today",
      value: `${dayLabel}, ${dateLabel}`,
    },
    {
      label: "Profile",
      value: user?.blood ? `Blood group ${user.blood}` : "Complete your profile",
    },
    {
      label: "Support",
      value: user?.role === "admin" ? "You can manage requests and donors" : "You can donate or request blood anytime",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
          <div className="dashboard-badge">
            <FaHeartbeat />
            <span>DonorHub dashboard</span>
          </div>
        </div>

        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{user?.name || "Member"}</h1>
            <p>Coordinate donations, requests, and donor support from one calm, modern workspace.</p>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">Community impact</span>
            <strong>Lives saved daily</strong>
          </div>
        </div>

        {logoutError && <p className="logout-message">{logoutError}</p>}

        <div className="dashboard-tools">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dashboard actions"
            />
          </div>
          <div className="status-pill">Live • {dayLabel}</div>
        </div>

        <div className="dashboard-insights">
          {insights.map((item) => (
            <div className="insight-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {filteredActions.map((action) => {
            const Icon = action.icon;

            return (
              <div className="dashboard-card" key={action.title} onClick={() => navigate(action.route)}>
                <Icon className="dashboard-icon" />
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            );
          })}

          <div className="dashboard-card logout" onClick={handleLogout}>
            <FaSignOutAlt className="dashboard-icon" />
            <h3>Logout</h3>
            <p>Securely leave your session.</p>
          </div>
        </div>

        {filteredActions.length === 0 && (
          <p className="empty-state">No matching actions found. Try another keyword.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
