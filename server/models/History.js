// server/models/History.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  filename: String,
  name: String,
  email: String,
  phone: String,
  skills: [String],
  jd: String,
  matched: [String],
  missing: [String],
  score: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", historySchema);
