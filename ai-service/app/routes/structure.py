from fastapi import APIRouter
from pydantic import BaseModel
from app.services.structurer import structure_knowledge

router = APIRouter()

class StructureRequest(BaseModel):
    text: str
    machineCode: str | None = None
    machineName: str | None = None

@router.post("/structure-knowledge")
def structure(req: StructureRequest):
    return structure_knowledge(req.text, req.machineCode, req.machineName)
