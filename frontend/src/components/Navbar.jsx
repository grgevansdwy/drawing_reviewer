export default function Navbar({ page, onNavigate }) {
  return (
    <nav className="border-b border-[#1e2128] px-6 py-4 flex items-center justify-between">
      <button
        onClick={() => onNavigate("home")}
        className="font-mono font-bold text-[#f9fafb] tracking-widest text-sm uppercase hover:text-[#4ade80] transition-colors duration-200 cursor-pointer"
      >
        Drawing Reviewer
      </button>
      <button
        onClick={() => onNavigate(page === "docs" ? "home" : "docs")}
        className={`font-mono text-xs tracking-widest border rounded px-4 py-2 transition-colors duration-200 cursor-pointer ${
          page === "docs"
            ? "border-[#4ade80] text-[#4ade80]"
            : "border-[#2e3038] text-[#9ca3af] hover:border-[#4ade80] hover:text-[#4ade80]"
        }`}
      >
        {page === "docs" ? "← Back" : "Docs →"}
      </button>
    </nav>
  );
}
