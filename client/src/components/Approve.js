// Approve.js - REDESIGNED with Better Styling

import React, { useState } from "react";
import axios from "axios";

function Approve() {
  const [step, setStep] = useState("login");
  const [loginData, setLoginData] = useState({ userId: "", password: "" });
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Decline modal state
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [activeEventId, setActiveEventId] = useState(null);
  const [declineSubmitting, setDeclineSubmitting] = useState(false);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Handle coordinator login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/coordinator/login`, loginData);
      setToken(res.data.token);
      setStep("showEvents");
      setLoginData({ userId: "", password: "" });
      setSuccess("✅ Login successful!");
      setTimeout(() => setSuccess(""), 3000);
      fetchPendingEvents(res.data.token);
    } catch (err) {
      setError("❌ " + (err.response?.data?.error || "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending events
  const fetchPendingEvents = async (authToken) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/coordinator/events/pending`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setEvents(res.data);
    } catch (err) {
      setError("❌ Could not fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Approve event
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${API}/api/coordinator/events/${id}/status`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setSuccess("✅ Event approved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ " + (err.response?.data?.error || "Could not approve"));
    }
  };

  // Open decline modal
  const openDecline = (id) => {
    setActiveEventId(id);
    setDeclineReason("");
    setDeclineOpen(true);
  };

  // Submit decline
  const submitDecline = async () => {
    if (!declineReason.trim()) {
      setError("❌ Please enter a reason for declining.");
      return;
    }

    setDeclineSubmitting(true);
    setError("");

    try {
      await axios.put(
        `${API}/api/coordinator/events/${activeEventId}/status`,
        { status: "declined", reason: declineReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prev) => prev.filter((e) => e._id !== activeEventId));
      setDeclineOpen(false);
      setActiveEventId(null);
      setDeclineReason("");
      setSuccess("✅ Event declined successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ " + (err.response?.data?.error || "Could not decline"));
    } finally {
      setDeclineSubmitting(false);
    }
  };

  // Login form
  if (step === "login") {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>🔐 Coordinator Approval Panel</h1>
          <p style={styles.loginSubtitle}>Login to review and approve events</p>

          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>User ID</label>
              <input
                type="text"
                placeholder="Enter your user ID"
                value={loginData.userId}
                onChange={(e) =>
                  setLoginData({ ...loginData, userId: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? styles.buttonDisabled : styles.buttonLogin}
            >
              {loading ? "⏳ Logging in..." : "🚀 Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Events approval view
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>✔️ Approve Events</h1>
        <p style={styles.subtitle}>
          Review and approve pending event proposals
        </p>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}
      {success && <div style={styles.alertSuccess}>{success}</div>}

      <div style={styles.eventsContainer}>
        {loading ? (
          <div style={styles.loading}>
            <p>⏳ Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={styles.noEvents}>
            <p style={styles.noEventsText}>✅ No pending events to review</p>
            <p style={styles.noEventsSubtext}>
              All events have been approved or declined.
            </p>
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev._id} style={styles.eventCard}>
              <div style={styles.eventHeader}>
                <h2 style={styles.eventTitle}>{ev.title}</h2>
                <span style={styles.eventBadge}>Pending Review</span>
              </div>

              <div style={styles.eventDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>🏢 Organizer:</span>
                  <span style={styles.detailValue}>{ev.club}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>📧 Email:</span>
                  <span style={styles.detailValue}>{ev.email}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>📅 Date:</span>
                  <span style={styles.detailValue}>
                    {new Date(ev.date).toLocaleDateString()}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>🎯 Category:</span>
                  <span style={styles.detailValue}>{ev.category}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>👥 Participants:</span>
                  <span style={styles.detailValue}>{ev.capacityP}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>👀 Audience:</span>
                  <span style={styles.detailValue}>{ev.capacityA}</span>
                </div>

                {ev.fileUrl && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>📄 Document:</span>
                    <a
                      href={ev.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.fileLink}
                    >
                      View Document →
                    </a>
                  </div>
                )}
              </div>

              <div style={styles.actionButtons}>
                <button
                  onClick={() => handleApprove(ev._id)}
                  style={styles.buttonApprove}
                >
                  ✅ Approve Event
                </button>
                <button
                  onClick={() => openDecline(ev._id)}
                  style={styles.buttonDecline}
                >
                  ❌ Decline Event
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decline Modal */}
      {declineOpen && (
        <>
          <div
            style={styles.modalBackdrop}
            onClick={() => setDeclineOpen(false)}
          />
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>❌ Decline Event</h3>
              <button
                onClick={() => setDeclineOpen(false)}
                style={styles.closeButton}
              >
                ✖️
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={styles.modalDescription}>
                Please provide a reason for declining this event proposal.
              </p>

              <label style={styles.textareaLabel}>Reason for Declining *</label>
              <textarea
                placeholder="Enter a detailed reason... (e.g., Insufficient resources, Schedule conflict, Safety concerns, etc.)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                style={styles.textarea}
                maxLength={500}
              />
              <div style={styles.charCount}>
                {declineReason.length}/500 characters
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setDeclineOpen(false)}
                  style={styles.buttonCancel}
                >
                  Cancel
                </button>
                <button
                  onClick={submitDecline}
                  disabled={declineSubmitting || !declineReason.trim()}
                  style={
                    declineSubmitting || !declineReason.trim()
                      ? styles.buttonDeclineDisabled
                      : styles.buttonDeclineConfirm
                  }
                >
                  {declineSubmitting ? "⏳ Declining..." : "✅ Confirm Decline"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Approve;

// Styles
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
    fontSize: "2.8rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  },
  subtitle: {
    fontSize: "1.1rem",
    margin: 0,
    opacity: 0.9,
  },
  loginCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "50px 40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    maxWidth: "500px",
    margin: "80px auto",
  },
  loginTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
  },
  loginSubtitle: {
    textAlign: "center",
    color: "#666",
    margin: "0 0 30px 0",
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    padding: "12px 15px",
    fontSize: "1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
  },
  buttonLogin: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    marginTop: "10px",
  },
  buttonDisabled: {
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "not-allowed",
    marginTop: "10px",
  },
  eventsContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
    gap: "30px",
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
  },
  eventHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #e0e0e0",
  },
  eventTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    color: "#333",
    flex: 1,
  },
  eventBadge: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
    marginLeft: "10px",
  },
  eventDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "25px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.95rem",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
  },
  detailValue: {
    color: "#333",
    textAlign: "right",
  },
  fileLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  buttonApprove: {
    flex: 1,
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(17, 153, 142, 0.3)",
  },
  buttonDecline: {
    flex: 1,
    background: "linear-gradient(135deg, #f5576c 0%, #ff6b7a 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)",
  },
  // Modal Styles
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
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    zIndex: 1000,
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "25px 30px",
    borderBottom: "2px solid #e0e0e0",
  },
  modalTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: 0,
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#999",
    padding: "0",
  },
  modalBody: {
    padding: "30px",
  },
  modalDescription: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  textareaLabel: {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#555",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    minHeight: "150px",
    padding: "14px 16px",
    fontSize: "1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  charCount: {
    fontSize: "0.85rem",
    color: "#999",
    marginTop: "6px",
    textAlign: "right",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "25px",
  },
  buttonCancel: {
    flex: 1,
    background: "#e0e0e0",
    color: "#333",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDeclineConfirm: {
    flex: 1,
    background: "linear-gradient(135deg, #f5576c 0%, #ff6b7a 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)",
  },
  buttonDeclineDisabled: {
    flex: 1,
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "not-allowed",
  },
  alertError: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "2px solid #f5c6cb",
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "1200px",
    margin: "0 auto 20px auto",
  },
  alertSuccess: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "2px solid #c3e6cb",
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "1200px",
    margin: "0 auto 20px auto",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "1.1rem",
    color: "#999",
  },
  noEvents: {
    textAlign: "center",
    padding: "60px 40px",
    backgroundColor: "white",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  noEventsText: {
    fontSize: "1.3rem",
    color: "#333",
    fontWeight: "600",
    margin: "0 0 10px 0",
  },
  noEventsSubtext: {
    fontSize: "1rem",
    color: "#999",
    margin: 0,
  },
};
