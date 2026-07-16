import { useEffect, useState } from "react";
import "./Admin.css";
import { FaUsers, FaTint, FaClipboardList, FaSignOutAlt, FaArrowLeft, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUsers, getDonors, getRequests } from "../../services/firebaseService";
import { useAuth } from "../../context/AuthContext";

function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [users, setUsers] = useState(0);
  const [donors, setDonors] = useState(0);
  const [requests, setRequests] = useState(0);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUsers();
      const donorData = await getDonors();
      const requestData = await getRequests();

      setUsers(userData ? Object.keys(userData).length : 0);
      setDonors(donorData ? Object.keys(donorData).length : 0);
      setRequests(requestData ? Object.keys(requestData).length : 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut();
      sessionStorage.setItem(
        "logoutMessage",
        "You have been logged out safely. Thank you for helping manage the blood donor community. See you again soon!"
      );
      navigate("/login");
    } catch (error) {
      setLogoutError(error.message || "Unable to log out right now. Please try again.");
    }
  };

  return (
    <>
      <div className="admin-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="admin-header">
          <FaUserShield className="admin-main-icon" />
          <h1>Admin dashboard</h1>
          <p>Monitor the whole Blood Bank network from one secure, professional dashboard.</p>
        </div>

        {logoutError && <p className="admin-logout-message">{logoutError}</p>}

        <div className="admin-container">
          <div className="admin-card">
            <FaUsers className="admin-icon" />
            <h2>{users}</h2>
            <p>Total users</p>
          </div>
          <div className="admin-card" onClick={() => navigate("/donors")}>
            <FaTint className="admin-icon" />
            <h2>{donors}</h2>
            <p>Total donors</p>
          </div>
          <div className="admin-card" onClick={() => navigate("/requests")}>
            <FaClipboardList className="admin-icon" />
            <h2>{requests}</h2>
            <p>Total requests</p>
          </div>
        </div>

        <div className="admin-actions">
          <button onClick={() => navigate("/donors")}>Manage donors</button>
          <button onClick={() => navigate("/requests")}>Manage requests</button>
          <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </div>
      </div>
    </>
  );
}

export default Admin;
