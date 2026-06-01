# Drawing Reviewer

AI-powered pre-production review engine for engineering drawings. Upload a drawing (PNG, JPG, or PDF) and get a structured report covering tolerances, GD&T, welds, material, surface finish, and assembly sequence — in minutes.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.12 |
| AI | Claude (Anthropic API) |

---

## Project Structure

```
drawing_reviewer/
├── backend/
│   ├── main.py                  # FastAPI app — single /api/analyze endpoint
│   ├── prompts/
│   │   └── system_prompt.txt    # Full analysis prompt loaded at startup
│   ├── test/
│   │   └── test.py              # Basic endpoint tests
│   └── requirement.txt
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── Navbar.jsx
            ├── HeroSection.jsx  # Upload UI
            ├── ResultsSection.jsx # Report display
            └── DocsPage.jsx     # Methodology docs
```

---

## Setup

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd drawing_reviewer
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirement.txt
```

Create a `.env` file in `backend/`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## How It Works

Every drawing is processed in two phases:

**Phase 1 — Scope Detection**
The model classifies the part type (single-part machined, welded assembly, casting, etc.) and sets which categories to review. Categories that don't apply are skipped entirely.

**Phase 2 — Analysis**
For each category in scope, a structured checklist of red flags is run. Missing required data is flagged the same as specification errors.

Categories checked: Tolerances · GD&T · Welds · Material · Surface Finish · Assembly Sequence · Heat Treatment · Cost & DFM

See the in-app **Docs** page for the full methodology.

---

## API

### `POST /api/analyze`

**Request**
```json
{
  "files": [
    {
      "file_base64": "<base64 string>",
      "file_name": "drawing.png",
      "file_type": "image/png"
    }
  ]
}
```

Accepted `file_type` values: `image/png`, `image/jpeg`, `application/pdf`
Max files per request: 10

**Response**
```json
{
  "phase_1_output": {
    "drawing_type": "Single-part machined component",
    "review_scope": ["tolerances", "gdt", "material", "surface_finish"],
    "excluded_categories": ["welds: No welds present", "..."]
  },
  "phase_2_analysis": {
    "issues": [...],
    "quality_scores": { "tolerances": 55, "gdt": 45, "overall": 52, ... },
    "summary": {
      "total_issues": 12,
      "critical_count": 2,
      "recommendation": "REVISE AND RESUBMIT",
      "key_action_items": [...]
    }
  }
}
```

### `GET /health`

Returns `{ "status": "ok" }` — use this to confirm the server is running.

---

## Running Tests

With the backend running:

```bash
cd backend
source venv/bin/activate
python test/test.py
```
