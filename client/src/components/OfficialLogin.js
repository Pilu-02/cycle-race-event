// OfficialLogin.js - UPDATED VERSION

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OfficialLogin({ setOfficialToken, setOfficialRole }) {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/api/officials/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save token and role to localStorage
      localStorage.setItem("officialToken", data.token);
      localStorage.setItem("officialRole", data.official.role);

      // Update parent state
      if (setOfficialToken) setOfficialToken(data.token);
      if (setOfficialRole) setOfficialRole(data.official.role);

      setMsg(`✅ Login successful! Role: ${data.official.role}`);

      // Redirect to home page after 1 second
      setTimeout(() => {
        navigate("/");
        window.location.reload(); // Reload to update the state
      }, 1000);
    } catch (err) {
      setMsg("❌ Error: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Official Login</h2>
        <p style={styles.subtitle}>Login to access official functions</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>User ID</label>
            <input
              type="text"
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? "⏳ Logging in..." : "🚀 Login"}
          </button>
        </form>

        {msg && (
          <p style={msg.includes("✅") ? styles.successMsg : styles.errorMsg}>
            {msg}
          </p>
        )}

        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to Home
        </button>
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
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    textAlign: "center",
    margin: "0 0 10px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1rem",
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#333",
  },
  input: {
    padding: "14px 18px",
    fontSize: "1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "1.2rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  buttonDisabled: {
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "1.2rem",
    fontWeight: "700",
    cursor: "not-allowed",
    marginTop: "10px",
  },
  backButton: {
    background: "transparent",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
    width: "100%",
  },
  successMsg: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
    fontSize: "1rem",
    fontWeight: "600",
    textAlign: "center",
  },
  errorMsg: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
    fontSize: "1rem",
    fontWeight: "600",
    textAlign: "center",
  },
};
