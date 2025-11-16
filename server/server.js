const express = require("express");
const dotenv = require("dotenv");

// ✅ Load env FIRST
dotenv.config();
const eventRoutes = require("./routes/eventRoutes");
const cors = require("cors");
const connectDB = require("./config/db");

// Require routes only AFTER env is loaded
const proposalRoutes = require("./routes/proposalRoutes");
const coordinatorRoutes = require("./routes/coordinatorRoutes");
const officialRoutes = require("./routes/officialRoutes"); //added latest

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/events", eventRoutes); // step 4

app.get("/", (req, res) => {
  res.send("Event Management API is running...");
});

app.use("/api/proposals", proposalRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/officials", officialRoutes); // added latest

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
