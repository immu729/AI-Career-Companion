// server/index.js — DB-driven skills (all professions), Express 5 compatible
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const p = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const connectDB = require("./config/db");
const History = require("./models/History");
const Skill = require("./models/Skill"); // <-- DB skills

// 1) DB connect + load skills into memory cache
// 1) DB connect + load skills, THEN start server
(async () => {
  await connectDB();
  await loadSkills();

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT} (skills: ${SKILL_CACHE.length})`);
  });
})();


let SKILL_CACHE = []; // [{name, category, patterns:RegExp[], negatives:RegExp[] }]
function buildPatterns(item) {
  const arr = [];
  const allTerms = [item.name, ...(item.synonyms || [])]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  for (const term of allTerms) {
    // special cases to avoid false positives
    if (term === "c++") { arr.push(/\bc\+\+\b/i); continue; }
    if (term === "c")   { arr.push(/\bc\b(?!\+\+)/i); continue; }
    if (term === "java"){ arr.push(/\bjava\b(?!\s*script)/i); continue; }
    if (term === "javascript"){ arr.push(/\bjavascript\b/i, /\bjs\b/i); continue; }
    if (term === "typescript"){ arr.push(/\btypescript\b/i, /\bts\b/i); continue; }
    if (term === "node.js" || term === "nodejs"){ arr.push(/\bnode\.?js\b/i); continue; }
    if (term === "next.js" || term === "nextjs"){ arr.push(/\bnext\.?js\b/i); continue; }
    if (term === "mongodb" || term === "mongo db"){ arr.push(/\bmongo\s?db\b/i); continue; }
    if (term === "rest api"){ arr.push(/\brest\s*api\b/i); continue; }

    // generic: optional dots/spaces, word boundaries
    const esc = term.replace(/\./g, "\\.?").replace(/\s+/g, "\\s*");
    arr.push(new RegExp(`\\b${esc}\\b`, "i"));
  }

  const negatives = (item.negativeGuards || []).map((g) => new RegExp(g, "i"));
  return { patterns: arr, negatives };
}

async function loadSkills() {
  const docs = await Skill.find({});
  SKILL_CACHE = docs.map((d) => {
    const { patterns, negatives } = buildPatterns(d);
    return {
      name: d.name,
      category: d.category || "General",
      patterns,
      negatives,
    };
  });
  console.log(`🔎 Loaded ${SKILL_CACHE.length} skills into cache`);
}

// kick off initial load after connection is ready
loadSkills().catch(console.error);

// 2) App init
const app = express();
const PORT = 5050;

// 3) Middlewares
app.use(cors({ origin: true, credentials: true })); // dev-friendly
app.use(express.json());

// 4) Upload config
const upload = multer({ dest: "uploads/" });

// ---------- helpers ----------
function cleanText(t = "") {
  return t.replace(/\r/g, " ").replace(/\t/g, " ").replace(/\s+/g, " ").trim();
}
function extractEmail(text) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : null;
}
function extractPhone(text) {
  const m = text.match(/(\+?91[-\s]*)?[6-9]\d{9}/);
  return m ? m[0] : null;
}
function extractSkills(text) {
  const found = new Set();
  for (const s of SKILL_CACHE) {
    // (optional) if any negative guard matches the nearby context, you could skip
    if (s.patterns.some((re) => re.test(text))) found.add(s.name);
  }
  return Array.from(found).sort();
}
function guessName(text) {
  const lines = text.split(/\n|\. {2,}/).map((l) => l.trim()).filter(Boolean);
  for (const ln of lines.slice(0, 8)) {
    if (extractEmail(ln) || extractPhone(ln)) continue;
    const words = ln.split(/\s+/);
    const ok = words.length >= 2 && words.length <= 4 && /^[A-Za-z .'-]+$/.test(ln);
    if (ok) return ln.replace(/\s+/g, " ");
  }
  return null;
}

// ---------- routes ----------
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Backend is running ✅", port: PORT, skillsLoaded: SKILL_CACHE.length });
});

// (admin-ish) reload skills cache after you edit DB/seed
app.post("/skills/reload", async (_req, res) => {
  await loadSkills();
  res.json({ ok: true, count: SKILL_CACHE.length });
});

// list skills (for debug/admin UI)
app.get("/skills", async (_req, res) => {
  res.json(SKILL_CACHE.map(s => ({ name: s.name, category: s.category })));
});

app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  console.log("HIT /parse-resume", new Date().toISOString());
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = p.join(__dirname, req.file.path);
    const ext = (p.extname(req.file.originalname) || "").toLowerCase();

    let rawText = "";
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdf = await pdfParse(dataBuffer);
      rawText = pdf.text || "";
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value || "";
    } else {
      fs.unlinkSync(filePath);
      return res.status(415).json({ error: "Only PDF or DOCX supported for now" });
    }

    fs.unlinkSync(filePath);

    const text = cleanText(rawText);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const name = guessName(rawText);
    const skills = extractSkills(text);

    res.json({
      message: "Parsed successfully",
      filename: req.file.originalname,
      extracted: { name, email, phone, skills },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Parsing failed", details: String(err.message || err) });
  }
});

app.post("/score-match", async (req, res) => {
  const { jd, resumeSkills, parsed } = req.body || {};
  if (!jd) return res.status(400).json({ error: "No JD provided" });

  const jdSkills = extractSkills(jd.toLowerCase());
  const resumeSet = new Set((resumeSkills || []).map((s) => s.toLowerCase()));
  const matched = jdSkills.filter((s) => resumeSet.has(s.toLowerCase()));
  const missing = jdSkills.filter((s) => !resumeSet.has(s.toLowerCase()));
  const total = jdSkills.length || 1;
  const score = Math.round((matched.length / total) * 100);

  const record = await History.create({
    filename: parsed?.filename || null,
    name: parsed?.name || null,
    email: parsed?.email || null,
    phone: parsed?.phone || null,
    skills: resumeSkills || [],
    jd,
    matched,
    missing,
    score,
  });

  res.json({ id: record._id, score, matched, missing, jdSkills });
});

app.get("/history", async (_req, res) => {
  const items = await History.find().sort({ createdAt: -1 }).limit(10);
  res.json(items);
});

// ---------- start ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
