import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Requests.css";
import {
  FaTint,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaAddressCard,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaAlignLeft,
} from "react-icons/fa";

import {
  getRequests,
  updateRequest,
  deleteRequest,
  addNotification,
  addStatusHistory,
  getDonors,
} from "../../services/firebaseService";
import { useAuth } from "../../context/useAuth";
import { setRequests as setRequestsState } from "../../features/requests/requestsSlice";
import { formatCnic } from "../../utils/inputFormatters";

function Requests() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const requests = useSelector((state) => state.requests.items);
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {

    try {
    const [data, donorData] = await Promise.all([getRequests(), getDonors()]);

    if (data) {

      const arr = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      dispatch(setRequestsState(arr));

    } else {

      dispatch(setRequestsState([]));

    }
    setDonors(Object.values(donorData || {}));
    } catch (loadError) {
      setError(loadError.message || "Unable to load requests.");
    }

  }, [dispatch]);

  const notifyRequestOwner = async (item, type, title, message) => {
    if (!item.userId) return;
    await addNotification(item.userId, {
      type,
      title,
      message,
      relatedId: item.id,
    });
  };

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (item) => {

    await updateRequest(item.id, {
      status: "Approved",
    });
    await addStatusHistory("requests", item.id, "Approved");

    await notifyRequestOwner(
      item,
      "request_approved",
      "Blood request approved",
      `Your ${item.blood} blood request for ${item.patientName} has been accepted and approved.`
    );

    loadRequests();

  };

  const handleReject = async (item) => {
    const reason = window.prompt("Why is the requested blood unavailable?", "No compatible donor is currently available.");
    if (reason === null) return;

    await updateRequest(item.id, {
      status: "Rejected",
      rejectionReason: reason,
    });
    await addStatusHistory("requests", item.id, "Rejected", { note: reason });

    await notifyRequestOwner(
      item,
      "request_rejected",
      "Requested blood unavailable",
      `The requested ${item.blood} blood for ${item.patientName} is unavailable. Reason: ${reason}`
    );

    loadRequests();

  };

  const handleDelete = async (item) => {

    if(window.confirm("Delete this request?")){

      await deleteRequest(item.id);

      if (isAdmin && item.userId && item.userId !== user?.uid) {
        await addNotification(item.userId, {
          type: "request_removed",
          title: "Blood request removed",
          message: `Your ${item.blood} blood request for ${item.patientName} was removed by an administrator.`,
          relatedId: item.id,
        });
      }

      loadRequests();

    }

  };

  const handleFulfill = async (item) => {
    await updateRequest(item.id, { status: "Fulfilled" });
    if (isAdmin) {
      await addStatusHistory("requests", item.id, "Fulfilled");
      await notifyRequestOwner(
        item,
        "request_fulfilled",
        "Blood request fulfilled",
        `Your ${item.blood} blood request for ${item.patientName} has been marked as fulfilled.`
      );
    }
    loadRequests();
  };

  const visibleRequests = requests.filter((item) => item.status !== "Rejected");

  const compatibleGroups = {
    "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"], "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"], "O-": ["O-"],
  };

  const matchingDonors = (item) => donors.filter((donor) =>
    (donor.approvalStatus === "Approved" || !donor.approvalStatus) &&
    donor.availability !== "Unavailable" &&
    compatibleGroups[item.blood]?.includes(donor.blood) &&
    donor.city?.toLowerCase() === item.city?.toLowerCase()
  );

  const notifyMatchingDonors = async (item) => {
    const matches = matchingDonors(item);
    await Promise.all(matches.filter((donor) => donor.userId).map((donor) => addNotification(donor.userId, {
      type: "donor_match",
      title: "Compatible blood request nearby",
      message: `${item.blood} blood is needed for ${item.patientName} at ${item.hospital}, ${item.city}.`,
      relatedId: item.id,
    })));
  };

  return (

    <div className="requests-page">
      <div className="back-btn-container">
  <button
    className="back-btn"
    onClick={() => navigate(-1)}
  >
    ← Back
  </button>
</div>

      <h1>Blood Requests</h1>

      <p>{isAdmin ? "Manage pending and approved blood requests." : "View approved requests and track your pending requests."}</p>
      {error && <p className="requests-error">{error}</p>}

      <div className={`requests-container ${isAdmin ? "admin-request-grid" : ""}`}>

        {visibleRequests.length > 0 ? (

          visibleRequests.map((item) => (

            <div
              className={`request-box ${isAdmin ? "admin-request-card" : ""}`}
              key={item.id}
            >

              <div className="blood-circle">

                <FaTint />

              </div>

              <h2>{item.patientName}</h2>

              <span className="blood-group">

                {item.blood}

              </span>

              {isAdmin ? (
                <div className="admin-request-details">
                  <p><FaAddressCard /><span><strong>CNIC</strong>{item.cnic ? formatCnic(item.cnic) : "Not provided"}</span></p>
                  <p><FaHospital /><span><strong>Hospital</strong>{item.hospital || "Not provided"}</span></p>
                  <p><FaMapMarkerAlt /><span><strong>City</strong>{item.city || "Not provided"}</span></p>
                  <p><FaPhone /><span><strong>Phone</strong>{item.phone || "Not provided"}</span></p>
                  <p><FaCalendarAlt /><span><strong>Required date</strong>{item.date || "Not provided"}</span></p>
                  <p><FaExclamationTriangle /><span><strong>Urgency</strong>{item.urgency || "Normal"}</span></p>
                  <p className="request-reason"><FaAlignLeft /><span><strong>Reason</strong>{item.reason || "Not provided"}</span></p>
                </div>
              ) : (
                <>
                  <p><FaHospital />{item.hospital}</p>
                  <p><FaMapMarkerAlt />{item.city}</p>
                  <p><FaPhone />{item.phone}</p>
                </>
              )}

              <span className={`status ${String(item.status || "Pending").toLowerCase()}`}>

                {item.status}

              </span>

              {isAdmin && (
                <div className="btn-group">
                  <span className="match-count">{matchingDonors(item).length} compatible donors</span>
                  {item.status === "Pending" && (
                    <button className="approve-btn" onClick={() => handleApprove(item)}>Approve</button>
                  )}
                  <button className="reject-btn" onClick={() => handleReject(item)}>Blood unavailable</button>
                  {item.status === "Approved" && (
                    <button className="fulfilled-btn" onClick={() => handleFulfill(item)}>Fulfilled</button>
                  )}
                  {matchingDonors(item).length > 0 && <button className="match-btn" onClick={() => notifyMatchingDonors(item)}>Notify matches</button>}
                  <button className="delete-btn" onClick={() => handleDelete(item)}>Delete</button>
                </div>
              )}
              {!isAdmin && item.userId === user?.uid && item.status === "Pending" && (
                <div className="btn-group">
                  <button className="delete-btn" onClick={() => handleDelete(item)}>Cancel request</button>
                </div>
              )}
              {!isAdmin && item.userId === user?.uid && item.status !== "Fulfilled" && (
                <div className="btn-group">
                  <button className="fulfilled-btn" onClick={() => handleFulfill(item)}>Mark fulfilled</button>
                </div>
              )}

            </div>

          ))

        ) : (

          <h2>No Requests Found</h2>

        )}

      </div>

    </div>

  );

}

export default Requests;
