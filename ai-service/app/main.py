from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import transcribe, structure, search, ask

app = FastAPI(title="Industria-MEM AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe.router)
app.include_router(structure.router)
app.include_router(search.router)
app.include_router(ask.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "industria-mem-ai"}
