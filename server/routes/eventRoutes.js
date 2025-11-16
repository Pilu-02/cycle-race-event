// server/routes/eventRoutes.js (GET /api/events)

const express = require("express");
const router = express.Router();
const Event = require("../models/Events");
const { buyTicket } = require("../controllers/eventController");
const {
  registerForEvent,
  getResults,
  updateLeaderboard,
} = require("../controllers/eventController");
const authOfficial = require("../middleware/authOfficial"); // must exist

router.post("/:id/tickets/buy", buyTicket);
router.post("/:id/register", registerForEvent);
router.get("/:id/results", getResults);
router.put("/:id/leaderboard", authOfficial, updateLeaderboard);

// IMPORTANT: This route MUST be AFTER the /:id routes!
// Otherwise, it will try to match "results" as an ID
router.get("/", async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const events = await Event.find(filter).sort({ date: 1 }).lean();

    const normalized = events.map((ev) => ({
      ...ev,
      ticketsAvailable:
        ev.ticketsAvailable != null ? ev.ticketsAvailable : ev.capacityA || 0,
      ticketsSold: ev.ticketsSold || 0,
    }));

    res.json({ events: normalized });
  } catch (err) {
    console.error("GET /api/events error:", err);
    res.status(500).json({ error: "Could not fetch events" });
  }
});

module.exports = router;
