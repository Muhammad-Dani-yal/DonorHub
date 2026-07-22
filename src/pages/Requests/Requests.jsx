import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Requests.css";
import {
  FaTint,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
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

function Requests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {

    try {
    const [data, donorData] = await Promise.all([getRequests(), getDonors()]);

    if (data) {

      const arr = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      setRequests(arr);

    } else {

      setRequests([]);

    }
    setDonors(Object.values(donorData || {}));
    } catch (loadError) {
      setError(loadError.message || "Unable to load requests.");
    }

  };

  const notifyRequestOwner = async (item, type, title, message) => {
    if (!item.userId) return;
    await addNotification(item.userId, {
      type,
      title,
      message,
      relatedId: item.id,
    });
  };

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
    await addStatusHistory("requests", item.id, "Fulfilled");
    await notifyRequestOwner(
      item,
      "request_fulfilled",
      "Blood request fulfilled",
      `Your ${item.blood} blood request for ${item.patientName} has been marked as fulfilled.`
    );
    loadRequests();
  };

  const activeRequests = requests.filter(
    (item) => item.status === "Pending" || item.status === "Approved"
  );
  const visibleRequests = isAdmin
    ? activeRequests
    : activeRequests.filter((item) => item.status === "Approved" || item.userId === user?.uid);

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

      <div className="requests-container">

        {visibleRequests.length > 0 ? (

          visibleRequests.map((item) => (

            <div
              className="request-box"
              key={item.id}
            >

              <div className="blood-circle">

                <FaTint />

              </div>

              <h2>{item.patientName}</h2>

              <span className="blood-group">

                {item.blood}

              </span>

              <p>

                <FaHospital />

                {item.hospital}

              </p>

              <p>

                <FaMapMarkerAlt />

                {item.city}

              </p>

              <p>

                <FaPhone />

                {item.phone}

              </p>

              <span className="status">

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
