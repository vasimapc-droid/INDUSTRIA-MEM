import os
import tempfile
from app.utils.config import DEMO_MODE

_whisper_model = None

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            size = os.getenv("WHISPER_MODEL", "base")
            _whisper_model = WhisperModel(size, device="cpu", compute_type="int8")
        except Exception as e:
            print(f"[transcriber] faster-whisper unavailable: {e}")
            _whisper_model = False
    return _whisper_model


def transcribe_audio(content: bytes, filename: str) -> str:
    model = get_whisper()
    if not model:
        if DEMO_MODE:
            return ("Yesterday CNC C-12 was vibrating heavily during high-speed operation. "
                    "We first checked the spindle and found that the tool holder was loose. "
                    "After tightening and realigning it, the vibration stopped.")
        return ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1] or ".webm") as f:
        f.write(content)
        path = f.name
    try:
        segments, _ = model.transcribe(path, beam_size=5)
        return " ".join(s.text.strip() for s in segments).strip()
    finally:
        try: os.unlink(path)
        except: pass
