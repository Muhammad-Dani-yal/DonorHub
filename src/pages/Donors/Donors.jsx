import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  deleteDonor,
} from "../../services/firebaseService";
import { useAuth } from "../../context/AuthContext";

function Donors() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {

    try {

      const data = await getDonors();

      if (data) {

        const donorList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setDonors(donorList);

      } else {

        setDonors([]);

      }

    } catch (error) {

      console.log(error);

    }

  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this donor?"
    );

    if (!confirmDelete) return;

    try {

      await deleteDonor(id);

      fetchDonors();

      alert("Donor Deleted Successfully");

    } catch (error) {

      console.log(error);

    }

  };

  const filteredDonors = donors.filter((donor) => {
    const matchName = donor.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchBlood = bloodFilter === "" || donor.blood === bloodFilter;
    const matchCity = cityFilter === "" || donor.city?.toLowerCase() === cityFilter.toLowerCase();

    return matchName && matchBlood && matchCity;
  });

  const cityOptions = Array.from(new Set(donors.map((donor) => donor.city).filter(Boolean)));

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
        <h1>Available Blood Donors</h1>
        <p>Search by name, city, and blood group to quickly find a match.</p>
      </div>

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
          <strong>{donors.length}</strong>
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

              <span className="status">

                Available

              </span>

              <div className="btn-group">

                <a href={`tel:${donor.phone}`}>

                  <button className="contact-btn">

                    Contact

                  </button>

                </a>

                {isAdmin && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(donor.id)}
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
