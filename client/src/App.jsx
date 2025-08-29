import { useEffect, useState } from "react";
import { uploadResume, scoreMatch, getHistory } from "./api";

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [parsed, setParsed] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  async function refreshHistory() {
    try {
      const items = await getHistory();
      setHistory(items);
    } catch { /* ignore for now */ }
  }

  useEffect(() => { refreshHistory(); }, []);

  const handleUpload = async () => {
    try {
      setError(""); setUploadMsg(""); setParsed(null);
      setLoadingUpload(true);
      const res = await uploadResume(resumeFile);
      setUploadMsg(`✔ ${res.message} (${res.filename})`);
      setParsed({ ...res.extracted, filename: res.filename });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleScore = async () => {
    try {
      setError(""); setScoreResult(null);
      setLoadingScore(true);
      const skills = parsed?.skills || [];
      const res = await scoreMatch(jd, skills, parsed);
      setScoreResult(res);
      await refreshHistory();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Scoring failed");
    } finally {
      setLoadingScore(false);
    }
  };

  const canUpload = !!resumeFile;
  const canScore = jd.trim().length > 0;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">AI Career Companion</a>
        </div>
      </nav>

      <main className="container my-4 flex-grow-1">
        <p className="text-muted">Upload resume → extract → score vs JD → saved to history.</p>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
          <section className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Resume Upload (PDF/DOCX)</h5>
                <div className="border border-2 border-dashed rounded-3 p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="form-control"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  <small className="text-muted d-block mt-2">
                    {resumeFile ? <strong>{resumeFile.name}</strong> : "Choose PDF / DOCX"}
                  </small>
                  <button className="btn btn-primary mt-3" onClick={handleUpload}
                          disabled={!canUpload || loadingUpload}>
                    {loadingUpload ? "Uploading..." : "Upload & Parse"}
                  </button>
                  {uploadMsg && <div className="alert alert-success mt-3 py-2 mb-0">{uploadMsg}</div>}
                  {parsed && (
                    <div className="mt-3 text-start">
                      <div><strong>Name:</strong> {parsed.name || "—"}</div>
                      <div><strong>Email:</strong> {parsed.email || "—"}</div>
                      <div><strong>Phone:</strong> {parsed.phone || "—"}</div>
                      <div><strong>Skills:</strong> {parsed.skills?.join(", ") || "—"}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Paste Job Description</h5>
                <textarea
                  className="form-control"
                  rows={9}
                  placeholder="Paste the JD here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
                <button className="btn btn-success mt-3" onClick={handleScore}
                        disabled={!canScore || loadingScore}>
                  {loadingScore ? "Scoring..." : "Compute Match"}
                </button>
                {scoreResult && (
                  <div className="mt-3 text-start">
                    <span className="badge text-bg-info">Score: {scoreResult.score}%</span>
                    <div className="mt-2"><strong>JD Skills:</strong> {scoreResult.jdSkills.join(", ") || "—"}</div>
                    <div><strong>Matched:</strong> {scoreResult.matched.join(", ") || "—"}</div>
                    <div><strong>Missing:</strong> {scoreResult.missing.join(", ") || "—"}</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* History table */}
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">📊 Match History (latest 10)</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={refreshHistory}>Refresh</button>
            </div>
            <div className="table-responsive mt-3">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Resume</th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Matched</th>
                    <th>Missing</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id}>
                      <td>{new Date(h.createdAt).toLocaleString()}</td>
                      <td>{h.filename || "—"}</td>
                      <td>{h.name || "—"}</td>
                      <td><span className="badge text-bg-info">{h.score}%</span></td>
                      <td>{h.matched?.join(", ") || "—"}</td>
                      <td>{h.missing?.join(", ") || "—"}</td>
                    </tr>
                  ))}
                  {!history.length && (
                    <tr><td colSpan="6" className="text-center text-muted">No history yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className="container py-4 text-center text-muted small">
        © {new Date().getFullYear()} AI Career Companion
      </footer>
    </div>
  );
}
