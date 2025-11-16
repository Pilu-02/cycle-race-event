const mongoose = require("mongoose");
const Coordinator = require("./models/Coordinator");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const coordinator = new Coordinator({
      userId: "coordinator",
      password: "password123",
      name: "Event Coordinator",
    });
    await coordinator.save();
    console.log("✅ Coordinator created!");
    process.exit();
  })
  .catch((err) => console.error(err));
