// server/utils/mailer.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("MAILER VERIFY ERROR:", err);
  } else {
    console.log("MAILER transporter ready");
  }
});

module.exports = transporter;
