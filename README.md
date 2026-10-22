# Drawing Reviewer

AI pre-production review for engineering drawings. Upload a drawing (PNG, JPG or PDF) and get a structured report on tolerances, GD&T, welds, material, surface finish and more, before the part goes to a shop.

**Live demo:** <https://drawing-reviewer-delta.vercel.app> (the API runs on a free Render tier, so the first request after idle can take a minute to wake up)

## What it does

- Reads one drawing, or up to 10 sheets of the same package, and reviews them together as one project.
- Decides first which checks apply. A machined bracket is not checked for welds.
- Returns a scored, severity-ranked list of issues with a recommendation (for example `REVISE AND RESUBMIT`) and key action items.
- Treats missing information the same as a wrong specification. An absent tolerance or material callout is flagged.

Categories reviewed: tolerances, GD&T, welds, material, surface finish, assembly sequence, heat treatment, cost and DFM.

## How it works

Both phases run in a single model call, driven by the prompt in [`backend/prompts/system_prompt.txt`](backend/prompts/system_prompt.txt).

1. **Scope detection.** Classify the part (single-part machined, welded assembly, casting, and so on) and decide which categories are in scope. Out-of-scope categories are listed with the reason they were skipped.
2. **Analysis.** Run a checklist of red flags for each category in scope, assign severity (critical, high, medium, low), and score each category.

The backend sends the drawing to Claude (`claude-haiku-4-5`) as an image or PDF, asks for JSON only, and returns the parsed report.

```
React + Vite  ──POST /api/analyze──▶  FastAPI  ──▶  Claude API
(upload, report view)                 (validate, build prompt, parse JSON)
```

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS (Vercel) |
| Backend | FastAPI, Python 3.12 (Render) |
| AI | Claude via the Anthropic API |

## Project structure

```
drawing_reviewer/
├── backend/
│   ├── main.py                    # FastAPI app: /api/analyze and /health
│   ├── prompts/system_prompt.txt  # Two-phase review prompt
│   ├── test/test.py               # Endpoint tests (run against a live server)
│   ├── requirements.txt
│   └── Procfile                   # Render start command
└── frontend/
    └── src/
        ├── App.jsx                # Upload flow and API call
        └── components/            # Navbar, HeroSection, ResultsSection, DocsPage
```

## Run it locally

You need Python 3.12, Node 18+ and an [Anthropic API key](https://console.anthropic.com/).

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open <http://localhost:5173>.

## API

### `POST /api/analyze`

```json
{
  "files": [
    { "file_base64": "<base64 string>", "file_name": "drawing.png", "file_type": "image/png" }
  ]
}
```

Accepted `file_type`: `image/png`, `image/jpeg`, `application/pdf`. Up to 10 files per request.

Response (abridged):

```json
{
  "phase_1_output": {
    "drawing_type": "Single-part machined component",
    "review_scope": ["tolerances", "gdt", "material", "surface_finish"],
    "excluded_categories": ["welds: No welds present"]
  },
  "phase_2_analysis": {
    "issues": [],
    "quality_scores": { "tolerances": 55, "gdt": 45, "overall": 52 },
    "summary": {
      "total_issues": 12,
      "critical_count": 2,
      "recommendation": "REVISE AND RESUBMIT",
      "key_action_items": []
    }
  }
}
```

Errors: `400` bad input, `401` invalid API key, `422` the model returned malformed JSON, `429` rate limited, `503` Anthropic unreachable.

### `GET /health`

Returns `{ "status": "ok" }`.

## Tests

With the backend running:

```bash
cd backend
python test/test.py                   # uses the bundled sample drawing
python test/test.py path/to/part.png  # or your own
```

## Limitations

- The review is only as good as the drawing's legibility. Low-resolution scans can produce missed or invented callouts.
- The output is advisory. A manufacturing engineer should confirm every critical finding.
