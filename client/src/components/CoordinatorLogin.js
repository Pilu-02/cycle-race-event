// CoordinatorLogin.js - UPDATED and COMPLETE

import React, { useState } from "react";

export default function CoordinatorLogin({ onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userId || !password) {
      setError("Please enter both User ID and Password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/coordinator/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save token and coordinator info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "coordinator",
        JSON.stringify(data.coordinator || {})
      );

      setUserId("");
      setPassword("");
      setError("");

      // Call the callback to notify parent component
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError("❌ " + (err.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔐 Coordinator Login</h1>
          <p style={styles.subtitle}>
            Login to manage officials and approve events
          </p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>User ID</label>
            <input
              type="text"
              placeholder="Enter your coordinator user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <button
            type="submit"
            disabled={loading || !userId || !password}
            style={
              loading || !userId || !password
                ? styles.buttonDisabled
                : styles.buttonLogin
            }
          >
            {loading ? "⏳ Logging in..." : "🚀 Login as Coordinator"}
          </button>
        </form>

        <div style={styles.helpText}>
          <p style={styles.helpTitle}>📝 Demo Credentials:</p>
          <p style={styles.helpContent}>
            Contact your administrator for login credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "50px 40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    maxWidth: "500px",
    width: "100%",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: "0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "30px",
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
    padding: "14px 18px",
    fontSize: "1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  buttonLogin: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "16px 20px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
    marginTop: "10px",
  },
  buttonDisabled: {
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "12px",
    padding: "16px 20px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "not-allowed",
    marginTop: "10px",
  },
  errorAlert: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "2px solid #f5c6cb",
    fontSize: "0.95rem",
    fontWeight: "600",
    textAlign: "center",
  },
  helpText: {
    backgroundColor: "#f0f4ff",
    border: "2px solid #e0e5ff",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
  },
  helpTitle: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#667eea",
    margin: "0 0 8px 0",
  },
  helpContent: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "0",
    lineHeight: "1.5",
  },
};
