const SEVERITY_CONFIG = {
  CRITICAL: {
    dot: "bg-[#ef4444]",
    badge: "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30",
    label: "🔴 CRITICAL",
  },
  HIGH: {
    dot: "bg-[#f97316]",
    badge: "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30",
    label: "🟠 HIGH",
  },
  MEDIUM: {
    dot: "bg-[#f59e0b]",
    badge: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    label: "🟡 MEDIUM",
  },
  LOW: {
    dot: "bg-[#4ade80]",
    badge: "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30",
    label: "🟢 LOW",
  },
};

const CATEGORY_COLORS = {
  TOLERANCES: "text-[#f97316] border-[#f97316]/40 bg-[#f97316]/10",
  "GD&T": "text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10",
  WELDS: "text-[#f97316] border-[#f97316]/40 bg-[#f97316]/10",
  "ASSEMBLY SEQUENCE": "text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10",
  "SURFACE FINISH": "text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10",
  MATERIAL: "text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10",
};

const SCOPE_DISPLAY = {
  tolerances: "TOLERANCES",
  gdt: "GD&T",
  material: "MATERIAL",
  surface_finish: "SURFACE FINISH",
  welds: "WELDS",
  assembly_sequence: "ASSEMBLY SEQUENCE",
  heat_treatment: "HEAT TREATMENT",
};

const CATEGORY_DISPLAY = {
  GDT: "GD&T",
  SURFACE_FINISH: "SURFACE FINISH",
  ASSEMBLY_SEQUENCE: "ASSEMBLY SEQUENCE",
};

const SCORE_DISPLAY = {
  tolerances: "TOLERANCES",
  gdt: "GD&T",
  welds: "WELDS",
  material: "MATERIAL",
  surface_finish: "SURFACE FINISH",
  assembly_sequence: "ASSEMBLY SEQUENCE",
  overall: "OVERALL",
};

function parseSeverity(s) {
  if (!s) return "MEDIUM";
  if (s.includes("CRITICAL")) return "CRITICAL";
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("MEDIUM")) return "MEDIUM";
  return "LOW";
}

function normalizeReport(report) {
  const p1 = report.phase_1_output;
  const p2 = report.phase_2_analysis;

  const phase1 = {
    drawing_type: p1.drawing_type,
    review_scope: p1.review_scope.map(
      (s) => SCOPE_DISPLAY[s] || s.toUpperCase(),
    ),
    excluded: p1.excluded_categories.map((s) => {
      const key = s.split(":")[0].trim().toLowerCase();
      return SCOPE_DISPLAY[key] || key.toUpperCase();
    }),
  };

  const issues = p2.issues.map((issue) => ({
    ...issue,
    category: CATEGORY_DISPLAY[issue.category] || issue.category,
    red_flag: issue.red_flag_type,
    severity: parseSeverity(issue.severity),
    impact_badge:
      issue.cost_impact?.amount_per_unit > 0
        ? `~$${issue.cost_impact.amount_per_unit}/unit`
        : null,
  }));

  const quality_scores = Object.entries(p2.quality_scores)
    .filter(([, v]) => v !== null)
    .reduce((acc, [k, v]) => {
      acc[SCORE_DISPLAY[k] || k.toUpperCase()] = v;
      return acc;
    }, {});

  return { phase1, phase2: { issues, quality_scores, summary: p2.summary } };
}

function SectionHeader({ index, title }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-mono text-xs text-[#4b5563]">/</span>
      <span className="font-mono text-xs text-[#6b7280] tracking-widest uppercase whitespace-nowrap">
        {String(index).padStart(2, "0")} · {title}
      </span>
      <div className="flex-1 h-px bg-[#1e2128]" />
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="w-full h-px bg-[#1e2128] relative mt-2 mb-3">
      <div
        className="absolute left-0 top-0 h-px transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

function IssueCard({ issue }) {
  const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.MEDIUM;
  const catColor = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.MATERIAL;

  return (
    <div className="border border-[#1e2128] rounded-lg p-5 mb-4 bg-[#0e1015]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${catColor}`}
          >
            {issue.id}
          </span>
          <h3 className="font-mono text-sm text-[#f9fafb] font-semibold">
            {issue.issue}
          </h3>
        </div>
        <span className="font-mono text-xs text-[#4b5563] whitespace-nowrap shrink-0">
          {issue.red_flag}
        </span>
      </div>

      {/* Description */}
      <p className="text-[#9ca3af] text-sm leading-relaxed mb-4">
        {issue.description}
      </p>

      {/* Location → Recommendation */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-2 min-w-0">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#4b5563] mt-0.5 shrink-0"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-mono text-xs text-[#4b5563]">
            {issue.location}
          </span>
          <span className="text-[#4b5563] mx-1">→</span>
          <span className="font-mono text-xs text-[#4ade80]">
            {issue.recommendation}
          </span>
        </div>
        {issue.impact_badge && (
          <span
            className={`font-mono text-xs px-2 py-1 rounded border shrink-0 ${sev.badge}`}
          >
            {issue.impact_badge}
          </span>
        )}
      </div>

      {/* Why it matters */}
      {issue.why_it_matters && (
        <div className="mt-4 pt-4 border-t border-[#1e2128]">
          <p className="font-mono text-xs text-[#4b5563] uppercase tracking-widest mb-2">
            Why it matters
          </p>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            {issue.why_it_matters}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResultsSection({ report }) {
  const { phase1, phase2 } = normalizeReport(report);
  const { summary, issues, quality_scores } = phase2;

  const recColor =
    summary.recommendation === "PASS"
      ? "border-[#4ade80]/30 bg-[#4ade80]/5 text-[#4ade80]"
      : summary.recommendation === "REVISE AND RESUBMIT"
        ? "border-[#f97316]/30 bg-[#f97316]/5 text-[#f97316]"
        : "border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444]";

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">
      <div className="border-t border-[#1e2128] pt-12" />

      {/* Phase 1 */}
      <div className="mb-10">
        <SectionHeader index={1} title="Phase 1 — Scope Detection" />
        <div className="border border-[#1e2128] rounded-lg p-6 bg-[#0e1015]">
          <div className="flex items-start justify-between mb-3">
            <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest">
              Part Type Identified
            </p>
            <span className="font-mono text-sm text-[#4ade80] font-semibold">
              {phase1.drawing_type}
            </span>
          </div>
          <p className="font-mono text-xs text-[#4b5563] uppercase tracking-widest mb-3">
            Review Scope
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {phase1.review_scope.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs border border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/5 px-2.5 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {phase1.excluded.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs border border-[#2e3038] text-[#4b5563] px-2.5 py-1 rounded line-through"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phase 2 header */}
      <div className="mb-8">
        <SectionHeader index={2} title="Phase 2 — Analysis Results" />

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
            <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest mb-2">
              Total Issues
            </p>
            <p className="font-mono text-3xl text-[#f9fafb] font-bold">
              {summary.total_issues}
            </p>
            <p className="font-mono text-xs text-[#4b5563] mt-1">
              Across 6 categories
            </p>
          </div>
          <div className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
            <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest mb-2">
              Critical
            </p>
            <p className="font-mono text-3xl text-[#ef4444] font-bold">
              {summary.critical_count}
            </p>
            <p className="font-mono text-xs text-[#4b5563] mt-1">
              Blocks manufacturing
            </p>
          </div>
          <div className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
            <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest mb-2">
              High
            </p>
            <p className="font-mono text-3xl text-[#f97316] font-bold">
              {summary.high_count}
            </p>
            <p className="font-mono text-xs text-[#4b5563] mt-1">
              Causes rework
            </p>
          </div>
          <div className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
            <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest mb-2">
              Cost Impact
            </p>
            <p className="font-mono text-sm text-[#f59e0b] font-bold leading-snug">
              {summary.total_cost_impact}
            </p>
          </div>
        </div>

        {/* Recommendation banner */}
        <div
          className={`border rounded-lg p-4 mb-8 flex items-center gap-3 ${recColor}`}
        >
          <span className="font-mono text-xs font-bold tracking-widest shrink-0">
            ○ {summary.recommendation}
          </span>
          <span className="font-mono text-xs text-[#6b7280]">
            {(summary.key_action_items || [])[0] || "Review all flagged issues before releasing to shop floor."}
          </span>
        </div>

        {/* Quality scores */}
        <div className="mb-8">
          <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest mb-4 flex items-center gap-3">
            <span>/</span> Quality Scores
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(quality_scores).map(([key, score]) => (
              <div
                key={key}
                className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]"
              >
                <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest">
                  {key}
                </p>
                <ScoreBar score={score} />
                <p
                  className="font-mono text-2xl font-bold"
                  style={{
                    color:
                      score >= 75
                        ? "#4ade80"
                        : score >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                >
                  {score}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Issues list */}
        <div>
          <p className="font-mono text-xs text-[#6b7280] uppercase tracking-widest mb-4">
            Issues · {summary.total_issues} Found · Sorted by Severity
          </p>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

      {/* Key Action Items */}
      <div className="mb-10">
        <SectionHeader index={3} title="Key Action Items" />
        <div className="space-y-3">
          {(summary.key_action_items || []).map((item, i) => {
            const color = i < 2 ? "#ef4444" : "#f59e0b";
            return (
              <div key={i} className="flex items-start gap-4">
                <span
                  className="font-mono text-xs font-bold shrink-0 mt-0.5"
                  style={{ color }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[#9ca3af] text-sm">{item}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2128] pt-6 flex items-center justify-between">
        <span className="font-mono text-xs text-[#4b5563] tracking-widest">
          DRAWING INTELLIGENCE
        </span>
        <span className="font-mono text-xs text-[#4b5563] tracking-widest">
          BUILT ON THE FACTORY FLOOR · © 2026
        </span>
      </div>
    </div>
  );
}
