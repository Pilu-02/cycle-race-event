// LeaderboardManagement.js
import React, { useEffect, useState } from "react";

export default function LeaderboardManagement() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("officialToken");
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const res = await fetch(`${API}/api/events?status=approved`);
    const data = await res.json();
    setEvents(data.events || []);
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { position: prev.length + 1, name: "", time: "", riderId: "" },
    ]);
  }
  function updateRow(i, key, val) {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r))
    );
  }
  function removeRow(i) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    if (!token) {
      setMsg("Not logged in as official");
      return;
    }
    if (!selected) {
      setMsg("Select an event");
      return;
    }
    try {
      const res = await fetch(`${API}/api/events/${selected._id}/leaderboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ results: rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed");
        if (res.status === 401) localStorage.removeItem("officialToken");
        return;
      }
      setMsg("Leaderboard updated");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="app">
      <div className="form-container">
        <div className="form-card" style={{ maxWidth: 900 }}>
          <h2 className="form-title">Leaderboard Management</h2>

          <div>
            <label>Select event</label>
            <select
              onChange={(e) => {
                const ev = events.find((x) => x._id === e.target.value);
                setSelected(ev || null);
              }}
            >
              <option value="">--select--</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} — {new Date(ev.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <form onSubmit={submit} style={{ marginTop: 12 }}>
              <h4>Results for {selected.title}</h4>
              {rows.map((r, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, marginBottom: 8 }}
                >
                  <input
                    value={r.position}
                    onChange={(e) =>
                      updateRow(i, "position", Number(e.target.value))
                    }
                    style={{ width: 64 }}
                  />
                  <input
                    value={r.name}
                    onChange={(e) => updateRow(i, "name", e.target.value)}
                    placeholder="Name"
                    style={{ flex: 1 }}
                  />
                  <input
                    value={r.time}
                    onChange={(e) => updateRow(i, "time", e.target.value)}
                    placeholder="Time"
                    style={{ width: 160 }}
                  />
                  <input
                    value={r.riderId}
                    onChange={(e) => updateRow(i, "riderId", e.target.value)}
                    placeholder="RiderId"
                    style={{ width: 140 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="btn btn-decline"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={addRow}
                  className="btn btn-secondary"
                >
                  Add Row
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginLeft: 8 }}
                >
                  Submit Leaderboard
                </button>
              </div>
              {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
