from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Depends
from app.services.transcription import transcribe_audio
from app.services.analysis import analyze_text
from app.services.generation import generate_executive_suite
from app.database import get_db
from app.models import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import shutil
import os
import uuid
import re
from typing import List

router = APIRouter()

def generate_slug(text: str) -> str:
    # Basic slugify: lowercase, alphanumeric and hyphens
    slug = text.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    # Limit length and add randomness
    return f"{slug[:30]}-{uuid.uuid4().hex[:6]}"

@router.post("/transmute")
async def transmute(file: UploadFile = File(...), language: str = None):
    # Save temp file
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_file_path = f"temp_uploads/{temp_filename}"
    
    os.makedirs("temp_uploads", exist_ok=True)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"DEBUG: Starting transcribe_audio for {temp_file_path}")
        text = await transcribe_audio(temp_file_path, language)
        print(f"DEBUG: Transcription complete. Length: {len(text)}")
        return {"text": text}
        
    except Exception as e:
        print(f"ERROR: Exception in transcribe endpoint: {e}")
        import traceback
        traceback.print_exc()
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
    language: str = Body(default="English", embed=True),
    variation: bool = Body(default=False, embed=True),
    db: AsyncSession = Depends(get_db)
):
    print(f"DEBUG: Starting generate_executive_suite for text length: {len(text)}")
    result = await generate_executive_suite(text, language, variation)
    print("DEBUG: Strategic Suite generation complete.")
    
    # Persist session
    session_id = str(uuid.uuid4())
    new_session = Session(
        id=session_id,
        text=text,
        analysis=analysis,
        data=result
    )
    db.add(new_session)
    await db.commit()
    
    return {"session_id": session_id, "data": result}

@router.post("/publish/{session_id}")
async def publish_session(session_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_public:
        # Extract title from core thesis for slug
        core_thesis = ""
        if isinstance(session.data, dict):
            core_thesis = session.data.get("free_tier", {}).get("core_thesis") or session.data.get("core_thesis", "")
        
        session.is_public = True
        session.public_slug = generate_slug(core_thesis or "strategy-plan")
        await db.commit()
    
    return {
        "isPublic": session.is_public,
        "publicSlug": session.public_slug,
        "publicUrl": f"/p/{session.public_slug}"
    }

@router.get("/public/{slug}")
async def get_public_session(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Session).where(Session.public_slug == slug, Session.is_public == True)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Public session not found")
    
    # Strictly return only free_tier data
    free_data = {}
    if isinstance(session.data, dict):
        free_data = session.data.get("free_tier") or {
            "core_thesis": session.data.get("core_thesis"),
            "strategic_pillars": session.data.get("strategic_pillars"),
            "tactical_steps": session.data.get("tactical_steps")
        }
    
    return {
        "text": session.text,
        "analysis": {
            "tone": session.analysis.get("tone") if isinstance(session.analysis, dict) else "Neutral"
        },
        "data": {
            "free_tier": free_data
        },
        "created_at": session.created_at
    }


# ===== THE INCUBATOR (Drafts System) =====
from app.services.transcription import transcribe_audio
from app.models import Draft
import google.generativeai as genai
from app.core.config import settings

# genai configuration removed, it is centralized in config.py

async def quick_categorize(transcript: str) -> dict:
    """
    Fast Gemini Flash call to categorize a raw thought dump.
    Returns: { title: "3-5 word title", tag: "🔥 RANT" | "💡 IDEA" | "⚡ TASK" }
    """
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""Analyze this raw thought dump and provide:
1. A catchy 3-5 word title that captures the essence
2. A tag category: exactly one of "🔥 RANT", "💡 IDEA", or "⚡ TASK"

TRANSCRIPT:
{transcript[:1000]}

Respond in JSON format ONLY:
{{"title": "...", "tag": "..."}}
"""
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.5,
                response_mime_type="application/json",
            )
        )
        import json
        result = json.loads(response.text)
        return result
    except Exception as e:
        print(f"DEBUG: [QuickCategorize] Error: {e}")
        return {"title": "Untitled Thought", "tag": "💡 IDEA"}


@router.post("/save_draft")
async def save_draft(
    file: UploadFile = File(...), 
    language: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    The Incubator: Stash raw ideas for later.
    1. Transcribe audio
    2. Quick categorize with Gemini Flash
    3. Save to drafts table
    """
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_file_path = f"temp_uploads/{temp_filename}"
    
    os.makedirs("temp_uploads", exist_ok=True)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Transcribe
        transcript = await transcribe_audio(temp_file_path, language)
        
        # 2. Quick categorize
        categorization = await quick_categorize(transcript)
        
        # 3. Save draft
        draft_id = str(uuid.uuid4())
        new_draft = Draft(
            id=draft_id,
            title=categorization.get("title", "Untitled Thought"),
            tag=categorization.get("tag", "💡 IDEA"),
            transcript=transcript
        )
        db.add(new_draft)
        await db.commit()
        
        return {
            "draft_id": draft_id,
            "title": new_draft.title,
            "tag": new_draft.tag,
            "transcript": transcript[:200] + "..." if len(transcript) > 200 else transcript
        }
        
    except Exception as e:
        print(f"ERROR: Exception in save_draft endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@router.get("/drafts")
async def get_drafts(db: AsyncSession = Depends(get_db)):
    """Get all drafts for the Incubator view"""
    stmt = select(Draft).order_by(Draft.created_at.desc())
    result = await db.execute(stmt)
    drafts = result.scalars().all()
    
    return [
        {
            "id": d.id,
            "title": d.title,
            "tag": d.tag,
            "transcript": d.transcript[:150] + "..." if len(d.transcript) > 150 else d.transcript,
            "created_at": d.created_at
        }
        for d in drafts
    ]
# ===== THE LOOP (Decision Memory) =====
from datetime import datetime, timedelta
from app.models import Decision
from app.services.generation import audit_judgment

@router.post("/decisions/seal")
async def seal_wager(
    session_id: str = Body(..., embed=True),
    prediction: str = Body(..., embed=True),
    days: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    """Seal a time capsule: Capture a prediction for future audit."""
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    decision_id = str(uuid.uuid4())
    review_date = datetime.now() + timedelta(days=days)
    
    new_decision = Decision(
        id=decision_id,
        original_session_id=session_id,
        original_transcript=session.text,
        prediction=prediction,
        review_date=review_date,
        status="PENDING"
    )
    
    db.add(new_decision)
    await db.commit()
    
    return {
        "decision_id": decision_id,
        "review_date": review_date,
        "message": "Time Capsule Sealed. Judgment locked."
    }

@router.get("/decisions/history")
async def get_decision_history(db: AsyncSession = Depends(get_db)):
    """Fetch all wagers, updating statuses to DUE if review_date has passed."""
    now = datetime.now()
    
    # Update PENDING to DUE if time has passed
    # This is a lazy update on fetch
    # Note: In a real app, this might be a background task
    stmt_update = select(Decision).where(Decision.status == "PENDING", Decision.review_date <= now)
    result = await db.execute(stmt_update)
    pending_to_due = result.scalars().all()
    for d in pending_to_due:
        d.status = "DUE"
    
    if pending_to_due:
        await db.commit()

    stmt = select(Decision).order_by(Decision.created_at.desc())
    result = await db.execute(stmt)
    decisions = result.scalars().all()
    
    return [
        {
            "id": d.id,
            "prediction": d.prediction,
            "review_date": d.review_date,
            "status": d.status,
            "accuracy_score": d.accuracy_score,
            "blind_spot": d.blind_spot,
            "growth_insight": d.growth_insight,
            "created_at": d.created_at
        }
        for d in decisions
    ]

@router.post("/decisions/audit/{decision_id}")
async def audit_decision(
    decision_id: str,
    file: UploadFile = File(...),
    language: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Reckoning Phase: Transcribe update and compare with past prediction."""
    stmt = select(Decision).where(Decision.id == decision_id)
    result = await db.execute(stmt)
    decision = result.scalar_one_or_none()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    # 1. Transcribe new update
    temp_filename = f"audit_{uuid.uuid4()}_{file.filename}"
    temp_file_path = f"temp_uploads/{temp_filename}"
    os.makedirs("temp_uploads", exist_ok=True)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        update_transcript = await transcribe_audio(temp_file_path, language)
        
        # 2. Audit judgment with Gemini
        audit_result = await audit_judgment(decision.original_transcript, update_transcript)
        
        # 3. Update decision
        decision.update_transcript = update_transcript
        decision.accuracy_score = audit_result.get("accuracy_score", 0)
        decision.blind_spot = audit_result.get("blind_spot", "N/A")
        decision.growth_insight = audit_result.get("growth_insight", "N/A")
        decision.status = "AUDITED"
        
        await db.commit()
        
        return {
            "status": "AUDITED",
            "accuracy_score": decision.accuracy_score,
            "blind_spot": decision.blind_spot,
            "growth_insight": decision.growth_insight
        }
        
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
