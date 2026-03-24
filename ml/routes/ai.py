from fastapi import APIRouter, UploadFile, File, HTTPException
import requests
import httpx
import base64
import json

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL      = "llama3.1"

SYSTEM_PROMPT = """You are an expert waste management operations analyst.
When given an anomaly description, respond with EXACTLY this JSON structure and nothing else:
{
  "cause": "one sentence root cause",
  "action": "one sentence immediate action",
  "risk": "one sentence risk if unresolved"
}
No preamble, no markdown, no explanation — pure JSON only."""

def call_ollama(message: str) -> str:
    prompt = f"""{SYSTEM_PROMPT}

Anomaly: {message}

JSON:"""
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model":  MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 200,
                }
            },
            timeout=60
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "").strip()

        # Try to parse JSON from model output
        # Sometimes LLM wraps it in ```json ... ```
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        parsed = json.loads(raw)
        cause  = parsed.get("cause",  "Unknown root cause")
        action = parsed.get("action", "Manual review required")
        risk   = parsed.get("risk",   "Operational disruption possible")
        return f"🔍 Cause: {cause}\n⚡ Action: {action}\n⚠️ Risk: {risk}"

    except requests.exceptions.ConnectionError:
        return "⚠️ Ollama not reachable. Start it with: ollama serve"
    except requests.exceptions.Timeout:
        return "⚠️ Ollama timed out (>60s). Model may be loading — retry shortly."
    except json.JSONDecodeError:
        # Fallback: return raw text if JSON parse fails
        if raw:
            return raw[:400]
        return "⚠️ Could not parse AI response."
    except Exception as e:
        return f"⚠️ AI error: {str(e)[:120]}"


@router.post("/ai-suggestion")
def ai_suggestion(data: dict):
    message = data.get("message", "")
    if not message:
        return {"suggestion": "No anomaly message provided."}
    suggestion = call_ollama(message)
    return {"suggestion": suggestion}


@router.get("/ai-health")
def ai_health():
    """Check if Ollama is running and llama3.1 is available."""
    try:
        resp = requests.get("http://localhost:11434/api/tags", timeout=5)
        models = [m["name"] for m in resp.json().get("models", [])]
        has_model = any("llama3.1" in m for m in models)
        return {
            "ollama_running": True,
            "available_models": models,
            "llama3_1_ready": has_model,
        }
    except Exception as e:
        return {"ollama_running": False, "error": str(e)}


# ─── Segregation Check (uses llava vision model) ──────────────────────────────

SEGREGATION_PROMPT = """You are a waste segregation expert. Analyze this image of segregated waste bins/bags.
Respond with EXACTLY this JSON structure and nothing else — no preamble, no markdown:
{
  "score": <integer 0 to 100>,
  "wrong_items": ["item placed in wrong bin", "..."],
  "improvement_steps": ["actionable step 1", "..."],
  "summary": "one short paragraph summarizing the segregation quality"
}"""

@router.post("/segregation-check")
async def segregation_check(photo: UploadFile = File(...)):
    # 1. Read and base64-encode the uploaded image
    image_bytes = await photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # 2. Call Ollama with llava (vision model)
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": "llava",
                    "prompt": SEGREGATION_PROMPT,
                    "images": [image_b64],
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "num_predict": 400,
                    }
                }
            )
        response.raise_for_status()

    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail="Ollama not reachable. Run: ollama serve")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Ollama timed out. Model may still be loading — try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama error: {str(e)[:120]}")

    # 3. Parse the JSON response from llava
    raw = response.json().get("response", "").strip()

    # Strip markdown fences if the model added them
    clean = raw
    if "```" in clean:
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip()

    try:
        result = json.loads(clean)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="AI returned malformed JSON. Try again or check llava is properly installed."
        )

    # 4. Sanitize / fill defaults so frontend never crashes
    return {
        "score":             int(result.get("score", 0)),
        "wrong_items":       result.get("wrong_items", []),
        "improvement_steps": result.get("improvement_steps", []),
        "summary":           result.get("summary", "No summary provided."),
    }