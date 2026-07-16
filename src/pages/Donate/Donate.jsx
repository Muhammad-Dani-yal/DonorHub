import { useState } from "react";
import "./Donate.css";
import { addDonor } from "../../services/firebaseService";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaTint,
  FaVenusMars,
  FaCity,
  FaPhoneAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Donate() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState({
    name: "",
    age: "",
    blood: "",
    gender: "",
    city: "",
    phone: "",
    date: "",
    address: "",
  });

  const handleChange = (e) => {
    setDonor({
      ...donor,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDonor(donor);

      alert("Donor Registered Successfully!");

      setDonor({
        name: "",
        age: "",
        blood: "",
        gender: "",
        city: "",
        phone: "",
        date: "",
        address: "",
      });
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="donate-page">

      <div className="donate-card">

      <button
  className="back-btn"
  onClick={() => navigate("/dashboard")}
>
  <FaArrowLeft /> Back
</button>

        <h1>Become a Blood Donor</h1>

        <p>
          Fill out the form below and become a lifesaver by donating blood.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={donor.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={donor.age}
              onChange={handleChange}
              min="18"
              max="60"
              required
            />
          </div>

          <div className="input-group">
            <FaTint className="input-icon" />
            <select
              name="blood"
              value={donor.blood}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
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

          <div className="input-group">
            <FaVenusMars className="input-icon" />
            <select
              name="gender"
              value={donor.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="input-group">
            <FaCity className="input-icon" />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={donor.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaPhoneAlt className="input-icon" />
            <input
              type="text"
              name="phone"
              placeholder="03XXXXXXXXX"
              value={donor.phone}
              onChange={handleChange}
              maxLength="11"
              required
            />
          </div>

          <div className="input-group">
            <FaCalendarAlt className="input-icon" />
            <input
              type="date"
              name="date"
              value={donor.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group textarea-group">
            <FaMapMarkerAlt className="input-icon" />
            <textarea
              name="address"
              placeholder="Complete Address"
              value={donor.address}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Register As Donor
          </button>

        </form>

      </div>

    </div>
  );
}

export default Donate;
