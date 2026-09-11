from fastapi import APIRouter
from pydantic import BaseModel
from app.services.semantic import similar_incidents

router = APIRouter()

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
def ask(req: AskRequest):
    sim = similar_incidents(req.question, top_k=3)
    results = sim.get("results", [])
    if not results:
        return {
            "answer": "I couldn't find a sufficiently similar verified incident in the company knowledge base. "
                      "Consider asking an expert using the 'Ask an Expert' feature.",
            "sources": []
        }
    top = results[0]
    answer = (
        f"Yes. I found {len(results)} similar verified incident(s).\n\n"
        f"Most similar: {top.get('machine','')} - {top.get('similarity')}% similarity\n\n"
        f"Problem: {top.get('problem','')}\n"
        f"Root Cause: {top.get('rootCause','')}\n"
        f"Verified Solution: {top.get('solution','')}"
    )
    return {"answer": answer, "sources": results}
