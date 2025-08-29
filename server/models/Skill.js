const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },      // canonical: "javascript", "financial modeling"
  synonyms: [{ type: String }],                // ["js", "java script"]
  category: { type: String },                  // "Software", "Marketing", "Finance", ...
  negativeGuards: [{ type: String }],          // regex snippets to avoid false hits (e.g., for "java" -> "script")
});

skillSchema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model("Skill", skillSchema);
