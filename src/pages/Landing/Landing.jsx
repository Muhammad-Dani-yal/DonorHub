import "./Landing.css";
import Footer from "../../components/Footer";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight, FaCheckCircle, FaClipboardCheck, FaHeartbeat,
  FaAppleAlt, FaBed, FaGlassWhiskey, FaHospital, FaLock, FaMapMarkerAlt, FaQuestionCircle,
  FaSearch, FaShieldAlt, FaTint, FaUserCheck, FaUsers,
} from "react-icons/fa";
import { getDonors, getRequests } from "../../services/firebaseService";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const compatibility = [
  ["O−", "Everyone", "O−"], ["O+", "O+, A+, B+, AB+", "O−, O+"],
  ["A−", "A−, A+, AB−, AB+", "O−, A−"], ["A+", "A+, AB+", "O−, O+, A−, A+"],
  ["B−", "B−, B+, AB−, AB+", "O−, B−"], ["B+", "B+, AB+", "O−, O+, B−, B+"],
  ["AB−", "AB−, AB+", "O−, A−, B−, AB−"], ["AB+", "AB+", "All groups"],
];

const processSteps = [
  { number: "01", Icon: FaClipboardCheck, title: "Submit details", text: "Register as a donor or send a complete blood request." },
  { number: "02", Icon: FaShieldAlt, title: "Admin verification", text: "An administrator reviews the information for safety and accuracy." },
  { number: "03", Icon: FaSearch, title: "Find a match", text: "Approved requests are connected with compatible available donors." },
  { number: "04", Icon: FaHeartbeat, title: "Complete support", text: "The result is recorded as fulfilled or rejected for transparency." },
];

const faqs = [
  { question: "Who can register as a donor?", answer: "Adults who meet the age and health requirements can apply. Every application is reviewed by an administrator before it appears as an approved donor." },
  { question: "Is my health information public?", answer: "No. Screening answers are kept private and are available only for authorized review. Public cards show only the information needed to coordinate a match." },
  { question: "What happens after I submit a blood request?", answer: "The request remains pending until an administrator verifies it. Once approved, it becomes visible to suitable donors and can later be marked fulfilled or rejected." },
  { question: "How will I know when my status changes?", answer: "Signed-in users receive dashboard notifications when a donor application or blood request is approved, fulfilled, rejected, or otherwise updated." },
  { question: "Does DonorHub provide medical approval?", answer: "No. DonorHub helps coordinate people and requests. Final eligibility and donation decisions must be made by qualified medical professionals." },
];

function Landing() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [eligibility, setEligibility] = useState({ age: "", weight: "", health: "", lastDonation: "" });
  const [eligibilityResult, setEligibilityResult] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getDonors(), getRequests()])
      .then(([donorData, requestData]) => {
        if (!active) return;
        setDonors(Object.values(donorData || {}));
        setRequests(Object.values(requestData || {}));
      })
      .catch(() => {
        // Public database access may be restricted; the landing page remains usable.
      });
    return () => { active = false; };
  }, []);

  const approvedDonors = useMemo(() => donors.filter((donor) =>
    (donor.approvalStatus === "Approved" || !donor.approvalStatus) && donor.availability !== "Unavailable"
  ), [donors]);

  const urgentRequests = useMemo(() => requests
    .filter((request) => request.status === "Approved")
    .sort((a, b) => {
      const rank = { Critical: 3, Urgent: 2, Normal: 1 };
      return (rank[b.urgency] || 0) - (rank[a.urgency] || 0) || (b.createdAt || 0) - (a.createdAt || 0);
    })
    .slice(0, 3), [requests]);

  const fulfilledCount = requests.filter((request) => request.status === "Fulfilled").length;
  const coveredCities = useMemo(() => [...new Set(approvedDonors.map((donor) => donor.city?.trim()).filter(Boolean))].sort(), [approvedDonors]);
  const recentActivity = useMemo(() => requests
    .filter((request) => request.status === "Fulfilled" || request.status === "Approved")
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 4), [requests]);

  const checkEligibility = (event) => {
    event.preventDefault();
    const age = Number(eligibility.age);
    const weight = Number(eligibility.weight);
    if (age >= 18 && age <= 60 && weight >= 50 && eligibility.health === "No" && eligibility.lastDonation === "No") {
      setEligibilityResult("You may be eligible to donate. A medical professional must make the final decision.");
    } else {
      setEligibilityResult("You may need medical guidance before donating. Please consult a qualified healthcare professional.");
    }
  };

  return (
    <>
      <main className="landing-page min-h-0">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="section-kicker light"><FaHeartbeat /> Trusted blood coordination</span>
            <h1>Connect hope with the people who need it most.</h1>
            <p>DonorHub helps verified donors and patients coordinate lifesaving blood support through one secure, transparent platform.</p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate("/register")}>Become a donor <FaArrowRight /></button>
              <button className="secondary-btn" onClick={() => navigate("/request")}>Request blood</button>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-icon"><FaHeartbeat /></div>
            <h2>Your action can become someone’s second chance.</h2>
            <p>Register, complete the health screening, and let DonorHub help connect you with verified needs in your community.</p>
            <div className="hero-card-note"><FaShieldAlt /> Admin-reviewed requests and donors</div>
          </div>
        </section>

        <section className="landing-section impact-section" aria-labelledby="impact-title">
          <div className="section-heading centered"><span className="section-kicker">Our impact</span><h2 id="impact-title">A community built around timely help</h2></div>
          <div className="stat-grid">
            <article><FaUsers /><strong>{approvedDonors.length}</strong><span>Available donors</span></article>
            <article><FaClipboardCheck /><strong>{fulfilledCount}</strong><span>Requests fulfilled</span></article>
            <article><FaTint /><strong>{bloodGroups.length}</strong><span>Blood groups supported</span></article>
            <article><FaHospital /><strong>24/7</strong><span>Request submission</span></article>
          </div>
        </section>

        <section className="landing-section" aria-labelledby="urgent-title">
          <div className="section-heading split"><div><span className="section-kicker">Respond faster</span><h2 id="urgent-title">Urgent blood requests</h2><p>Approved needs that are currently waiting for support.</p></div><button className="text-button" onClick={() => navigate("/requests")}>View all requests <FaArrowRight /></button></div>
          <div className="urgent-grid">
            {urgentRequests.length ? urgentRequests.map((request) => (
              <article className="urgent-card" key={request.id}>
                <div className="urgent-top"><span className="blood-badge">{request.blood}</span><span className={`urgency ${String(request.urgency || "Normal").toLowerCase()}`}>{request.urgency || "Normal"}</span></div>
                <h3>{request.patientName || "Patient request"}</h3>
                <p><FaHospital /> {request.hospital || "Hospital not provided"}</p>
                <p><FaMapMarkerAlt /> {request.city || "City not provided"}</p>
                <button onClick={() => navigate("/requests")}>View request</button>
              </article>
            )) : <div className="empty-landing-state"><FaCheckCircle /><h3>No approved urgent requests right now</h3><p>New verified requests will appear here automatically.</p></div>}
          </div>
        </section>

        <section className="landing-section process-section" aria-labelledby="process-title">
          <div className="section-heading centered"><span className="section-kicker">Simple and transparent</span><h2 id="process-title">How DonorHub works</h2></div>
          <div className="process-grid">
            {processSteps.map(({ number, Icon, title, text }) => <article key={number}><span className="step-number">{number}</span><div className="step-icon"><Icon /></div><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="landing-section" aria-labelledby="availability-title">
          <div className="section-heading centered"><span className="section-kicker">Live directory overview</span><h2 id="availability-title">Blood availability</h2><p>Currently available, admin-approved donors by blood group.</p></div>
          <div className="blood-grid">{bloodGroups.map((group) => { const count = approvedDonors.filter((donor) => donor.blood === group).length; return <article key={group}><span>{group}</span><strong>{count}</strong><small>{count === 1 ? "donor" : "donors"}</small></article>; })}</div>
        </section>

        <section className="landing-section eligibility-section" aria-labelledby="eligibility-title">
          <div className="eligibility-copy"><span className="section-kicker light">Quick pre-check</span><h2 id="eligibility-title">Could you be eligible to donate?</h2><p>Answer four basic questions for preliminary guidance. This check does not replace professional medical screening.</p><ul><li><FaCheckCircle /> Takes less than a minute</li><li><FaLock /> Answers are not saved</li><li><FaUserCheck /> Final approval stays with medical staff</li></ul></div>
          <form className="eligibility-form" onSubmit={checkEligibility}>
            <label>Age<input type="number" min="1" value={eligibility.age} onChange={(e) => setEligibility({ ...eligibility, age: e.target.value })} placeholder="e.g. 25" required /></label>
            <label>Weight (kg)<input type="number" min="1" value={eligibility.weight} onChange={(e) => setEligibility({ ...eligibility, weight: e.target.value })} placeholder="e.g. 65" required /></label>
            <label>Illness in the past 6 months?<select value={eligibility.health} onChange={(e) => setEligibility({ ...eligibility, health: e.target.value })} required><option value="">Select</option><option>No</option><option>Yes</option></select></label>
            <label>Donated within the past 3 months?<select value={eligibility.lastDonation} onChange={(e) => setEligibility({ ...eligibility, lastDonation: e.target.value })} required><option value="">Select</option><option>No</option><option>Yes</option></select></label>
            <button type="submit">Check eligibility</button>
            {eligibilityResult && <p className="eligibility-result" role="status">{eligibilityResult}</p>}
          </form>
        </section>

        <section className="landing-section" aria-labelledby="trust-title">
          <div className="section-heading centered"><span className="section-kicker">Trust and safety</span><h2 id="trust-title">Designed for responsible coordination</h2></div>
          <div className="trust-grid">
            <article><FaShieldAlt /><h3>Admin verification</h3><p>Donors and requests stay pending until they are reviewed.</p></article>
            <article><FaLock /><h3>Private screening</h3><p>Sensitive health answers are separated from public donor details.</p></article>
            <article><FaClipboardCheck /><h3>Clear status history</h3><p>Fulfilled and rejected records remain organized and traceable.</p></article>
            <article><FaUserCheck /><h3>Account controls</h3><p>Role-based access keeps administrative actions restricted.</p></article>
          </div>
        </section>

        <section className="landing-section compatibility-guide" aria-labelledby="compatibility-title">
          <div className="section-heading centered"><span className="section-kicker">Know your match</span><h2 id="compatibility-title">Blood compatibility guide</h2><p>A quick red-cell donation reference. Medical teams must always confirm compatibility before transfusion.</p></div>
          <div className="compatibility-table-wrap"><table><thead><tr><th>Blood group</th><th>Can donate to</th><th>Can receive from</th></tr></thead><tbody>{compatibility.map(([group, donateTo, receiveFrom]) => <tr key={group}><td><strong>{group}</strong></td><td>{donateTo}</td><td>{receiveFrom}</td></tr>)}</tbody></table></div>
        </section>

        <section className="landing-section care-section" aria-labelledby="care-title">
          <div className="section-heading centered"><span className="section-kicker">Donate with confidence</span><h2 id="care-title">Before and after your donation</h2></div>
          <div className="care-grid">
            <article><div className="care-icon"><FaTint /></div><h3>Before donating</h3><ul><li>Sleep well the night before.</li><li>Eat a healthy, iron-rich meal.</li><li>Drink plenty of water.</li><li>Bring valid identification.</li><li>Tell staff about medicines or illness.</li></ul></article>
            <article><div className="care-icon"><FaHeartbeat /></div><h3>After donating</h3><ul><li>Rest briefly before leaving.</li><li>Drink extra fluids.</li><li>Avoid heavy exercise that day.</li><li>Keep the bandage clean and dry.</li><li>Contact medical staff if you feel unwell.</li></ul></article>
          </div>
        </section>

        <section className="wellness-banners" aria-label="Healthy donation reminders">
          <article className="wellness-banner hydration"><span><FaGlassWhiskey /></span><div><strong>Stay hydrated</strong><p>Drink water before and after donating to support a comfortable recovery.</p></div></article>
          <article className="wellness-banner nutrition"><span><FaAppleAlt /></span><div><strong>Eat healthy</strong><p>Choose a balanced, iron-rich meal and avoid donating on an empty stomach.</p></div></article>
          <article className="wellness-banner rest"><span><FaBed /></span><div><strong>Rest properly</strong><p>Get enough sleep beforehand and avoid strenuous activity after donation.</p></div></article>
        </section>

        <section className="landing-section community-section" aria-labelledby="community-title">
          <div className="section-heading centered"><span className="section-kicker">Community reach</span><h2 id="community-title">Cities and recent activity</h2><p>Live, privacy-safe information from approved DonorHub records.</p></div>
          <div className="community-grid">
            <article className="cities-card"><h3><FaMapMarkerAlt /> Cities covered</h3>{coveredCities.length ? <div className="city-tags">{coveredCities.slice(0, 12).map((city) => <span key={city}>{city}</span>)}</div> : <p>No approved donor locations are available publicly yet.</p>}<button onClick={() => navigate("/donors")}>Explore donors <FaArrowRight /></button></article>
            <article className="activity-card"><h3><FaHeartbeat /> Latest community activity</h3>{recentActivity.length ? <div className="public-activity-list">{recentActivity.map((item) => <div key={item.id}><span className="activity-dot" /><p><strong>{item.blood} request {item.status.toLowerCase()}</strong><small>{item.city ? ` in ${item.city}` : " on DonorHub"}</small></p></div>)}</div> : <p>No public activity is available yet.</p>}</article>
          </div>
        </section>

        <section className="landing-section action-grid" aria-label="More ways to help">
          <article><FaUsers /><h3>Volunteer with DonorHub</h3><p>Cannot donate? You can still help by sharing verified requests and encouraging eligible donors to register.</p><button onClick={() => navigate("/register")}>Join the community</button></article>
          <article><FaShieldAlt /><h3>Report misuse</h3><p>Never send money or sensitive documents to an unverified person. Report suspicious activity to our support team.</p><a href="mailto:TeamJawanPakistan@gmail.com?subject=DonorHub misuse report">Email support</a></article>
          <article><FaHospital /><h3>Hospital and campaign partners</h3><p>Verified hospitals and blood-drive campaigns can contact DonorHub to discuss responsible coordination.</p><a href="mailto:TeamJawanPakistan@gmail.com?subject=DonorHub partnership">Become a partner</a></article>
        </section>

        <aside className="emergency-banner"><FaHospital /><div><strong>Facing a medical emergency?</strong><p>Contact your nearest hospital or local emergency service immediately. DonorHub is a coordination platform, not an emergency medical provider.</p></div><a href="tel:03038623596">Call 0303-8623596</a></aside>

        <section className="landing-section faq-section" aria-labelledby="faq-title">
          <div className="section-heading centered"><span className="section-kicker"><FaQuestionCircle /> Helpful answers</span><h2 id="faq-title">Frequently asked questions</h2></div>
          <div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
        </section>

        <section className="final-cta">
          <FaHeartbeat className="cta-heart" />
          <div><span className="section-kicker light">Make an impact today</span><h2>Someone’s tomorrow could start with your decision today.</h2><p>Join DonorHub as a donor or submit a verified request for someone who needs support.</p></div>
          <div className="cta-actions"><button onClick={() => navigate("/register")}>Register now</button><button onClick={() => navigate("/request")}>Request blood</button></div>
        </section>

        <p className="medical-disclaimer"><FaShieldAlt /> <strong>Medical disclaimer:</strong> DonorHub supports coordination only. It does not diagnose conditions, guarantee blood availability, approve transfusions, or replace advice and screening from qualified healthcare professionals.</p>
      </main>
      <Footer />
    </>
  );
}

export default Landing;
