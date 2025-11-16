// OfficialsManagement.js - FIXED to work with updated CoordinatorLogin

import React, { useEffect, useState } from "react";
import CoordinatorLogin from "./CoordinatorLogin";

export default function OfficialsManagement() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ticket_validator");
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (token) fetchOfficials();
  }, [token]);

  async function fetchOfficials() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/coordinator/officials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        setError("Session expired. Please login again.");
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      setOfficials(data.officials || []);
    } catch (err) {
      setError(err.message || "Failed to load officials");
    } finally {
      setLoading(false);
    }
  }

  // This is called when CoordinatorLogin is successful
  function handleCoordinatorLoggedIn() {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setError("");
      setSuccess("✅ Coordinator logged in successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!token) {
      setError("Please login as coordinator first");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const body = { name, userId, password, role };
      const res = await fetch(`${API}/api/coordinator/officials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        throw new Error("Session expired. Please login again.");
      }

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || `Create failed (${res.status})`);

      setOfficials((prev) => [data.official, ...prev]);
      setName("");
      setUserId("");
      setPassword("");
      setRole("ticket_validator");
      setSuccess("✅ Official created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ " + (err.message || "Could not create official"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm("🗑️ Delete this official? This action cannot be undone.")
    )
      return;
    setError("");

    try {
      const res = await fetch(`${API}/api/coordinator/officials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        throw new Error("Session expired. Please login again.");
      }

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || `Delete failed (${res.status})`);
      setOfficials((prev) => prev.filter((o) => o._id !== id && o.id !== id));
      setSuccess("✅ Official deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ " + (err.message || "Could not delete official"));
    }
  }

  // If not logged in, show CoordinatorLogin
  if (!token) {
    return <CoordinatorLogin onLoginSuccess={handleCoordinatorLoggedIn} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Manage Officials</h1>
        <p style={styles.subtitle}>Create and manage event officials</p>
      </div>

      {/* Status Messages */}
      {error && <div style={styles.alertError}>{error}</div>}
      {success && <div style={styles.alertSuccess}>{success}</div>}

      <div style={styles.mainContent}>
        {/* Left: Create Form */}
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>➕ Create New Official</h2>

            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>User ID *</label>
                  <input
                    type="text"
                    placeholder="e.g., john_doe_123"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Password *</label>
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={styles.input}
                  >
                    <option value="ticket_validator">
                      🎟️ Ticket Validator
                    </option>
                    <option value="leaderboard_official">
                      🏆 Leaderboard Official
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !name || !userId || !password}
                style={
                  submitting || !name || !userId || !password
                    ? styles.buttonDisabled
                    : styles.buttonCreate
                }
              >
                {submitting ? "⏳ Creating..." : "✅ Create Official"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Officials List */}
        <div style={styles.listSection}>
          <div style={styles.listCard}>
            <h2 style={styles.listTitle}>📋 Officials ({officials.length})</h2>

            {loading ? (
              <div style={styles.loading}>
                <p>⏳ Loading officials...</p>
              </div>
            ) : officials.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyText}>No officials yet.</p>
                <p style={styles.emptySubtext}>
                  Create your first official using the form on the left.
                </p>
              </div>
            ) : (
              <div style={styles.officialsList}>
                {officials.map((official) => (
                  <div
                    key={official._id || official.id}
                    style={styles.officialCard}
                  >
                    <div style={styles.officialHeader}>
                      <div style={styles.officialInfo}>
                        <h3 style={styles.officialName}>{official.name}</h3>
                        <p style={styles.officialRole}>
                          {official.role === "ticket_validator"
                            ? "🎟️ Ticket Validator"
                            : "🏆 Leaderboard Official"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleDelete(official._id || official.id)
                        }
                        style={styles.buttonDelete}
                        title="Delete this official"
                      >
                        🗑️
                      </button>
                    </div>

                    <div style={styles.officialDetails}>
                      <div style={styles.detail}>
                        <span style={styles.detailLabel}>User ID:</span>
                        <span style={styles.detailValue}>
                          {official.userId}
                        </span>
                      </div>
                      <div style={styles.detail}>
                        <span style={styles.detailLabel}>Status:</span>
                        <span style={styles.statusBadge}>✅ Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  mainContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "30px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  formSection: {
    minWidth: 0,
  },
  listSection: {
    minWidth: 0,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    height: "fit-content",
  },
  listCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  },
  formTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: "0 0 30px 0",
    color: "#333",
    borderBottom: "3px solid #667eea",
    paddingBottom: "15px",
  },
  listTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: "0 0 25px 0",
    color: "#333",
    borderBottom: "3px solid #667eea",
    paddingBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
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
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  buttonCreate: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
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
  },
  buttonDelete: {
    background: "#ff4757",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "1.2rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  officialsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxHeight: "600px",
    overflowY: "auto",
    paddingRight: "10px",
  },
  officialCard: {
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    padding: "18px",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease",
  },
  officialHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  officialInfo: {
    flex: 1,
  },
  officialName: {
    fontSize: "1.2rem",
    fontWeight: "700",
    margin: "0 0 5px 0",
    color: "#333",
  },
  officialRole: {
    fontSize: "0.95rem",
    color: "#667eea",
    fontWeight: "600",
    margin: 0,
  },
  officialDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detail: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
  },
  detailValue: {
    color: "#333",
    fontFamily: "monospace",
  },
  statusBadge: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "inline-block",
    width: "fit-content",
  },
  loading: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
  },
  emptyText: {
    fontSize: "1.2rem",
    color: "#999",
    fontWeight: "600",
    margin: "0 0 10px 0",
  },
  emptySubtext: {
    fontSize: "0.95rem",
    color: "#bbb",
    margin: 0,
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
    maxWidth: "1400px",
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
    maxWidth: "1400px",
    margin: "0 auto 20px auto",
  },
};
