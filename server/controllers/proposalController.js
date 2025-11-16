// server/controllers/proposalController.js - UPDATED for URL instead of file upload

const Event = require("../models/Events");

exports.proposeEvent = async (req, res) => {
  try {
    const {
      title,
      club,
      email,
      category,
      capacityP,
      capacityA,
      date,
      fileUrl,
    } = req.body;

    // Validation
    if (
      !title ||
      !club ||
      !email ||
      !category ||
      !capacityP ||
      !capacityA ||
      !date
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: title, club, email, category, capacityP, capacityA, date",
      });
    }

    // Create new event with status "pending"
    const newEvent = new Event({
      title,
      club,
      email,
      category,
      capacityP: parseInt(capacityP),
      capacityA: parseInt(capacityA),
      date,
      fileUrl: fileUrl || "", // Store the URL or empty string if not provided
      status: "pending", // Will be approved by coordinator
      createdAt: new Date(),
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event proposal submitted successfully!",
      event: savedEvent,
    });
  } catch (err) {
    console.error("Proposal error:", err);
    res
      .status(500)
      .json({ error: err.message || "Could not create event proposal" });
  }
};
