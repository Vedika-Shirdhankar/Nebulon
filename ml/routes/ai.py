from fastapi import APIRouter
import requests
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