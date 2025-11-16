require("dotenv").config();
const Event = require("../models/Events");
const Coordinator = require("../models/Coordinator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const transporter = require("../utils/mailer");
console.log(">>> EMAIL_USER =", process.env.EMAIL_USER);
console.log(
  ">>> EMAIL_PASS =",
  process.env.EMAIL_PASS ? "(exists)" : "(NOT exists)"
);
console.log(">>> NODE_ENV =", process.env.NODE_ENV);

// -------------------- MAIL TRANSPORTER --------------------
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// -------------------- LOGIN --------------------
const login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const coordinator = await Coordinator.findOne({ userId });
    if (!coordinator)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await coordinator.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: coordinator._id, userId: coordinator.userId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      coordinator: {
        userId: coordinator.userId,
        name: coordinator.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// -------------------- GET PENDING EVENTS --------------------
const getPendingEvents = async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: "pending" }).sort({
      submittedAt: -1,
    });
    res.status(200).json(pendingEvents);
  } catch (error) {
    console.error("Error fetching pending events:", error);
    res.status(500).json({ error: "Failed to fetch pending events" });
  }
};

// -------------------- UPDATE STATUS + EMAIL --------------------
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const update = { status };
    if (status === "declined" && reason) update.declineReason = reason;

    const event = await Event.findByIdAndUpdate(id, update, { new: true });
    if (!event) return res.status(404).json({ error: "Event not found" });

    // send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: event.email,
        subject:
          status === "approved"
            ? `Your event "${event.title}" is APPROVED`
            : `Your event "${event.title}" is DECLINED`,
        html:
          status === "approved"
            ? `<p>Your event <b>${event.title}</b> has been approved ✅</p>`
            : `<p>Your event <b>${event.title}</b> has been declined ❌</p>
               <p><b>Reason:</b> ${reason}</p>`,
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
    }

    res.status(200).json({ message: `Event ${status} successfully`, event });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({ error: "Failed to update event status" });
  }
};

// -------------------- EXPORT ALL THREE --------------------
module.exports = { login, getPendingEvents, updateEventStatus };
