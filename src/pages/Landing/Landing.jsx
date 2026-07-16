import "./Landing.css";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaHeartbeat, FaShieldAlt, FaUsers, FaHospital, FaTint } from "react-icons/fa";

const compatibilityRows = [
  { donor: "O-", recipient: "All blood groups" },
  { donor: "O+", recipient: "O+, A+, B+, AB+" },
  { donor: "A-", recipient: "A-, A+, AB-, AB+" },
  { donor: "A+", recipient: "A+, AB+" },
  { donor: "B-", recipient: "B-, B+, AB-, AB+" },
  { donor: "B+", recipient: "B+, AB+" },
  { donor: "AB-", recipient: "AB-, AB+" },
  { donor: "AB+", recipient: "AB+" },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <main className="landing-page">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="hero-pill">Saving lives through trusted blood support</span>
            <h1>Every donation can give a patient a second chance.</h1>
            <p>
              Blood donation is one of the most direct ways to help someone recover from surgery, trauma, cancer treatment, or a medical emergency. A single donation can support more than one patient and bring comfort to families facing a difficult time.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate("/register")}>Become a donor</button>
              <button className="secondary-btn" onClick={() => navigate("/donors")}>Find donors</button>
            </div>
            <div className="hero-metrics">
              <div>
                <strong>1 donation</strong>
                <span>can help multiple patients</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>request support</span>
              </div>
              <div>
                <strong>Safe</strong>
                <span>and carefully guided</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-icon">
              <FaHeartbeat />
            </div>
            <h2>Why blood donation matters</h2>
            <p>
              Hospitals depend on a steady supply of blood for emergencies, childbirth complications, cancer treatment, and chronic care. When a donor steps forward, they help preserve life and stability for people who may not have a clear path forward without that support.
            </p>
          </div>
        </section>

        <section className="info-grid">
          <article className="info-card">
            <FaHeart className="feature-icon" />
            <h3>What donating means</h3>
            <p>The donation process is calm, safe, and supervised by trained professionals. Most donors are able to return to their daily routine quickly, and the impact on patients can be immediate and life changing.</p>
          </article>
          <article className="info-card">
            <FaHospital className="feature-icon" />
            <h3>Helping hospitals and families</h3>
            <p>Blood is often needed in moments that cannot wait. From surgery suites to intensive care units, volunteers help care teams respond with confidence and speed.</p>
          </article>
          <article className="info-card">
            <FaUsers className="feature-icon" />
            <h3>Strengthening the community</h3>
            <p>When people donate regularly, they build a dependable support network for neighbours, friends, and strangers who may suddenly need help.</p>
          </article>
          <article className="info-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Safe and respectful care</h3>
            <p>Every step is handled with care and attention, from preparation to recovery, so donors can feel informed and comfortable throughout their visit.</p>
          </article>
        </section>

        <section className="compatibility-section">
          <div className="compatibility-heading">
            <FaTint className="compat-icon" />
            <div>
              <h2>Blood group compatibility</h2>
              <p>Some groups are suitable for a wider range of patients than others, which makes matching an important part of safe care.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor group</th>
                  <th>Can support recipients</th>
                </tr>
              </thead>
              <tbody>
                {compatibilityRows.map((row) => (
                  <tr key={row.donor}>
                    <td>{row.donor}</td>
                    <td>{row.recipient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Landing;
