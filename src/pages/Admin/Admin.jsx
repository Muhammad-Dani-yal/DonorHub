import { useEffect, useState } from "react";
import "./Admin.css";
import { FaUsers, FaTint, FaClipboardList, FaSignOutAlt, FaArrowLeft, FaUserShield, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { addNotification, getUsers, getDonors, getRequests, migrateLegacyDonorScreenings, updateUser } from "../../services/firebaseService";
import { useAuth } from "../../context/useAuth";

function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [donors, setDonors] = useState(0);
  const [requests, setRequests] = useState(0);
  const [history, setHistory] = useState(0);
  const [donorHistory, setDonorHistory] = useState(0);
  const [logoutError, setLogoutError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadError("");
      const userData = await getUsers();
      const donorData = await getDonors();
      const requestData = await getRequests();
      await migrateLegacyDonorScreenings(donorData);

      setUsers(userData ? Object.values(userData) : []);
      const donorList = donorData ? Object.values(donorData) : [];
      setDonors(donorList.filter((item) => item.approvalStatus !== "Rejected" && item.approvalStatus !== "Fulfilled").length);
      setDonorHistory(donorList.filter((item) => item.approvalStatus === "Rejected" || item.approvalStatus === "Fulfilled").length);
      const requestList = requestData ? Object.values(requestData) : [];
      setRequests(requestList.filter((item) => item.status === "Pending" || item.status === "Approved").length);
      setHistory(requestList.filter((item) => item.status === "Fulfilled" || item.status === "Rejected").length);
    } catch {
      setLoadError("Unable to load dashboard data. Please refresh and try again.");
    }
  };

  const handleAccountStatus = async (account) => {
    if (account.role === "admin") return;
    const accountStatus = account.accountStatus === "suspended" ? "active" : "suspended";
    await updateUser(account.uid, { accountStatus });
    await addNotification(account.uid, {
      type: accountStatus === "suspended" ? "account_suspended" : "account_restored",
      title: accountStatus === "suspended" ? "Account suspended" : "Account restored",
      message: accountStatus === "suspended"
        ? "Your DonorHub account has been suspended by an administrator. Contact support for assistance."
        : "Your DonorHub account has been restored. You can use all member features again.",
      relatedId: account.uid,
    });
    loadData();
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
          <p>Monitor the whole DonorHub network from one secure, professional dashboard.</p>
        </div>

        {logoutError && <p className="admin-logout-message">{logoutError}</p>}
        {loadError && <p className="admin-logout-message">{loadError}</p>}

        <div className="admin-container">
          <div className="admin-card">
            <FaUsers className="admin-icon" />
            <h2>{users.length}</h2>
            <p>Total users</p>
          </div>
          <div className="admin-card" onClick={() => navigate("/donors")}>
            <FaTint className="admin-icon" />
            <h2>{donors}</h2>
            <p>Active donors</p>
          </div>
          <div className="admin-card" onClick={() => navigate("/requests")}>
            <FaClipboardList className="admin-icon" />
            <h2>{requests}</h2>
            <p>Active requests</p>
          </div>
          <div className="admin-card" onClick={() => navigate("/admin/request-history")}>
            <FaHistory className="admin-icon" />
            <h2>{history}</h2>
            <p>Request history</p>
          </div>
          <div className="admin-card" onClick={() => navigate("/admin/donor-history")}>
            <FaHistory className="admin-icon" />
            <h2>{donorHistory}</h2>
            <p>Donor history</p>
          </div>
        </div>

        <section className="admin-management">
          <div className="admin-section-heading">
            <h2>User management</h2>
            <p>Review member roles and suspend or restore user access.</p>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.uid}>
                    <td>{account.name || "Unnamed user"}</td>
                    <td>{account.email}</td>
                    <td><span className="role-badge">{account.role || "user"}</span></td>
                    <td>{account.accountStatus || "active"}</td>
                    <td>
                      {account.role === "admin" ? (
                        <span className="protected-label">Protected</span>
                      ) : (
                        <button
                          className={account.accountStatus === "suspended" ? "restore-btn" : "suspend-btn"}
                          onClick={() => handleAccountStatus(account)}
                        >
                          {account.accountStatus === "suspended" ? "Restore" : "Suspend"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="admin-security-note">
            Administrator roles must be assigned through a trusted Firebase Admin environment.
          </p>
        </section>

        <div className="admin-actions">
          <button onClick={() => navigate("/donors")}>Manage donors</button>
          <button onClick={() => navigate("/requests")}>Manage requests</button>
          <button onClick={() => navigate("/admin/request-history")}><FaHistory /> Request history</button>
          <button onClick={() => navigate("/admin/donor-history")}><FaHistory /> Donor history</button>
          <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </div>
      </div>
    </>
  );
}

export default Admin;
