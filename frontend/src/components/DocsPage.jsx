function Divider({ index, title }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono text-xs text-[#4b5563]">/</span>
      <span className="font-mono text-xs text-[#6b7280] tracking-widest uppercase whitespace-nowrap">
        {String(index).padStart(2, "0")} · {title}
      </span>
      <div className="flex-1 h-px bg-[#1e2128]" />
    </div>
  );
}

function Tag({ children, color = "green" }) {
  const styles = {
    green: "border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/5",
    gray: "border-[#2e3038] text-[#4b5563]",
    orange: "border-[#f97316]/40 text-[#f97316] bg-[#f97316]/10",
    yellow: "border-[#f59e0b]/40 text-[#f59e0b] bg-[#f59e0b]/10",
    red: "border-[#ef4444]/40 text-[#ef4444] bg-[#ef4444]/10",
  };
  return (
    <span className={`font-mono text-xs border px-2.5 py-1 rounded ${styles[color]}`}>
      {children}
    </span>
  );
}

function CategoryCard({ id, name, flags, description }) {
  return (
    <div className="border border-[#1e2128] rounded-lg p-5 bg-[#0e1015]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold text-[#4ade80] tracking-widest">
          {name}
        </span>
        <span className="font-mono text-xs text-[#4b5563]">{flags} checks</span>
      </div>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: flags }, (_, i) => (
          <span
            key={i}
            className="font-mono text-xs border border-[#2e3038] text-[#4b5563] px-2 py-0.5 rounded"
          >
            RF-{id}{i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DocsPage() {
  const PART_TYPES = [
    { label: "Single-Part Machined", example: "shaft, bracket, bushing", scope: ["TOLERANCES", "GD&T", "MATERIAL", "SURFACE FINISH"] },
    { label: "Welded Assembly", example: "tank, frame, structure", scope: ["TOLERANCES", "GD&T", "WELDS", "MATERIAL", "HEAT TREATMENT", "ASSEMBLY SEQUENCE"] },
    { label: "Fastened Assembly", example: "bolted components, rivets", scope: ["TOLERANCES", "GD&T", "MATERIAL", "FASTENER SPECS", "ASSEMBLY SEQUENCE"] },
    { label: "Casting", example: "cast iron, aluminum casting", scope: ["TOLERANCES", "GD&T", "MATERIAL", "SURFACE FINISH", "CASTING SPECS"] },
    { label: "Forging", example: "forged steel part", scope: ["TOLERANCES", "GD&T", "MATERIAL", "FORGING SPECS", "HEAT TREATMENT"] },
    { label: "Machined + Welded Hybrid", example: "machined then welded", scope: ["TOLERANCES", "GD&T", "WELDS", "MATERIAL", "HEAT TREATMENT", "ASSEMBLY SEQUENCE", "SURFACE FINISH"] },
    { label: "Sheet Metal", example: "bent, stamped metal", scope: ["TOLERANCES", "GD&T", "MATERIAL", "BEND SPECS", "SURFACE FINISH"] },
  ];

  const SEVERITY = [
    { key: "CRITICAL", color: "text-[#ef4444]", border: "border-[#ef4444]/30 bg-[#ef4444]/5", dot: "bg-[#ef4444]", label: "🔴 CRITICAL", desc: "Blocks manufacturing. Impossible to build, safety risk, or contradictory specifications. Must be resolved before any work begins." },
    { key: "HIGH", color: "text-[#f97316]", border: "border-[#f97316]/30 bg-[#f97316]/5", dot: "bg-[#f97316]", label: "🟠 HIGH", desc: "Causes rework or scrap. Incomplete specification with >$50 cost impact per unit. Resolve before releasing to the shop floor." },
    { key: "MEDIUM", color: "text-[#f59e0b]", border: "border-[#f59e0b]/30 bg-[#f59e0b]/5", dot: "bg-[#f59e0b]", label: "🟡 MEDIUM", desc: "Over-specification or cost inefficiency. $5–50 cost impact. Flagged for review but won't block manufacturing." },
    { key: "LOW", color: "text-[#4ade80]", border: "border-[#4ade80]/30 bg-[#4ade80]/5", dot: "bg-[#4ade80]", label: "🟢 LOW", desc: "Minor optimization opportunity. Less than $5 impact per unit. Worth noting but not urgent." },
  ];

  const CATEGORIES = [
    {
      id: "T",
      name: "TOLERANCES",
      flags: 6,
      description: "Checks for missing general tolerance blocks, critical dimensions relying on loose defaults, over-specified or impossible tolerances, and tolerance stack conflicts across chained dimensions.",
    },
    {
      id: "G",
      name: "GD&T",
      flags: 6,
      description: "Validates datum definitions, datum hierarchy, GD&T on critical features (bearing bores, rotating surfaces), and logical consistency between GD&T specs and size tolerances.",
    },
    {
      id: "W",
      name: "WELDS",
      flags: 10,
      description: "Covers weld type, size, length, process (MIG/TIG/SMAW), filler material, inspection method, penetration, post-weld heat treatment requirements, and distortion sequence.",
    },
    {
      id: "M",
      name: "MATERIAL",
      flags: 6,
      description: "Checks material grade specificity, material condition (annealed, cold-drawn, T6), certification requirements (MTR) for critical applications, and suitability for the intended function.",
    },
    {
      id: "S",
      name: "SURFACE FINISH",
      flags: 4,
      description: "Flags missing finish specifications, over-application of tight finishes (Ra 4) to non-critical surfaces, and finish inconsistencies with tolerance requirements.",
    },
    {
      id: "A",
      name: "ASSEMBLY SEQUENCE",
      flags: 8,
      description: "For welded and multi-part assemblies: validates machining-before-heat order, stress relief timing and temperature, final inspection placement, and re-machining steps after welding.",
    },
    {
      id: "H",
      name: "HEAT TREATMENT",
      flags: 4,
      description: "Checks that heat treatment type, temperature, hold duration, and cooling rate are all fully specified when heat treatment is required.",
    },
    {
      id: "C",
      name: "COST & DFM",
      flags: 5,
      description: "Cross-cutting cost flags: over-specified tolerances or finishes, process mismatches (TIG where MIG suffices), redundant stress relief, and over-specified inspection methods.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-24">

      {/* Hero */}
      <p className="font-mono text-xs text-[#4b5563] tracking-widest uppercase mb-6 flex items-center gap-3">
        <span className="block w-8 h-px bg-[#4b5563]" />
        Analysis Methodology
      </p>
      <h1 className="font-sans text-5xl font-bold leading-tight text-[#f9fafb] mb-2 tracking-tight">
        How the review
      </h1>
      <h1 className="font-sans text-5xl font-bold leading-tight text-[#4ade80] mb-6 tracking-tight">
        engine works.
      </h1>
      <p className="text-[#6b7280] text-lg leading-relaxed mb-16 max-w-2xl">
        Every drawing is processed through two sequential phases. Phase 1 identifies what kind of part it is and sets the review scope automatically. Phase 2 runs only the checks that apply.
      </p>

      {/* 01 — Two-Phase Overview */}
      <div className="mb-16">
        <Divider index={1} title="Two-Phase Approach" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-[#1e2128] rounded-lg p-6 bg-[#0e1015]">
            <p className="font-mono text-xs text-[#4ade80] tracking-widest mb-3">PHASE 1</p>
            <h3 className="font-mono text-sm font-bold text-[#f9fafb] mb-3">Scope Detection</h3>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              The engine reads the drawing and classifies the part type. Based on that classification, it sets a <span className="text-[#9ca3af]">review_scope</span> — the categories that apply — and an <span className="text-[#9ca3af]">excluded</span> list of categories that don't. Nothing in the excluded list is checked.
            </p>
          </div>
          <div className="border border-[#1e2128] rounded-lg p-6 bg-[#0e1015]">
            <p className="font-mono text-xs text-[#4ade80] tracking-widest mb-3">PHASE 2</p>
            <h3 className="font-mono text-sm font-bold text-[#f9fafb] mb-3">Targeted Analysis</h3>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              For each category in scope, the engine runs a structured checklist — first checking for required data, then testing for specific red flags. Every issue found is logged with a location, severity, root cause, and actionable fix.
            </p>
          </div>
        </div>
      </div>

      {/* 02 — Part Types */}
      <div className="mb-16">
        <Divider index={2} title="Part Type Detection" />
        <p className="text-[#6b7280] text-sm leading-relaxed mb-6 max-w-2xl">
          The engine classifies the drawing into one of seven part types. This is the single decision that drives everything else — the wrong classification means checking irrelevant things and missing relevant ones.
        </p>
        <div className="space-y-3">
          {PART_TYPES.map((pt) => (
            <div key={pt.label} className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <p className="font-mono text-xs font-bold text-[#f9fafb] mb-0.5">{pt.label}</p>
                  <p className="font-mono text-xs text-[#4b5563]">{pt.example}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pt.scope.map((s) => (
                  <Tag key={s} color="green">{s}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
          <p className="font-mono text-xs text-[#6b7280] mb-2 uppercase tracking-widest">Classification rule</p>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            If welds account for more than 10% of features → <span className="text-[#9ca3af]">Machined + Welded Hybrid</span>. If multiple parts are clearly assembled → <span className="text-[#9ca3af]">Assembly</span>. Otherwise → <span className="text-[#9ca3af]">Single-Part Machined</span> (default).
          </p>
        </div>
      </div>

      {/* 03 — Review Categories */}
      <div className="mb-16">
        <Divider index={3} title="Review Categories" />
        <p className="text-[#6b7280] text-sm leading-relaxed mb-6 max-w-2xl">
          Each category has a fixed checklist of red flags (RF codes). The engine goes through every applicable red flag in order — missing required data triggers a flag just as much as a specification error does.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
      </div>

      {/* 04 — Severity */}
      <div className="mb-16">
        <Divider index={4} title="Severity Scale" />
        <p className="text-[#6b7280] text-sm leading-relaxed mb-6 max-w-2xl">
          Every issue is assigned one of four severity levels. The threshold question for critical vs. non-critical dimensions is: <span className="text-[#9ca3af] italic">"If this dimension varies by 50%, does the part still function?"</span> — No = Critical, Yes = Non-critical.
        </p>
        <div className="space-y-3">
          {SEVERITY.map((s) => (
            <div key={s.key} className={`border rounded-lg p-4 ${s.border}`}>
              <div className="flex items-start gap-4">
                <span className={`font-mono text-xs font-bold ${s.color} shrink-0 mt-0.5`}>
                  {s.label}
                </span>
                <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border border-[#1e2128] rounded-lg p-4 bg-[#0e1015]">
          <p className="font-mono text-xs text-[#6b7280] mb-3 uppercase tracking-widest">Context adjustments</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-xs text-[#9ca3af] mb-1">Aerospace / Medical</p>
              <p className="text-[#6b7280] text-xs leading-relaxed">Severity is adjusted upward. Missing certification = CRITICAL. Any ambiguity = HIGH.</p>
            </div>
            <div>
              <p className="font-mono text-xs text-[#9ca3af] mb-1">Consumer / Low-volume</p>
              <p className="text-[#6b7280] text-xs leading-relaxed">Cost efficiency weighted more heavily. Over-specification flagged aggressively.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 05 — Output */}
      <div className="mb-16">
        <Divider index={5} title="Report Output" />
        <p className="text-[#6b7280] text-sm leading-relaxed mb-6 max-w-2xl">
          The engine returns a structured JSON object. Every issue includes a red flag code, severity, location on the drawing, root cause, why it matters, a fix recommendation, and a cost impact estimate.
        </p>
        <div className="border border-[#1e2128] rounded-lg p-5 bg-[#0e1015] font-mono text-xs text-[#6b7280] leading-relaxed overflow-x-auto">
          <pre>{`{
  "phase_1_output": {
    "drawing_type":        string   — classified part type
    "review_scope":        string[] — categories that were checked
    "excluded_categories": string[] — categories skipped and why
  },

  "phase_2_analysis": {
    "issues": [{
      "id":                   string  — e.g. "T001", "G002"
      "category":             string  — TOLERANCES | GDT | WELDS ...
      "red_flag_type":        string  — e.g. "RF-T1"
      "severity":             string  — CRITICAL | HIGH | MEDIUM | LOW
      "issue":                string  — one-line problem statement
      "description":          string  — full explanation
      "location":             string  — where on the drawing
      "current_specification":string  — what the drawing currently shows
      "why_it_matters":       string  — functional / cost / safety impact
      "recommendation":       string  — how to fix it
      "cost_impact": {
        "type":               string  — missing_cost | over_specification_cost
        "amount_per_unit":    number  — USD per unit
        "note":               string  — explanation
      }
    }],

    "quality_scores": {
      "tolerances":        0–100
      "gdt":               0–100
      "welds":             0–100 | null
      "material":          0–100
      "surface_finish":    0–100
      "assembly_sequence": 0–100 | null
      "overall":           0–100
    },

    "summary": {
      "total_issues":       number
      "critical_count":     number
      "high_count":         number
      "medium_count":       number
      "low_count":          number
      "total_cost_impact":  string
      "recommendation":     PASS | PASS WITH MINOR REVISIONS
                          | REVISE AND RESUBMIT | REJECT
      "key_action_items":   string[]
    }
  }
}`}</pre>
        </div>
      </div>

      {/* 06 — Key Rules */}
      <div className="mb-10">
        <Divider index={6} title="Key Analysis Rules" />
        <div className="space-y-3">
          {[
            { rule: "Over-specification threshold", detail: "A tolerance or finish is only flagged as over-specified if it is tighter than needed AND the cost impact is more than 3× higher AND the function does not require it. Company standards and safety margins are never flagged." },
            { rule: "Critical dimension test", detail: "A dimension is critical if it affects bearing fit, assembly, rotating balance, sealing, or load. Non-critical = envelope, cosmetic, or non-contact surfaces." },
            { rule: "Multiple flags on one issue", detail: "If two red flags share the same root cause and the same fix, they are combined into a single issue. If different fixes are needed, they are reported separately." },
            { rule: "Non-standard notation", detail: "Accepted if clear and unambiguous. Flagged only if there is a confusion risk or a direct manufacturability impact." },
            { rule: "Tolerance stack", detail: "For chained dimensions (length = A + B + C), worst-case cumulative tolerance is calculated. If the result fails assembly fit, it is flagged as RF-T5." },
            { rule: "Material certification", detail: "MTR required only for: aerospace/medical, rotating or pressure-bearing parts, or safety-critical applications. Not flagged for commodity or low-volume non-critical parts." },
          ].map(({ rule, detail }) => (
            <div key={rule} className="border border-[#1e2128] rounded-lg p-4 bg-[#0e1015] flex gap-4">
              <span className="font-mono text-xs text-[#4ade80] shrink-0 mt-0.5">→</span>
              <div>
                <p className="font-mono text-xs font-bold text-[#f9fafb] mb-1">{rule}</p>
                <p className="text-[#6b7280] text-sm leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2128] pt-6 flex items-center justify-between">
        <span className="font-mono text-xs text-[#4b5563] tracking-widest">DRAWING INTELLIGENCE</span>
        <span className="font-mono text-xs text-[#4b5563] tracking-widest">BUILT ON THE FACTORY FLOOR · © 2026</span>
      </div>
    </div>
  );
}
