// server/middleware/authCoordinator.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Coordinator = require("../models/Coordinator");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

module.exports = async function authCoordinator(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization || "";
    if (!auth)
      return res.status(401).json({ error: "Missing Authorization header" });

    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // confirm coordinator exists (optional but recommended)
    const coordinator = await Coordinator.findById(payload.id).select(
      "userId name"
    );
    if (!coordinator)
      return res.status(401).json({ error: "Coordinator not found" });

    req.user = {
      id: coordinator._id,
      userId: coordinator.userId,
      name: coordinator.name,
    };
    next();
  } catch (err) {
    console.error("authCoordinator error:", err);
    res.status(500).json({ error: "Auth middleware failure" });
  }
};
