import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ResultsSection from "./components/ResultsSection";
import DocsPage from "./components/DocsPage";

function App() {
  const [page, setPage] = useState("home");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesUpload = (files) => {
    const incoming = Array.from(files);
    setUploadedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const deduped = incoming.filter((f) => !existing.has(f.name));
      return [...prev, ...deduped];
    });
    setReport(null);
  };

  const handleRemoveFile = (name) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name));
    setReport(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // convert files to base64
      const filePayloads = await Promise.all(
        uploadedFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  file_base64: reader.result.split(",")[1],
                  file_name: file.name,
                  file_type: file.type,
                });
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );

      // send to backend
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: filePayloads }),
        },
      );

      // check for server error
      if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
          const err = await res.json();
          detail = err.detail || detail;
        } catch {}
        throw new Error(detail);
      }

      // store report
      const data = await res.json();
      if (!data.phase_1_output || !data.phase_2_analysis) {
        throw new Error(
          "Server returned an unexpected response. Please try again.",
        );
      }
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10]">
      <Navbar page={page} onNavigate={setPage} />
      {page === "docs" ? (
        <DocsPage />
      ) : (
        <>
          <HeroSection
            uploadedFiles={uploadedFiles}
            onFilesUpload={handleFilesUpload}
            onAnalyze={handleAnalyze}
            onRemoveFile={handleRemoveFile}
            loading={loading}
          />
          {error && (
            <div className="max-w-4xl mx-auto px-6">
              <p className="font-mono text-sm text-[#ef4444] border border-[#ef4444]/30 rounded px-4 py-3 bg-[#ef4444]/5">
                {error}
              </p>
            </div>
          )}
          {report && <ResultsSection report={report} />}
        </>
      )}
    </div>
  );
}

export default App;
