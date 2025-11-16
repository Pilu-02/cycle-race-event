// RegisterEvents.js
import React, { useEffect, useState } from "react";

export default function RegisterEvents() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [bike, setBike] = useState("");
  const [raceNumber, setRaceNumber] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/events?status=approved`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setMsg("Could not load events");
    } finally {
      setLoading(false);
    }
  }

  function openRegister(ev) {
    setSelected(ev);
    setEmail("");
    setName("");
    setBike("");
    setRaceNumber("");
    setMsg("");
  }

  async function submitRegistration(e) {
    e.preventDefault();
    if (!email) {
      setMsg("Please enter email");
      return;
    }

    try {
      const body = { email, name, bike, raceNumber };
      const res = await fetch(`${API}/api/events/${selected._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Registration failed");
      } else {
        setMsg(
          data.warning
            ? data.warning
            : "Registered successfully! Check your email."
        );
        // optionally refresh selected event or events list
        fetchEvents();
      }
    } catch (err) {
      setMsg(err.message || "Registration failed");
    }
  }

  return (
    <div className="app">
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">Register for Events</h2>

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No upcoming events</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="event-card"
                  onClick={() => openRegister(ev)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="event-header">
                    <h3>{ev.title}</h3>
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="event-details">
                    <p>{ev.category}</p>
                    <p>
                      Registrations: {(ev.participants || []).length}
                      {ev.registrationMax ? ` / ${ev.registrationMax}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid #eee",
              }}
            >
              <h3>Register for: {selected.title}</h3>
              <form
                onSubmit={submitRegistration}
                style={{ display: "grid", gap: 8 }}
              >
                <input
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  placeholder="Bike (optional)"
                  value={bike}
                  onChange={(e) => setBike(e.target.value)}
                />
                <input
                  placeholder="Race number (optional)"
                  value={raceNumber}
                  onChange={(e) => setRaceNumber(e.target.value)}
                />
                <div>
                  <button className="btn btn-primary" type="submit">
                    Register
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginLeft: 8 }}
                    onClick={() => setSelected(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {msg && (
                <div style={{ marginTop: 8 }} className="alert">
                  {msg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
