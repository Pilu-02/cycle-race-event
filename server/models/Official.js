const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const officialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true, unique: true }, // login id
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["leaderboard_official", "ticket_validator"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// password hashing
officialSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

officialSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Official", officialSchema);
