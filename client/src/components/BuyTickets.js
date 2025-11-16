import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BuyTickets() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  async function fetchApprovedEvents() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/events?status=approved`); // you can implement filter server-side
      setEvents(res.data.events || res.data); // adapt to your response shape
    } catch (err) {
      setError("Could not load events");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(eventId) {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setBuyingId(eventId);
    setError("");
    setTicketInfo(null);
    try {
      const res = await axios.post(`${API}/api/events/${eventId}/tickets/buy`, {
        email,
      });
      setTicketInfo({ ...res.data, eventId });
    } catch (err) {
      setError(err.response?.data?.error || "Purchase failed");
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="app">
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">Buy Tickets</h2>

          <div style={{ marginBottom: 12 }}>
            <label>Your email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No approved events available</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {events.map((ev) => {
                const left =
                  (ev.ticketsAvailable || ev.capacityA || 0) -
                  (ev.ticketsSold || 0);
                return (
                  <div key={ev._id} className="event-card">
                    <div className="event-header">
                      <h3>{ev.title}</h3>
                      <span className="event-category">{ev.category}</span>
                    </div>
                    <div className="event-details">
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(ev.date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Tickets left:</strong> {left}
                      </p>
                    </div>
                    <div className="event-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleBuy(ev._id)}
                        disabled={left <= 0 || buyingId === ev._id}
                      >
                        {buyingId === ev._id
                          ? "Buying..."
                          : left <= 0
                          ? "Sold out"
                          : "Buy Ticket"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {ticketInfo && (
            <div style={{ marginTop: 16 }}>
              <h3>Ticket reserved!</h3>
              <p>
                <strong>Code:</strong> {ticketInfo.ticketCode}
              </p>
              {ticketInfo.qrDataUrl && (
                <img
                  src={ticketInfo.qrDataUrl}
                  alt="ticket-qr"
                  style={{ maxWidth: 200 }}
                />
              )}
              <p>We also sent this ticket to your email.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
