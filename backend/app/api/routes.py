from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.services.transcription import transcribe_audio
from app.services.analysis import analyze_text
from app.services.generation import generate_social_posts
import shutil
import os
import uuid
from typing import List

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = None):
    # Save temp file
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_file_path = f"temp_uploads/{temp_filename}"
    
    os.makedirs("temp_uploads", exist_ok=True)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        text = await transcribe_audio(temp_file_path, language)
        return {"text": text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/analyze")
async def analyze(text: str = Body(..., embed=True)):
    return analyze_text(text)

@router.post("/generate-post")
async def generate(
    text: str = Body(..., embed=True), 
    analysis: dict = Body(..., embed=True),
    platforms: List[str] = Body(default=["twitter", "linkedin"], embed=True),
    language: str = Body(default="English", embed=True),
    variation: bool = Body(default=False, embed=True)
):
    """
    Generate posts optimized for selected platforms in the selected language.
    If variation=True, request a different creative variation.
    """
    return await generate_social_posts(analysis, text, platforms, language, variation)
