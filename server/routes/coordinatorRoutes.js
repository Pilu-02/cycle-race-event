const express = require("express");
const router = express.Router();
const {
  login,
  getPendingEvents,
  updateEventStatus,
} = require("../controllers/coordinatorController");

const {
  createOfficial,
  deleteOfficial,
  listOfficials,
} = require("../controllers/officialController");
const authCoordinator = require("../middleware/authCoordinator");

// POST /api/coordinator/login - Coordinator login
router.post("/login", login);

// GET /api/coordinator/events/pending - Get pending events
router.get("/events/pending", getPendingEvents);

// PUT /api/coordinator/events/:id/status - Update event status
router.put("/events/:id/status", updateEventStatus);

//added latest
router.post("/officials", authCoordinator, createOfficial);
router.get("/officials", authCoordinator, listOfficials);
router.delete("/officials/:id", authCoordinator, deleteOfficial);

module.exports = router;
