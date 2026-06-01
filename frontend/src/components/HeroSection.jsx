import { useRef, useState } from "react";

function FileIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-[#4b5563] mx-auto mb-3"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  );
}

export default function HeroSection({
  uploadedFiles,
  onFilesUpload,
  onAnalyze,
  onRemoveFile,
  loading,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (loading) return;
    if (e.dataTransfer.files.length) onFilesUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    if (e.target.files.length) onFilesUpload(e.target.files);
    e.target.value = "";
  };

  const hasFiles = uploadedFiles.length > 0;

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-[#4b5563] tracking-widest uppercase mb-6 flex items-center gap-3">
        <span className="block w-8 h-px bg-[#4b5563]" />
        Pre-Production Review Engine
      </p>

      <h1 className="font-sans text-5xl font-bold leading-tight text-[#f9fafb] mb-2 tracking-tight">
        Catch what gets missed.
      </h1>
      <h1 className="font-sans text-5xl font-bold leading-tight text-[#4ade80] mb-6 tracking-tight">
        Before the cut.
      </h1>

      <p className="text-[#6b7280] text-lg leading-relaxed mb-10 max-w-2xl">
        Upload any engineering drawing. Traces tolerance stacks, validates
        GD&amp;T datums, flags weld callouts. Structured report in minutes, not
        days.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border border-dashed rounded-lg p-12 text-center transition-colors duration-200 cursor-pointer ${
          dragging
            ? "border-[#4ade80] bg-[#4ade80]/5"
            : "border-[#2e3038] hover:border-[#4b5563]"
        }`}
      >
        <FileIcon />
        <p className="font-mono text-sm text-[#9ca3af] mb-1">
          Drop drawings here or click to upload
        </p>
        <p className="font-mono text-xs text-[#4b5563]">
          PDF · PNG · JPG — up to 50 MB each
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* File list */}
      {hasFiles && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between bg-[#1a1c23] border border-[#2e3038] rounded px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#6b7280] shrink-0"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="font-mono text-xs text-[#9ca3af] truncate">
                  {file.name}
                </span>
                <span className="font-mono text-xs text-[#4b5563] shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(file.name);
                }}
                className="text-[#6b7280] hover:text-[#f9fafb] ml-3 transition-colors cursor-pointer shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Buttons row */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={`font-mono text-xs tracking-widest text-[#9ca3af] border border-[#2e3038] rounded px-4 py-2.5 transition-colors duration-200 ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-[#4b5563] hover:text-[#f9fafb] cursor-pointer"
          }`}
        >
          {hasFiles ? "Add More" : "Upload Files"}
        </button>

        {hasFiles && (
          <button
            onClick={onAnalyze}
            disabled={loading}
            className={`font-mono text-xs tracking-widest text-[#0c0d10] bg-[#4ade80] rounded px-5 py-2.5 transition-colors duration-200 font-semibold ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#22c55e] cursor-pointer"
            }`}
          >
            {loading
              ? "Analyzing..."
              : `Analyze ${uploadedFiles.length === 1 ? "Drawing" : `${uploadedFiles.length} Drawings`} →`}
          </button>
        )}
      </div>
    </section>
  );
}
