// server/routes/proposalRoutes.js - UPDATED

const express = require("express");
const router = express.Router();
const { proposeEvent } = require("../controllers/proposalController");

// POST /api/proposals - Create event proposal with URL instead of file upload
router.post("/", proposeEvent);

module.exports = router;
