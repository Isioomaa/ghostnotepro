from sqlalchemy import String, Boolean, JSON, Column, Integer, DateTime
from sqlalchemy.sql import func
from .database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True) # UUID
    text = Column(String)
    analysis = Column(JSON)
    data = Column(JSON)
    is_public = Column(Boolean, default=False)
    public_slug = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Draft(Base):
    __tablename__ = "drafts"

    id = Column(String, primary_key=True, index=True)  # UUID
    title = Column(String)  # 3-5 word auto-generated title
    tag = Column(String)    # '🔥 RANT', '💡 IDEA', '⚡ TASK'
    transcript = Column(String)  # Raw transcription
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, index=True) # UUID
    original_session_id = Column(String, index=True)
    original_transcript = Column(String)
    prediction = Column(String)
    review_date = Column(DateTime(timezone=True))
    
    # Results (populated after audit)
    update_transcript = Column(String, nullable=True)
    accuracy_score = Column(Integer, nullable=True) # 0-100
    blind_spot = Column(String, nullable=True)
    growth_insight = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, DUE, AUDITED

    created_at = Column(DateTime(timezone=True), server_default=func.now())
