// controllers/officialController.js
const Official = require("../models/Official");
const jwt = require("jsonwebtoken");
const Event = require("../models/Events");

// Helper: create JWT
function signToken(payload) {
  const secret = process.env.JWT_SECRET || "devsecret"; // prefer setting JWT_SECRET in .env
  const opts = { expiresIn: "8h" };
  return jwt.sign(payload, secret, opts);
}

// Create an official (Coordinator only)
exports.createOfficial = async (req, res) => {
  try {
    const { name, userId, password, role } = req.body;

    if (!name || !userId || !password || !role) {
      return res
        .status(400)
        .json({ error: "name, userId, password and role are required" });
    }
    if (!["leaderboard_official", "ticket_validator"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // check duplicate userId
    const existing = await Official.findOne({ userId });
    if (existing)
      return res.status(409).json({ error: "userId already exists" });

    const official = await Official.create({ name, userId, password, role });
    // return safe fields only
    res.status(201).json({
      official: {
        id: official._id,
        name: official.name,
        userId: official.userId,
        role: official.role,
      },
    });
  } catch (err) {
    console.error("createOfficial error:", err);
    res.status(500).json({ error: "Could not create official" });
  }
};

// Delete an official by id (Coordinator only)
exports.deleteOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const official = await Official.findByIdAndDelete(id);
    if (!official) return res.status(404).json({ error: "Official not found" });
    res.json({ message: "Official deleted" });
  } catch (err) {
    console.error("deleteOfficial error:", err);
    res.status(500).json({ error: "Could not delete official" });
  }
};

// List all officials (Coordinator only)
exports.listOfficials = async (req, res) => {
  try {
    const officials = await Official.find().select(
      "name userId role createdAt"
    );
    res.json({ officials });
  } catch (err) {
    console.error("listOfficials error:", err);
    res.status(500).json({ error: "Could not fetch officials" });
  }
};

/* -------------------------
   NEW: Login for officials
   ------------------------- */
exports.loginOfficial = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ error: "userId and password required" });
    }

    const official = await Official.findOne({ userId });
    if (!official)
      return res.status(401).json({ error: "Invalid credentials" });

    const ok = await official.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: official._id, role: official.role });
    res.json({
      token,
      official: {
        id: official._id,
        name: official.name,
        userId: official.userId,
        role: official.role,
      },
    });
  } catch (err) {
    console.error("loginOfficial error:", err);
    res.status(500).json({ error: "Could not login" });
  }
};

/* -------------------------
   NEW: Validate ticket (protected)
   - Example: expects { ticketId } in body
   - Real implementation should connect to your ticket DB / logic
   ------------------------- */
exports.validateTicket = async (req, res) => {
  try {
    // req.user will be set by authOfficial middleware
    const actor = req.user || { id: "unknown", role: "unknown" };

    let { ticketId, qrPayload } = req.body;

    // support qrPayload (JSON string or object) or ticketId
    if (!ticketId && qrPayload) {
      if (typeof qrPayload === "string") {
        try {
          const parsed = JSON.parse(qrPayload);
          ticketId = parsed.code || parsed.ticketCode || parsed.code;
          // optionally eventId = parsed.eventId
        } catch (err) {
          // ignore parse error — will treat as invalid later
        }
      } else if (typeof qrPayload === "object") {
        ticketId = qrPayload.code || qrPayload.ticketCode;
      }
    }

    if (!ticketId)
      return res.status(400).json({ error: "ticketId or qrPayload required" });

    // Atomic operation: find an event containing a ticket with this code which is still unused,
    // and mark that ticket's used status true.
    //
    // We use the positional $ operator in the update and check tickets.used: false in the filter
    // so this is atomic and prevents double redemption.
    const filter = { "tickets.code": ticketId, "tickets.used": false };
    const update = {
      $set: {
        "tickets.$.used": true,
        "tickets.$.validatedBy": actor.id,
        "tickets.$.validatedAt": new Date(),
      },
    };
    // findOneAndUpdate returns the document BEFORE update by default; use { new: true } to get after update
    const updatedEvent = await Event.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (updatedEvent) {
      // found and marked as used -> valid
      return res.json({
        ticketId,
        valid: true,
        message: "Ticket validated and marked used",
        eventId: updatedEvent._id,
        actor,
      });
    }

    // If not found by unused filter, check if ticket exists but already used
    const already = await Event.findOne({
      "tickets.code": ticketId,
      "tickets.used": true,
    }).lean();
    if (already) {
      return res.json({
        ticketId,
        valid: false,
        reason: "already_used",
        message: "Ticket was already used",
      });
    }

    // not found at all
    return res
      .status(404)
      .json({
        ticketId,
        valid: false,
        reason: "not_found",
        message: "Ticket not found",
      });
  } catch (err) {
    console.error("validateTicket error:", err);
    return res.status(500).json({ error: "Could not validate ticket" });
  }
};

/* -------------------------
   NEW: Update results for an event (protected)
   - Example: PUT /events/:id/results with body { results: [...] }
   - You should replace placeholder logic with your event model update
   ------------------------- */
exports.updateResults = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { results } = req.body;
    if (!eventId || !results) {
      return res
        .status(400)
        .json({ error: "event id and results are required" });
    }

    // TODO: Replace with real event model update e.g.
    // await Event.findByIdAndUpdate(eventId, { results }, { new: true });

    // Placeholder response
    res.json({
      eventId,
      updated: true,
      resultsReceived: results,
    });
  } catch (err) {
    console.error("updateResults error:", err);
    res.status(500).json({ error: "Could not update results" });
  }
};
