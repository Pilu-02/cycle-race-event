// App1.js - FIXED with MODAL FORM and URL INPUT

import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Approve from "./Approve";
import OfficialsManagement from "./OfficialsManagement";
import BuyTickets from "./BuyTickets";
import OfficialLogin from "./OfficialLogin";
import TicketValidator from "./TicketValidator";
import RegisterEvents from "./RegisterEvents";
import Results from "./Results";
import LeaderboardManagement from "./LeaderboardManagement";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function HomePage({
  showForm,
  setShowForm,
  form,
  errors,
  status,
  loading,
  onChange,
  onSubmit,
  getMinDate,
  navigate,
  officialToken,
  officialRole,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Event Management System</h1>
        <p style={styles.subtitle}>
          Manage and propose events for your organization
        </p>
      </div>

      {/* User Actions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🎫 User Actions</h2>
        <div style={styles.buttonGrid}>
          <button
            onClick={() => setShowForm("Propose Event")}
            style={styles.buttonPrimary}
          >
            📝 Propose Event
          </button>
          <button
            onClick={() => navigate("/register")}
            style={styles.buttonPrimary}
          >
            🎯 Register for Event
          </button>
          <button
            onClick={() => navigate("/buy-tickets")}
            style={styles.buttonPrimary}
          >
            🎟️ Buy Tickets
          </button>
        </div>
      </div>

      {/* Event Results Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏆 Event Results</h2>
        <div style={styles.buttonGrid}>
          <button
            onClick={() => navigate("/results")}
            style={styles.buttonInfo}
          >
            📊 View Results
          </button>

          {/* Only show Update Results button for leaderboard_official */}
          {officialToken && officialRole === "leaderboard_official" && (
            <button
              onClick={() => navigate("/leaderboard")}
              style={styles.buttonWarning}
            >
              ✏️ Update Results (Official)
            </button>
          )}
        </div>
      </div>

      {/* Coordinator Functions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚙️ Coordinator/ Official Functions</h2>
        <div style={styles.buttonGrid}>
          <button
            onClick={() => navigate("/approve")}
            style={styles.buttonSecondary}
          >
            ✔️ Approve Events
          </button>
          <button
            onClick={() => navigate("/validate-ticket")}
            style={styles.buttonPrimary}
          >
            ✅ Validate Ticket
          </button>
          <button
            onClick={() => navigate("/officials")}
            style={styles.buttonSecondary}
          >
            👥 Manage Officials
          </button>
          <button
            onClick={() => navigate("/official-login")}
            style={styles.buttonSecondary}
          >
            🔐 Official Login
          </button>
        </div>
      </div>

      {/* MODAL FORM - Overlay */}
      {showForm && (
        <>
          {/* Backdrop - Click to close */}
          <div style={styles.modalBackdrop} onClick={() => setShowForm("")} />

          {/* Modal Form Container */}
          <div style={styles.modalContainer}>
            <form onSubmit={onSubmit} style={styles.form}>
              <div style={styles.formHeader}>
                <h3 style={styles.formTitle}>{showForm}</h3>
                <button
                  type="button"
                  onClick={() => setShowForm("")}
                  style={styles.closeButton}
                >
                  ✖️
                </button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Event Title"
                    value={form.title || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.title && (
                    <span style={styles.error}>{errors.title}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Club Name *</label>
                  <input
                    type="text"
                    name="club"
                    placeholder="Club Name"
                    value={form.club || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.club && (
                    <span style={styles.error}>{errors.club}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.email && (
                    <span style={styles.error}>{errors.email}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    name="category"
                    value={form.category || ""}
                    onChange={onChange}
                    style={styles.input}
                  >
                    <option value="">Select Category</option>
                    <option value="2k">2k</option>
                    <option value="5k">5k</option>
                    <option value="10k">10k</option>
                    <option value="20k">20k</option>
                    <option value="50k">50k</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && (
                    <span style={styles.error}>{errors.category}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Participant Capacity *</label>
                  <input
                    type="number"
                    name="capacityP"
                    placeholder="Min 5"
                    min="5"
                    value={form.capacityP || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.capacityP && (
                    <span style={styles.error}>{errors.capacityP}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Audience Capacity *</label>
                  <input
                    type="number"
                    name="capacityA"
                    placeholder="Min 50"
                    min="50"
                    value={form.capacityA || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.capacityA && (
                    <span style={styles.error}>{errors.capacityA}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Event Date *</label>
                  <input
                    type="date"
                    name="date"
                    min={getMinDate()}
                    value={form.date || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.date && (
                    <span style={styles.error}>{errors.date}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Google Drive Link or File URL
                  </label>
                  <input
                    type="url"
                    name="fileUrl"
                    placeholder="https://drive.google.com/... or your file URL"
                    value={form.fileUrl || ""}
                    onChange={onChange}
                    style={styles.input}
                  />
                  {errors.fileUrl && (
                    <span style={styles.error}>{errors.fileUrl}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={loading ? styles.buttonDisabled : styles.buttonSubmit}
              >
                {loading ? "⏳ Submitting..." : "✅ Submit Event Proposal"}
              </button>

              {status && (
                <p
                  style={
                    status.includes("✅") ? styles.successMsg : styles.errorMsg
                  }
                >
                  {status}
                </p>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default function App1() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState("");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [officialToken, setOfficialToken] = useState(
    localStorage.getItem("officialToken")
  );
  const [officialRole, setOfficialRole] = useState(
    localStorage.getItem("officialRole")
  );

  const validateForm = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Title is required";
    if (!form.club) newErrors.club = "Club is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.capacityP || form.capacityP < 5)
      newErrors.capacityP = "Min 5 participants";
    if (!form.capacityA || form.capacityA < 50)
      newErrors.capacityA = "Min 50 audience";
    if (!form.date) newErrors.date = "Date is required";
    return newErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      // Create a regular FormData object (not multipart since we're sending URL now)
      const data = {
        title: form.title,
        club: form.club,
        email: form.email,
        category: form.category,
        capacityP: form.capacityP,
        capacityA: form.capacityA,
        date: form.date,
        fileUrl: form.fileUrl || "", // Send as string, not file
      };

      const res = await axios.post(`${API}/api/proposals`, data, {
        headers: { "Content-Type": "application/json" },
      });

      setStatus("✅ Event proposal submitted successfully!");
      setForm({});
      setErrors({});
      setTimeout(() => setShowForm(""), 2000);
    } catch (err) {
      setStatus(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    // Clear error for this field
    setErrors({ ...errors, [name]: "" });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            showForm={showForm}
            setShowForm={setShowForm}
            form={form}
            errors={errors}
            status={status}
            loading={loading}
            onChange={onChange}
            onSubmit={onSubmit}
            getMinDate={getMinDate}
            navigate={navigate}
            officialToken={officialToken}
            officialRole={officialRole}
          />
        }
      />
      <Route path="/approve" element={<Approve />} />
      <Route path="/officials" element={<OfficialsManagement />} />
      <Route path="/buy-tickets" element={<BuyTickets />} />
      <Route
        path="/official-login"
        element={
          <OfficialLogin
            setOfficialToken={setOfficialToken}
            setOfficialRole={setOfficialRole}
          />
        }
      />
      <Route path="/validate-ticket" element={<TicketValidator />} />
      <Route path="/register" element={<RegisterEvents />} />
      <Route path="/results" element={<Results />} />
      <Route path="/leaderboard" element={<LeaderboardManagement />} />
    </Routes>
  );
}

// Inline styles for better layout
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    color: "white",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  },
  subtitle: {
    fontSize: "1.2rem",
    margin: 0,
    opacity: 0.9,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#333",
    fontWeight: "600",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "18px 30px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  buttonInfo: {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "18px 30px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(17, 153, 142, 0.4)",
  },
  buttonWarning: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "18px 30px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
  },
  buttonSecondary: {
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "18px 30px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(250, 112, 154, 0.4)",
  },
  // MODAL STYLES
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 999,
    backdropFilter: "blur(5px)",
  },
  modalContainer: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "700px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
  form: {
    width: "100%",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e0e0e0",
  },
  formTitle: {
    fontSize: "2rem",
    margin: 0,
    color: "#333",
    fontWeight: "600",
  },
  closeButton: {
    background: "#ff4757",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#555",
  },
  input: {
    padding: "12px 15px",
    fontSize: "1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    transition: "border-color 0.3s ease",
    outline: "none",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  error: {
    color: "#ff4757",
    fontSize: "0.85rem",
    marginTop: "5px",
    fontWeight: "500",
  },
  buttonSubmit: {
    width: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "18px",
    fontSize: "1.2rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  buttonDisabled: {
    width: "100%",
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "12px",
    padding: "18px",
    fontSize: "1.2rem",
    fontWeight: "700",
    cursor: "not-allowed",
  },
  successMsg: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    fontSize: "1rem",
    fontWeight: "600",
    textAlign: "center",
  },
  errorMsg: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    fontSize: "1rem",
    fontWeight: "600",
    textAlign: "center",
  },
};
