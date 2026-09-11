from fastapi import APIRouter, UploadFile, File
from app.services.transcriber import transcribe_audio

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    content = await file.read()
    text = transcribe_audio(content, file.filename or "audio.webm")
    return {"text": text}
