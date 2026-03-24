# routers/ai.py
# Exposes:
#   POST /ai/suggestion        ← anomaly AI analysis
#   GET  /ai/health            ← Ollama health check
#   POST /ai/segregation-check ← llava image analysis
#   GET  /ml/health            ← ML/backend health (used by AnomalyCenter)
#   POST /ml/score             ← anomaly confidence score

# routes/ai.py
# Exposes (mounted in main.py):
#   POST /ai/suggestion   ← anomaly AI analysis  (llama3.1)
#   GET  /ai/health       ← Ollama health check
#   GET  /ml/health       ← ML/backend health (used by AnomalyCenter)
#   POST /ml/score        ← anomaly confidence score (rule-based)
#
# LLaVA / image analysis lives in routes/vision.py → /ai/segregation-check

from fastapi import APIRouter
import requests
import json

router    = APIRouter()
ml_router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL      = "llama3.1"


# ─── Ollama helpers ────────────────────────────────────────────────────────────

def _is_ollama_up() -> bool:
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=4)
        return r.status_code == 200
    except Exception:
        return False


def _available_models() -> list[str]:
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=4)
        return [m["name"] for m in r.json().get("models", [])]
    except Exception:
        return []


# ─── AI suggestion (anomaly analysis) — llama3.1 ──────────────────────────────

ANOMALY_SYSTEM = """You are an expert waste management operations analyst.
When given an anomaly description, respond with EXACTLY this JSON structure and nothing else:
{
  "cause": "one sentence root cause",
  "action": "one sentence immediate action",
  "risk": "one sentence risk if unresolved"
}
No preamble, no markdown, no explanation — pure JSON only."""


def _call_ollama_anomaly(message: str) -> str:
    prompt = f"""{ANOMALY_SYSTEM}

Anomaly: {message}

JSON:"""
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model":   MODEL,
                "prompt":  prompt,
                "stream":  False,
                "options": {"temperature": 0.2, "num_predict": 200},
            },
            timeout=90,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "").strip()

        # Strip markdown fences if model added them
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        cause  = parsed.get("cause",  "Unknown root cause")
        action = parsed.get("action", "Manual review required")
        risk   = parsed.get("risk",   "Operational disruption possible")
        return f"🔍 Cause: {cause}\n⚡ Action: {action}\n⚠️ Risk: {risk}"

    except requests.exceptions.ConnectionError:
        return "⚠️ Ollama not reachable. Start it with: ollama serve"
    except requests.exceptions.Timeout:
        return "⚠️ Ollama timed out (>90s). Model may be loading — retry shortly."
    except json.JSONDecodeError:
        return raw[:400] if raw else "⚠️ Could not parse AI response."
    except Exception as e:
        return f"⚠️ AI error: {str(e)[:120]}"


# POST /ai/suggestion
@router.post("/suggestion")
def ai_suggestion(data: dict):
    message = data.get("message", "").strip()
    if not message:
        return {"suggestion": "No anomaly message provided."}
    return {"suggestion": _call_ollama_anomaly(message)}


# GET /ai/health
@router.get("/health")
def ai_health():
    running = _is_ollama_up()
    models  = _available_models() if running else []
    return {
        "ollama_running":   running,
        "available_models": models,
        "llama3_1_ready":   any("llama3.1" in m for m in models),
        "llava_ready":      any("llava"    in m for m in models),
    }


# ─── ML health + scoring ───────────────────────────────────────────────────────

@ml_router.get("/health")
def ml_health():
    """AnomalyCenter calls GET /ml/health on load to show backend status badge."""
    running = _is_ollama_up()
    return {
        "status":         "ok",
        "ollama_running": running,
        "model":          MODEL,
    }


CONFIDENCE_RULES = {
    "GHOST_PICKUP": lambda f: min(99, 60
        + (f.get("gps_deviation_m", 0) / 1500) * 30
        + (10 if f.get("credibility_score", 100) < 70 else 0)),

    "COMPLAINT_SURGE": lambda f: min(99, 50
        + (f.get("complaint_surge_pct", 0) / 100) * 40
        + (10 if f.get("credibility_score", 100) < 60 else 0)),

    "BATCH_STAGNATION": lambda f: min(99, 55
        + (f.get("transit_hours", 0) / 24) * 35
        + (10 if f.get("credibility_score", 100) < 65 else 0)),

    "DISPOSAL_MISMATCH": lambda f: 97.0,

    "CREDIBILITY_CLIFF": lambda f: min(99, 50
        + (max(0, 60 - f.get("credibility_score", 60)) / 60) * 30
        + (f.get("rejection_rate", 0) * 20)),

    "ROUTE_DEVIATION": lambda f: min(99, 40
        + (1 - f.get("route_adherence", 1)) * 50
        + (f.get("gps_deviation_m", 0) / 500) * 10),

    "CITIZEN_REJECTION": lambda f: min(99, 45
        + (f.get("rejection_rate", 0) / 0.5) * 45
        + (5 if f.get("credibility_score", 100) < 65 else 0)),

    "WORKER_ABSENCE": lambda f: 100.0,
}


@ml_router.post("/score")
def ml_score(data: dict):
    """
    Body:    { "type": "GHOST_PICKUP", "features": { "gps_deviation_m": 1247, ... } }
    Returns: { "confidence_pct": 94.2, "type": "GHOST_PICKUP" }
    """
    anomaly_type = data.get("type", "").upper()
    features     = data.get("features", {})

    rule = CONFIDENCE_RULES.get(anomaly_type)
    if rule is None:
        return {"confidence_pct": 75.0, "type": anomaly_type, "note": "unknown type — default score"}

    try:
        score = round(rule(features), 1)
    except Exception:
        score = 75.0

    return {"confidence_pct": score, "type": anomaly_type}