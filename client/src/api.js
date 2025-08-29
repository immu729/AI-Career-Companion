import axios from "axios";



const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });
console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);

export async function uploadResume(file) {
  const form = new FormData();
  form.append("resume", file);
  // ⚠️ no custom headers; axios will set boundary automatically
  const { data } = await api.post("/parse-resume", form);
  return data;
}


export async function scoreMatch(jd, resumeSkills = [], parsed = null) {
  const { data } = await api.post("/score-match", { jd, resumeSkills, parsed });
  return data;
}

export async function getHistory() {
  const { data } = await api.get("/history");
  return data;
}
