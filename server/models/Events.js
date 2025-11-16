const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  // Beginning of new portion added

  ticketsAvailable: { type: Number, default: 0 }, // initial viewers count
  ticketsSold: { type: Number, default: 0 },
  tickets: [
    {
      code: String, // unique ticket code / QR payload
      email: String,
      used: { type: Boolean, default: false },
      purchasedAt: Date,
    },
  ],
  participants: [
    {
      name: String,
      email: String,
      raceNumber: Number,
      bike: String,
      registeredAt: Date,
    },
  ],
  registrationOpen: { type: Boolean, default: true },
  registrationMax: { type: Number, default: 0 }, // usually capacityP
  results: [{ position: Number, name: String, time: String, riderId: String }],

  // end of new portion added

  title: {
    type: String,
    required: true,
    trim: true,
  },
  club: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["2k", "5k", "10k", "20k", "50k", "Other"],
  },
  capacityP: {
    type: Number,
    required: true,
    min: 5,
  },
  capacityA: {
    type: Number,
    required: true,
    min: 50,
  },
  date: {
    type: Date,
    required: true,
  },
  fileUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
  declineReason: { type: String, trim: true },
  submittedAt: {
    type: Date,
    default: Date.now,
  },

  //step 4
  ticketsAvailable: { type: Number, default: 0 }, // total viewer tickets allowed
  ticketsSold: { type: Number, default: 0 },
  tickets: [
    {
      code: { type: String },
      email: { type: String },
      used: { type: Boolean, default: false },
      purchasedAt: { type: Date, default: Date.now },
    },
  ],
  // participants and registration fields if not already added:
  participants: [
    {
      name: String,
      email: String,
      raceNumber: Number,
      bike: String,
      registeredAt: Date,
    },
  ],
  registrationOpen: { type: Boolean, default: true },
  registrationMax: { type: Number, default: 0 },
  results: [{ position: Number, name: String, time: String, riderId: String }],
});

module.exports = mongoose.model("Event", eventSchema);
