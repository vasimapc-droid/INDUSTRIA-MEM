import json
import re
import httpx
from app.utils.config import DEMO_MODE, OLLAMA_URL, OLLAMA_MODEL

SYSTEM_PROMPT = """You are an industrial knowledge structuring assistant for automotive manufacturing.
Extract structured knowledge from technician reports. Output ONLY valid JSON with keys:
machine, problem, symptoms, possibleCause, rootCause, troubleshootingSteps (array of strings),
solution, partsComponents (array), severity (LOW|MEDIUM|HIGH|CRITICAL), tags (array of strings).
Never invent facts. If a field is unknown, use an empty string or empty array."""


def structure_knowledge(text: str, machine_code=None, machine_name=None) -> dict:
    if not DEMO_MODE:
        try:
            r = httpx.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": f"{SYSTEM_PROMPT}\n\nReport:\n{text}\n\nJSON:",
                    "stream": False,
                    "format": "json"
                },
                timeout=60
            )
            if r.status_code == 200:
                parsed = json.loads(r.json().get("response", "{}"))
                return {"structured": parsed, "source": "ollama"}
        except Exception as e:
            print(f"[structurer] Ollama failed: {e}")

    return {"structured": _heuristic(text, machine_code, machine_name), "source": "heuristic"}


def _heuristic(text: str, machine_code, machine_name) -> dict:
    t = text.lower()
    machine = machine_name or machine_code or ""
    problems, causes, solutions, symptoms, steps = [], [], [], [], []

    for kw in ["vibrat", "noise", "stop", "fault", "leak", "overheat", "jam", "error"]:
        if kw in t:
            symptoms.append(kw.capitalize())

    for c in ["loose", "wear", "misalign", "broken", "clogged", "leak", "short", "dirty"]:
        if c in t:
            causes.append(c.capitalize())

    m = re.search(r"(cnc[\s\-]?[a-z]?[\-\s]?\d+|weld[a-z]*\s*robot\s*w?\-?\d+|conveyor[\s\-]?[a-z]?\-?\d+|press[\s\-]?p?\-?\d+|assembly\s*robot\s*ar?\-?\d+)", t)
    if m: machine = m.group(0).upper()

    if "vibrat" in t:
        problems.append("High-speed vibration")
        if "tool holder" in t or "loose" in t:
            causes.append("Loose tool holder")
            solutions.append("Tighten and realign tool holder")
            steps = ["Check spindle", "Check tool holder", "Tighten tool holder", "Realign tool holder"]
    if "noise" in t: problems.append("Abnormal noise")
    if "stop" in t:  problems.append("Sudden stoppage")

    severity = "HIGH" if "critical" in t or "stop" in t else "MEDIUM"
    tags = list({s for s in symptoms + causes + [machine.split()[0] if machine else ""] if s})

    return {
        "machine": machine,
        "problem": "; ".join(problems) or text[:120],
        "symptoms": ", ".join(symptoms),
        "possibleCause": ", ".join(causes),
        "rootCause": ", ".join(causes),
        "troubleshootingSteps": steps,
        "solution": "; ".join(solutions) or "",
        "partsComponents": list(causes),
        "severity": severity,
        "tags": tags
    }
