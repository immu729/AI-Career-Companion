# 🧑‍💼 AI Career Companion

AI Career Companion is a full-stack web application that helps candidates compare their **Resume vs Job Description (JD)** using AI/NLP.  
It extracts skills from resumes (PDF/DOCX), matches them with JD requirements, highlights **matched vs missing skills**, and stores the results in history.  
Supports **multi-profession skills** (Software, Finance, Marketing, Design, HR, etc.) via a DB-driven skills taxonomy.

---

## ✨ Features

### 1. Core Features (MVP)
- 📂 **Resume Upload & Parsing** (PDF/DOCX → Name, Email, Phone, Skills).
- 📝 **JD Matching** → Paste JD and get a **Job-Fit Score (%)**.
- 🧩 **Skill Gap Analysis** → Matched vs Missing skills list.
- 📊 **History Dashboard** → Previous matches saved with timestamp.

### 2. Smart AI Features
- 🤖 **AI Resume Suggestions** (keywords, ATS-friendly bullet points).
- 🎯 **Learning Roadmap Generator** (based on missing skills).
- 🗣 **Mock Interview Bot** (role-specific Q&A + feedback).
- 📈 **Career Insights** (top skills, trends, personal progress).

### 3. Bonus Features
- ⚡ **One-Click Resume Tailoring** for a JD.
- 🏆 **Gamification** (badges/streaks).
- 👥 **Collaboration** (share resume feedback).
- 📑 **Export Reports** as PDF.

---

## 🛠 Tech Stack

### Frontend
- React + Vite
- Bootstrap (UI components)
- Axios (API calls)

### Backend
- Node.js + Express (API server)
- Multer (file upload)
- pdf-parse + Mammoth (resume parsing)
- Mongoose (ODM for MongoDB)

### Database
- MongoDB Atlas (skills DB + match history)

### AI / NLP
- Regex + skill dictionary (expandable for multiple professions)
- Future: embeddings/ML (semantic skill detection)

### Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Heroku
- DB: MongoDB Atlas

---

## 📂 Project Structure

ai-career-companion/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── api.js # Axios API client
│ │ └── main.jsx
│ └── vite.config.js
├── server/ # Node.js backend
│ ├── config/db.js # MongoDB connection
│ ├── models/
│ │ ├── History.js # Match history schema
│ │ └── Skill.js # Global skill dictionary schema
│ ├── seed/seedSkills.js # Seed cross-profession skills
│ └── index.js # Express app
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 18)
- MongoDB Atlas cluster
- npm or yarn

### Setup Instructions

1. **Clone repo**
   ```bash
   git clone https://github.com/your-username/ai-career-companion.git
   cd ai-career-companion
2. Install dependencies

cd client && npm install
cd ../server && npm install

3. Environment variables
Create server/.env:

MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority


Create client/.env:

VITE_API_BASE=http://localhost:5050


4. Seed skills (multi-profession)

cd server
node seed/seedSkills.js


5. Run backend

cd server
npm run dev


6. Run frontend

cd client
npm run dev


7. Open:

Frontend: http://localhost:5173

Backend: http://localhost:5050

8. 🧪 Sample Test

Resume PDF/DOCX → Upload in left panel.

JD Example (Finance):

We are hiring a Financial Analyst with strong expertise in financial modeling, valuation,
Excel, budgeting, and QuickBooks. Knowledge of compliance and due diligence preferred.


Click Compute Match → Score, matched, and missing skills will display + saved to history.

📈 Roadmap

 Add semantic search for skills (ML embeddings).

 Weight required vs optional JD skills.

 User accounts + auth.

 Admin dashboard for skills management.

 Export tailored resume.

 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss new features.

📜 License

MIT License © 2025 Sk Naid Ahmed
