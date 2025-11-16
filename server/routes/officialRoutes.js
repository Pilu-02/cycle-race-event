const express = require("express");
const router = express.Router();
const authOfficial = require("../middleware/authOfficial"); // ✅ import middleware

// console.log("officialController keys:", Object.keys(officialController));
// console.log("officialController:", officialController);

const {
  loginOfficial,
  validateTicket,
  updateResults,
} = require("../controllers/officialController");

// public
router.post("/login", loginOfficial);

// protected
router.post("/validate-ticket", authOfficial, validateTicket);
router.put("/events/:id/results", authOfficial, updateResults);

module.exports = router;
