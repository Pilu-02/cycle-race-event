// server/controllers/eventController.js
const Event = require("../models/Events");
const crypto = require("crypto");
const qrcode = require("qrcode");
const transporter = require("../utils/mailer"); // recommended shared transporter

exports.buyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // create a unique ticket code
    const ticketCode = crypto.randomBytes(6).toString("hex"); // 12 chars hex

    const ticketObj = {
      code: ticketCode,
      email,
      purchasedAt: new Date(),
      used: false,
    };

    // Atomic reservation: increment ticketsSold only if ticketsSold < (ticketsAvailable || capacityA)
    // Use $ifNull in $expr to fallback missing fields:
    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        $expr: {
          $lt: [
            { $ifNull: ["$ticketsSold", 0] }, // treat missing ticketsSold as 0
            { $ifNull: ["$ticketsAvailable", "$capacityA"] }, // fallback to capacityA
          ],
        },
      },
      {
        $inc: { ticketsSold: 1 },
        $push: { tickets: ticketObj },
        $setOnInsert: {}, // optional
      },
      { new: true }
    ).lean(); // lean() gives plain object (optional)

    if (!event) {
      return res
        .status(400)
        .json({ error: "Tickets sold out or event not found" });
    }

    // Generate QR data URL (pack eventId + code)
    const qrPayload = JSON.stringify({ eventId: id, code: ticketCode });
    const qrDataUrl = await qrcode.toDataURL(qrPayload);

    // Send email with ticket & QR (use transporter). If email fails, still return reserved ticket.
    try {
      if (!transporter || typeof transporter.sendMail !== "function") {
        console.warn("Mailer transporter not configured; skipping email send.");
      } else {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: `Your ticket for ${event.title || "Event"}`,
          html: `
            <p>Hi,</p>
            <p>Thanks for booking a ticket for <b>${event.title || ""}</b> (${
            event.date ? new Date(event.date).toLocaleDateString() : ""
          }).</p>
            <p><b>Ticket code:</b> ${ticketCode}</p>
            <p>Show this QR code at the gate:</p>
            <img src="${qrDataUrl}" alt="QR" />
            <p>— Event Management</p>
          `,
        });
      }
    } catch (mailErr) {
      console.error("Ticket email send failed:", mailErr);
      // don't rollback reservation; inform client
      return res.status(200).json({
        warning: "Ticket reserved but email failed",
        ticketCode,
        qrDataUrl,
      });
    }

    // success
    return res.status(200).json({ ticketCode, qrDataUrl, event });
  } catch (err) {
    console.error("buyTicket error:", err);
    return res.status(500).json({ error: "Could not process purchase" });
  }
};

//new part
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params; // event id
    const { email, name, bike, raceNumber } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // Check event exists + registration open + capacity (atomic attempt)
    // We push to participants only if email not already present,
    // and if registrationOpen = true and (registrationMax == 0 || participants.length < registrationMax)
    const filter = {
      _id: id,
      registrationOpen: true,
      $expr: {
        $lt: [
          { $size: { $ifNull: ["$participants", []] } },
          { $ifNull: ["$registrationMax", Infinity] },
        ],
      },
      "participants.email": { $ne: email }, // ensure same email not present
    };

    const participantObj = {
      name: name || "",
      email,
      bike: bike || "",
      raceNumber: raceNumber || null,
      registeredAt: new Date(),
    };

    const updated = await Event.findOneAndUpdate(
      filter,
      { $push: { participants: participantObj } },
      { new: true }
    ).lean();

    if (!updated) {
      // determine reason: event missing, closed, full, or already registered
      const ev = await Event.findById(id).lean();
      if (!ev) return res.status(404).json({ error: "Event not found" });
      // check if email already registered
      const already = (ev.participants || []).some(
        (p) => String(p.email).toLowerCase() === String(email).toLowerCase()
      );
      if (already)
        return res
          .status(400)
          .json({ error: "This email is already registered for the event" });
      if (!ev.registrationOpen)
        return res
          .status(400)
          .json({ error: "Registration is closed for this event" });
      if (
        ev.registrationMax &&
        (ev.participants || []).length >= ev.registrationMax
      )
        return res.status(400).json({ error: "Event registration is full" });
      // fallback
      return res
        .status(400)
        .json({ error: "Could not register for unknown reason" });
    }

    // send confirmation email (best-effort)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Registration confirmed: ${updated.title}`,
        html: `
          <p>Hi ${participantObj.name || ""},</p>
          <p>Your registration for <b>${updated.title}</b> on ${
          updated.date ? new Date(updated.date).toLocaleDateString() : ""
        } is confirmed.</p>
          <p>Details:</p>
          <ul>
            <li>Event: ${updated.title}</li>
            <li>Date: ${
              updated.date ? new Date(updated.date).toLocaleString() : ""
            }</li>
            <li>Registered with: ${email}</li>
          </ul>
          <p>Good luck!</p>
        `,
      });
    } catch (mailErr) {
      console.error("Registration email failed:", mailErr);
      // still return success but inform client
      return res
        .status(200)
        .json({
          registered: true,
          warning: "Registered but confirmation email failed",
        });
    }

    return res.status(200).json({ registered: true, eventId: updated._id });
  } catch (err) {
    console.error("registerForEvent error:", err);
    return res.status(500).json({ error: "Could not register" });
  }
};

// ---------- Get results for an event (public) ----------
exports.getResults = async (req, res) => {
  try {
    const { id } = req.params;
    const ev = await Event.findById(id).select("title date results").lean();
    if (!ev) return res.status(404).json({ error: "Event not found" });
    // ensure results sorted by position
    ev.results = (ev.results || []).sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
    return res.json({ event: ev });
  } catch (err) {
    console.error("getResults error:", err);
    return res.status(500).json({ error: "Could not fetch results" });
  }
};

// ---------- Leaderboard update (official-only) ----------
exports.updateLeaderboard = async (req, res) => {
  try {
    const official = req.user; // authOfficial must populate req.user with role and id
    if (!official) return res.status(401).json({ error: "Unauthorized" });
    if (official.role !== "leaderboard_official")
      return res
        .status(403)
        .json({ error: "Only leaderboard officials can update results" });

    const { id } = req.params;
    const { results } = req.body;
    if (!Array.isArray(results))
      return res.status(400).json({ error: "results array required" });

    // sanitize & ensure positions are numbers
    const sanitized = results.map((r, idx) => ({
      position: Number(r.position ?? r.rank ?? idx + 1),
      name: r.name || "",
      time: r.time || "",
      riderId: r.riderId || r.userEmail || "",
      notes: r.notes || "",
    }));

    const ev = await Event.findByIdAndUpdate(
      id,
      { $set: { results: sanitized } },
      { new: true }
    ).lean();
    if (!ev) return res.status(404).json({ error: "Event not found" });

    return res.json({ updated: true, results: ev.results });
  } catch (err) {
    console.error("updateLeaderboard error:", err);
    return res.status(500).json({ error: "Could not update leaderboard" });
  }
};
