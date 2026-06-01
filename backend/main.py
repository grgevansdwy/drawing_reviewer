from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import os
import anthropic
import json

app = FastAPI()

# Allow your frontend server to talk to this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# activate claude API
load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# pydantic
class FileItem(BaseModel):
    file_base64: str
    file_name: str
    file_type: str

class AnalyzeRequest(BaseModel):
    files: List[FileItem]

# read prompt from txt
with open(os.path.join(os.path.dirname(__file__), "prompts/system_prompt.txt")) as f:
    SYSTEM_PROMPT = f.read()


@app.post("/api/analyze")
async def analyze_drawing(req: AnalyzeRequest):
    # 400 - Bad request (frontend sent wrong data)
    if not req.files:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if len(req.files) > 10:
        raise HTTPException(status_code=400, detail="Max 10 files at once")
    
    for file in req.files:
        if file.file_type not in ["image/png", "image/jpeg", "application/pdf"]:
            raise HTTPException(status_code=400, detail="Unsupported file type")

    raw = ''

    try:
        # Build the message content
        # Claude accepts images directly as base64

        # build content — all images first, one prompt at the end
        content = []
        # add n image
        for i, file in enumerate(req.files):
            # label each drawing so Claude knows which is which
            content.append({
                "type": "text",
                "text": f"Drawing {i+1}: {file.file_name}"
            })
            if file.file_type == "application/pdf":
                content.append({
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": file.file_base64,
                    }
                })
            else:
                content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": file.file_type,
                        "data": file.file_base64,
                    }
                })

        # one single instruction at the end
        content.append({
            "type": "text",
            "text": f"These {len(req.files)} images are all sheets of the same engineering drawing package. Analyze them together as one complete project and return ONE single JSON report covering all sheets. Return ONLY the JSON object. No preamble, no markdown."
        })

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=16384,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )

        # Parse the JSON from Claude's response
        raw = message.content[0].text.strip() # remove whitespace front and back
        print("=== RAW CLAUDE RESPONSE ===")
        print(raw)
        print("=== END RAW RESPONSE ===")
        if raw.startswith("```"):            # did Claude add backticks?
            raw = raw.split("```")[1]        # grab what's between the backticks
            if raw.startswith("json"):       # did Claude write ```json specifically?
                raw = raw[4:]                # remove the word "json"

        raw = raw.strip()                    # clean whitespace again
        
        report = json.loads(raw)
        report["file_names"] = [f.file_name for f in req.files]

        return report

    # 422 - Claude responded but JSON was malformed
    except json.JSONDecodeError:
        print("=== RAW CLAUDE RESPONSE ===")
        print(raw)
        print("=== END RAW RESPONSE ===")
        raise HTTPException(status_code=422, detail="Claude returned invalid JSON")
    
    # 401 - API key is wrong or expired
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key")
    
    # 429 - You're sending too many requests too fast
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit hit. Slow down.")
    
    # 503 - Anthropic's servers are down
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=503, detail="Cannot reach Anthropic API")
    
    # 500 - anything else unexpected
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}
