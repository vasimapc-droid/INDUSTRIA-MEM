from fastapi import APIRouter
from pydantic import BaseModel
from app.services.semantic import similar_incidents

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    topK: int = 5

@router.post("/search")
def search(req: SearchRequest):
    return similar_incidents(req.query, req.topK)

@router.post("/similar-incidents")
def sim(req: SearchRequest):
    return similar_incidents(req.query, req.topK)
