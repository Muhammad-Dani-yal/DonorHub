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
} from "../../services/firebaseService";
import { useAuth } from "../../context/AuthContext";

function Requests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {

    const data = await getRequests();

    if (data) {

      const arr = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      setRequests(arr);

    } else {

      setRequests([]);

    }

  };

  const handleApprove = async (id) => {

    await updateRequest(id, {
      status: "Approved",
    });

    loadRequests();

  };

  const handleReject = async (id) => {

    await updateRequest(id, {
      status: "Rejected",
    });

    loadRequests();

  };

  const handleDelete = async (id) => {

    if(window.confirm("Delete this request?")){

      await deleteRequest(id);

      loadRequests();

    }

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

      <p>Manage all blood requests.</p>

      <div className="requests-container">

        {requests.length > 0 ? (

          requests.map((item) => (

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
                  <button className="approve-btn" onClick={() => handleApprove(item.id)}>Approve</button>
                  <button className="reject-btn" onClick={() => handleReject(item.id)}>Reject</button>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
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
