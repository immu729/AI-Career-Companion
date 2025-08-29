const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Skill = require("../models/Skill");

// helper
async function upsert(name, synonyms = [], category = "", negativeGuards = []) {
  name = name.toLowerCase();
  synonyms = (synonyms || []).map(s => s.toLowerCase());
  await Skill.updateOne(
    { name },
    { $set: { name, synonyms, category, negativeGuards } },
    { upsert: true }
  );
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "careercompanion" });

  // ---- Software/IT ----
  await upsert("javascript", ["js"], "Software");
  await upsert("java", [], "Software", ["script"]); // avoid "javascript"
  await upsert("c", [], "Software", ["\\+\\+"]);    // avoid c++
  await upsert("c++", ["cpp"], "Software");
  await upsert("react", [], "Software");
  await upsert("node.js", ["nodejs", "node"], "Software");
  await upsert("express", [], "Software");
  await upsert("mongodb", ["mongo db", "mongo"], "Software");
  await upsert("sql", [], "Software");
  await upsert("python", [], "Software");
  await upsert("kotlin", [], "Software");
  await upsert("aws", ["amazon web services"], "Software");
  await upsert("docker", [], "Software");
  await upsert("git", [], "Software");
  await upsert("data structures", ["ds", "dsa"], "Software");
  await upsert("algorithms", [], "Software");

  // ---- Data/AI ----
  await upsert("machine learning", ["ml"], "Data");
  await upsert("deep learning", [], "Data");
  await upsert("pandas", [], "Data");
  await upsert("numpy", [], "Data");
  await upsert("power bi", ["powerbi"], "Data");
  await upsert("tableau", [], "Data");
  await upsert("sql", [], "Data"); // also relevant

  // ---- Marketing ----
  await upsert("seo", ["search engine optimization"], "Marketing");
  await upsert("sem", ["search engine marketing"], "Marketing");
  await upsert("content marketing", [], "Marketing");
  await upsert("social media marketing", ["smm"], "Marketing");
  await upsert("email marketing", [], "Marketing");
  await upsert("google analytics", ["ga4"], "Marketing");
  await upsert("meta ads", ["facebook ads"], "Marketing");
  await upsert("tiktok ads", [], "Marketing");
  await upsert("copywriting", [], "Marketing");

  // ---- Sales/Business ----
  await upsert("crm", ["salesforce", "hubspot"], "Sales");
  await upsert("lead generation", ["lead gen"], "Sales");
  await upsert("negotiation", [], "Sales");
  await upsert("account management", [], "Sales");
  await upsert("b2b sales", [], "Sales");
  await upsert("cold calling", [], "Sales");

  // ---- Finance ----
  await upsert("financial modeling", ["three statement model"], "Finance");
  await upsert("valuation", ["dcf", "comps"], "Finance");
  await upsert("excel", ["microsoft excel"], "Finance");
  await upsert("tally", [], "Finance");
  await upsert("quickbooks", [], "Finance");
  await upsert("budgeting", [], "Finance");

  // ---- HR ----
  await upsert("talent acquisition", ["technical recruiting"], "HR");
  await upsert("ats", ["applicant tracking system"], "HR");
  await upsert("onboarding", [], "HR");
  await upsert("employee engagement", [], "HR");

  // ---- Design/Creative ----
  await upsert("ui design", ["ui"], "Design");
  await upsert("ux research", ["ux"], "Design");
  await upsert("figma", [], "Design");
  await upsert("adobe photoshop", ["photoshop"], "Design");
  await upsert("illustrator", ["adobe illustrator", "ai"], "Design");

  // ---- Healthcare ----
  await upsert("patient counseling", [], "Healthcare");
  await upsert("clinical documentation", [], "Healthcare");
  await upsert("emt", ["emergency medical technician"], "Healthcare");
  await upsert("phlebotomy", [], "Healthcare");

  // ---- Education ----
  await upsert("lesson planning", [], "Education");
  await upsert("curriculum development", [], "Education");
  await upsert("classroom management", [], "Education");
  await upsert("assessment design", [], "Education");

  // ---- Legal ----
  await upsert("contract drafting", [], "Legal");
  await upsert("legal research", [], "Legal");
  await upsert("due diligence", [], "Legal");
  await upsert("compliance", [], "Legal");

  console.log("✅ Skills seeded");
  await mongoose.disconnect();
  process.exit(0);
})();
