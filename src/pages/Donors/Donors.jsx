import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Donors.css";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTint,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

import {
  getDonors,
  updateDonor,
  deleteDonor,
  addNotification,
  addStatusHistory,
  getDonorScreenings,
} from "../../services/firebaseService";
import { useAuth } from "../../context/useAuth";
import { setDonors as setDonorsState } from "../../features/donors/donorsSlice";
import { formatCnic, formatPhone, isValidCnic, isValidPhone, maskCnic } from "../../utils/inputFormatters";

function Donors() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const donors = useSelector((state) => state.donors.items);
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDonors = useCallback(async () => {

    try {
      setErrorMessage("");

      const [data, screenings] = await Promise.all([
        getDonors(),
        isAdmin ? getDonorScreenings() : Promise.resolve({}),
      ]);

      if (data) {

        const donorList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          screening: screenings[key] || null,
        }));

        dispatch(setDonorsState(donorList));

      } else {

        dispatch(setDonorsState([]));

      }

    } catch {

      setErrorMessage("Unable to load donors. Please refresh and try again.");

    }

  }, [dispatch, isAdmin]);

  const handleDelete = async (donor) => {

    const confirmDelete = window.confirm(
      isAdmin ? "Permanently delete this invalid donor entry?" : "Withdraw this donor application?"
    );

    if (!confirmDelete) return;

    try {

      if (isAdmin) {
        await deleteDonor(donor.id);
      } else {
        await updateDonor(donor.id, { approvalStatus: "Rejected" });
      }

      if (isAdmin && donor.userId && donor.userId !== user?.uid) {
        await addNotification(donor.userId, {
          type: "donor_removed",
          title: "Donor application rejected",
          message: `Your ${donor.blood} donor listing was removed by an administrator.`,
          relatedId: donor.id,
        });
      }

      fetchDonors();

    } catch {

      setErrorMessage("Unable to update this donor. Please try again.");

    }

  };

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const handleAvailability = async (donor) => {
    await updateDonor(donor.id, {
      availability: donor.availability === "Unavailable" ? "Available" : "Unavailable",
    });
    fetchDonors();
  };

  const handleEdit = async (donor) => {
    const name = window.prompt("Full name:", donor.name || "");
    if (name === null) return;
    const city = window.prompt("City:", donor.city || "");
    if (city === null) return;
    const phoneInput = window.prompt("Contact number (0300-1234567):", donor.phone || "");
    if (phoneInput === null) return;
    const phone = formatPhone(phoneInput);
    if (!isValidPhone(phone)) {
      setErrorMessage("Phone number must match the format 0300-1234567.");
      return;
    }
    const cnicInput = window.prompt("CNIC (12345-1234567-1):", formatCnic(donor.cnic || ""));
    if (cnicInput === null) return;
    const cnic = formatCnic(cnicInput);
    if (!isValidCnic(cnic)) {
      setErrorMessage("CNIC must match the format 12345-1234567-1.");
      return;
    }
    const date = window.prompt("Last donation date (YYYY-MM-DD):", donor.date || donor.lastDonated || "");
    if (date === null) return;
    const medicalNotes = window.prompt("Medical notes (optional):", donor.medicalNotes || "");
    if (medicalNotes === null) return;
    await updateDonor(donor.id, { name: name.trim(), city: city.trim(), phone: phone.trim(), cnic, date, medicalNotes });
    fetchDonors();
  };

  const handleApproval = async (donor, approvalStatus) => {
    const rejectionReason = approvalStatus === "Rejected"
      ? window.prompt("Enter a rejection reason for the donor:", "Donation eligibility requirements were not met.")
      : "";
    if (approvalStatus === "Rejected" && rejectionReason === null) return;
    await updateDonor(donor.id, { approvalStatus, rejectionReason });
    await addStatusHistory("donors", donor.id, approvalStatus, { note: rejectionReason });
    if (donor.userId) {
      await addNotification(donor.userId, {
        type: approvalStatus === "Approved" ? "donor_approved" : "donor_rejected",
        title: approvalStatus === "Approved" ? "Donor application approved" : "Donor application rejected",
        message: approvalStatus === "Approved"
          ? `Your ${donor.blood} donor application was approved and is now visible to the community.`
          : `Your ${donor.blood} donor application was rejected. Reason: ${rejectionReason}`,
        relatedId: donor.id,
      });
    }
    fetchDonors();
  };

  const handleFulfillDonation = async (donor) => {
    await updateDonor(donor.id, { approvalStatus: "Fulfilled" });
    await addStatusHistory("donors", donor.id, "Fulfilled");
    if (donor.userId) {
      await addNotification(donor.userId, {
        type: "donor_fulfilled",
        title: "Blood donation fulfilled",
        message: `Your ${donor.blood} blood donation has been marked as fulfilled. Thank you for helping save lives.`,
        relatedId: donor.id,
      });
    }
    fetchDonors();
  };

  const accessibleDonors = isAdmin
    ? donors
    : donors.filter(
      (donor) => donor.approvalStatus !== "Rejected" && donor.approvalStatus !== "Fulfilled"
    ).filter(
      (donor) => !donor.approvalStatus || donor.approvalStatus === "Approved" || donor.userId === user?.uid
    );

  const filteredDonors = accessibleDonors.filter((donor) => {
    const matchName = donor.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchBlood = bloodFilter === "" || donor.blood === bloodFilter;
    const matchCity = cityFilter === "" || donor.city?.toLowerCase() === cityFilter.toLowerCase();
    const matchAvailability = availabilityFilter === "" || donor.availability === availabilityFilter;

    return matchName && matchBlood && matchCity && matchAvailability;
  });

  const cityOptions = Array.from(new Set(accessibleDonors.map((donor) => donor.city).filter(Boolean)));

  return (

    <div className="donors-page">
     <div className="back-btn-container">
  <button
    className="back-btn"
    onClick={() => navigate(-1)}
  >
    ← Back
  </button>
</div>

      <div className="donors-heading">
        <h1>Blood donor directory</h1>
        <p>{isAdmin ? "Review donor applications and manage approved donors." : "Search approved donors and track your application."}</p>
      </div>

      {errorMessage && <p className="donors-error-message">{errorMessage}</p>}

      <div className="search-section">
        <div className="filter-box">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
            <option value="">All availability</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Not available</option>
          </select>
        </div>

        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)}>
            <option value="">All Blood Groups</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>

        <div className="filter-box">
          <FaMapMarkerAlt className="filter-icon" />
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="donor-stats">
        <div>
          <span>Total donors</span>
          <strong>{accessibleDonors.length}</strong>
        </div>
        <div>
          <span>Matches shown</span>
          <strong>{filteredDonors.length}</strong>
        </div>
      </div>

      <div className="donor-container">

        {filteredDonors.length > 0 ? (

          filteredDonors.map((donor) => (

            <div
              className="donor-card"
              key={donor.id}
            >

              <div className="blood-icon">
                <FaTint />
              </div>

              <h2>{donor.name}</h2>

              <span className="blood-group">
                {donor.blood}
              </span>

              <p>

                <FaMapMarkerAlt />

                {donor.city}

              </p>

              <p>

                <FaPhoneAlt />

                {donor.phone}

              </p>

              {donor.cnic && <p>CNIC: {isAdmin ? formatCnic(donor.cnic) : maskCnic(donor.cnic)}</p>}

              <span className={`status ${(donor.approvalStatus || "Approved").toLowerCase()}`}>
                {donor.approvalStatus && donor.approvalStatus !== "Approved"
                  ? donor.approvalStatus
                  : donor.availability || "Available"}
              </span>

              {isAdmin && (
                <div className="donor-health-summary">
                  <strong>Health screening</strong>
                  <span>Recent disease: {donor.screening?.recentDisease || donor.recentDisease || "Not provided"}</span>
                  {(donor.screening?.recentDiseaseDetails || donor.recentDiseaseDetails) && <p>{donor.screening?.recentDiseaseDetails || donor.recentDiseaseDetails}</p>}
                  <span>Allergies: {donor.screening?.hasAllergies || donor.hasAllergies || "Not provided"}</span>
                  {(donor.screening?.allergyDetails || donor.allergyDetails) && <p>{donor.screening?.allergyDetails || donor.allergyDetails}</p>}
                </div>
              )}

              <div className="btn-group">

                <a href={`tel:${donor.phone}`}>

                  <button className="contact-btn">

                    Contact

                  </button>

                </a>

                {isAdmin && donor.approvalStatus === "Pending" && (
                  <button className="approve-donor-btn" onClick={() => handleApproval(donor, "Approved")}>Approve</button>
                )}

                {isAdmin && donor.approvalStatus !== "Rejected" && (
                  <button className="reject-donor-btn" onClick={() => handleApproval(donor, "Rejected")}>Reject</button>
                )}

                {isAdmin && (donor.approvalStatus === "Approved" || !donor.approvalStatus) && (
                  <button className="fulfill-donor-btn" onClick={() => handleFulfillDonation(donor)}>Fulfilled</button>
                )}

                {(donor.approvalStatus === "Approved" || !donor.approvalStatus) && (isAdmin || donor.userId === user?.uid) && (
                  <button className="availability-btn" onClick={() => handleAvailability(donor)}>
                    {donor.availability === "Unavailable" ? "Set available" : "Set unavailable"}
                  </button>
                )}

                {donor.userId === user?.uid && (
                  <button className="availability-btn" onClick={() => handleEdit(donor)}>Edit</button>
                )}

                {!isAdmin && donor.userId === user?.uid && donor.approvalStatus === "Pending" && (
                  <span className="review-note">Waiting for admin review</span>
                )}

                {(isAdmin || donor.userId === user?.uid) && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(donor)}
                  >
                    Delete
                  </button>
                )}

              </div>

            </div>

          ))

        ) : (

          <div className="empty-state-card">
            <h2>No donors found</h2>
            <p>Try changing the search or filter values to find a match.</p>
          </div>

        )}

      </div>

    </div>

  );

}

export default Donors;
