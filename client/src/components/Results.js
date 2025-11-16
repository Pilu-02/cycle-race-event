// Results.js
import React, { useEffect, useState } from "react";

export default function Results() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/events?status=approved`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(console.error);
  }, []);

  async function openResults(ev) {
    try {
      const res = await fetch(`${API}/api/events/${ev._id}/results`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not load results");
        return;
      }
      setSelected(data.event);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="app">
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">Event Results</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {events.map((ev) => (
              <div key={ev._id} className="event-card">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <h3>{ev.title}</h3>
                    <div>{new Date(ev.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => openResults(ev)}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ marginTop: 16 }}>
              <h3>Results for {selected.title}</h3>
              {!selected.results || selected.results.length === 0 ? (
                <p>No results posted yet</p>
              ) : (
                <ol>
                  {selected.results.map((r, idx) => (
                    <li key={idx}>
                      <strong>#{r.position}</strong> {r.name}{" "}
                      {r.time ? `— ${r.time}` : ""}{" "}
                      {r.riderId ? `(${r.riderId})` : ""}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
