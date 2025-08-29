// server/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Check server/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { dbName: "careercompanion" });
  console.log("✅ MongoDB connected");
}
module.exports = connectDB;
