from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.database import Base


class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255))
    hospital = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, index=True, nullable=True)
    hcp_name = Column(String(255), nullable=False)
    interaction_type = Column(String(50))       # Meeting, Phone Call, Email, Conference
    channel = Column(String(50))                # form / chat
    date = Column(String(50))                   # interaction date
    time = Column(String(50))                   # interaction time
    attendees = Column(Text)                    # comma-separated attendee names
    topics_discussed = Column(Text)             # free text topics
    raw_text = Column(Text)                     # original chat/form input
    summary = Column(Text)                      # LLM-generated summary
    sentiment = Column(String(50))              # Positive, Neutral, Negative
    products_discussed = Column(JSON)           # list of product names
    samples_distributed = Column(JSON)          # list of {product, qty}
    materials_shared = Column(JSON)             # list of shared materials
    outcomes = Column(Text)                     # outcomes/agreements text area
    follow_up_required = Column(String(10))
    follow_up_date = Column(String(50))
    follow_up_notes = Column(Text)              # follow-up action notes
    entities = Column(JSON)                     # extracted entities dump
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    role = Column(String(20))   # user / assistant / tool
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
