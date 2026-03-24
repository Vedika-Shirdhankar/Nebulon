# routes/vision.py
# Exposes (mounted in main.py under /ai prefix):
#   POST /ai/segregation-check  ← LLaVA image analysis for waste segregation
#
# llama3.1 / anomaly analysis lives in routes/ai.py

from fastapi import APIRouter, UploadFile, File, HTTPException
import requests
import base64
import json

router = APIRouter()

OLLAMA_URL  = "http://localhost:11434/api/generate"
VISION_MODEL = "llava"          # must be pulled: ollama pull llava


# ─── LLaVA helper ─────────────────────────────────────────────────────────────

VISION_PROMPT = """You are a waste segregation quality inspector.
Analyse this photo of segregated waste and respond with EXACTLY this JSON and nothing else:
{
  "score": <integer 0-100>,
  "wrong_items": ["item description", ...],
  "improvement_steps": ["step 1", "step 2", ...],
  "summary": "two sentence overall assessment"
}
Rules:
- score 80-100 = well segregated, 50-79 = needs improvement, 0-49 = poorly segregated
- wrong_items: list every item clearly placed in the wrong bin/category (empty list [] if none)
- improvement_steps: 1-4 actionable steps the person can take right now (empty list [] if none needed)
- summary: plain English, no markdown, max two sentences
No preamble, no markdown fences, pure JSON only."""


def _call_llava(image_bytes: bytes) -> dict:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model":   VISION_MODEL,
                "prompt":  VISION_PROMPT,
                "images":  [b64],
                "stream":  False,
                "options": {"temperature": 0.1, "num_predict": 400},
            },
            timeout=240,            # LLaVA is slower than llama3.1
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "").strip()

        # Strip markdown fences if model added them
        if "```" in raw:
            parts = raw.split("```")
            raw = parts[1] if len(parts) > 1 else parts[0]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        # Normalise / provide safe defaults
        return {
            "score":             int(parsed.get("score", 50)),
            "wrong_items":       parsed.get("wrong_items", []),
            "improvement_steps": parsed.get("improvement_steps", []),
            "summary":           parsed.get("summary", "Analysis complete."),
        }

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running. Start it with: ollama serve"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="LLaVA timed out (>120s). The model may still be loading — please retry."
        )
    except json.JSONDecodeError:
        # If JSON parse fails, return a graceful fallback rather than crashing
        return {
            "score":             50,
            "wrong_items":       [],
            "improvement_steps": ["Could not parse AI response — please try again."],
            "summary":           raw[:300] if raw else "Analysis failed.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis error: {str(e)[:200]}")


# ─── Route ────────────────────────────────────────────────────────────────────

@router.post("/segregation-check")
async def segregation_check(photo: UploadFile = File(...)):
    """
    Accepts a waste photo upload and returns a JSON segregation quality report
    powered by LLaVA running locally via Ollama.
    """
    # Basic content-type guard
    if photo.content_type and not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    image_bytes = await photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    result = _call_llava(image_bytes)
    return result