import os
from dotenv import load_dotenv
load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
