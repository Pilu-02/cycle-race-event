// TicketValidator.js - REDESIGNED with Clean Status Badges

import React, { useState } from "react";

export default function TicketValidator() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Official token must be saved by OfficialLogin as "officialToken"
  const token = localStorage.getItem("officialToken");

  async function handleValidate(e) {
    e?.preventDefault();

    if (!input.trim()) {
      setResult({ error: "Please enter a ticket code" });
      return;
    }

    setLoading(true);
    setResult(null);

    if (!token) {
      setResult({
        error: "Not logged in as official. Please use Official Login first.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/officials/validate-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          valid: false,
          message: data.data?.message || data.error || "Ticket not found",
        });
        if (res.status === 401) localStorage.removeItem("officialToken");
        setLoading(false);
        return;
      }

      setResult({
        valid: data.data?.valid || true,
        message: data.data?.message || "Ticket validated successfully",
        ticketCode: input,
      });
    } catch (err) {
      setResult({
        valid: false,
        message: "Error: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎫 Ticket Validator</h1>
        <p style={styles.subtitle}>Validate event tickets</p>

        <form onSubmit={handleValidate} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter ticket code..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={
                loading || !input.trim()
                  ? styles.buttonDisabled
                  : styles.buttonValidate
              }
            >
              {loading ? "⏳ Validating..." : "🔍 Validate"}
            </button>
          </div>
        </form>

        {/* Result Display */}
        {result && (
          <div style={styles.resultContainer}>
            {result.error ? (
              // Error State
              <div style={{ ...styles.statusBadge, ...styles.errorBadge }}>
                <div style={styles.errorIcon}>⚠️</div>
                <div style={styles.statusText}>{result.error}</div>
              </div>
            ) : result.valid ? (
              // Valid State
              <div style={{ ...styles.statusBadge, ...styles.validBadge }}>
                <div style={styles.validIcon}>✅</div>
                <div style={styles.statusText}>VALID</div>
                <div style={styles.ticketCode}>{result.ticketCode}</div>
              </div>
            ) : (
              // Invalid State
              <div style={{ ...styles.statusBadge, ...styles.invalidBadge }}>
                <div style={styles.invalidIcon}>❌</div>
                <div style={styles.statusText}>INVALID</div>
                <div style={styles.message}>{result.message}</div>
              </div>
            )}

            <button onClick={handleClear} style={styles.buttonClear}>
              ↻ Validate Another Ticket
            </button>
          </div>
        )}

        {!result && !loading && (
          <div style={styles.placeholder}>
            <p style={styles.placeholderText}>
              Enter a ticket code to validate
            </p>
          </div>
        )}
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
    maxWidth: "600px",
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
    margin: "0 0 40px 0",
  },
  form: {
    marginBottom: "30px",
  },
  inputGroup: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "14px 18px",
    fontSize: "1.1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  buttonValidate: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "14px 30px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  buttonDisabled: {
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "10px",
    padding: "14px 30px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "not-allowed",
    whiteSpace: "nowrap",
  },
  resultContainer: {
    marginTop: "30px",
  },
  statusBadge: {
    borderRadius: "15px",
    padding: "40px 30px",
    textAlign: "center",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  validBadge: {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  invalidBadge: {
    background: "linear-gradient(135deg, #f5576c 0%, #ff6b7a 100%)",
  },
  errorBadge: {
    background: "linear-gradient(135deg, #ffa400 0%, #ffb400 100%)",
  },
  validIcon: {
    fontSize: "4rem",
    animation: "scaleIn 0.5s ease-out",
  },
  invalidIcon: {
    fontSize: "4rem",
    animation: "shake 0.5s ease-out",
  },
  errorIcon: {
    fontSize: "3rem",
  },
  statusText: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "white",
    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
    letterSpacing: "2px",
  },
  ticketCode: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.9)",
    marginTop: "10px",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "8px 16px",
    borderRadius: "20px",
    fontFamily: "monospace",
  },
  message: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.95)",
    marginTop: "10px",
  },
  buttonClear: {
    width: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  placeholder: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "15px",
    marginTop: "20px",
  },
  placeholderText: {
    color: "#999",
    fontSize: "1.1rem",
    margin: 0,
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}
