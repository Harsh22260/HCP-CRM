from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class InteractionCreate(BaseModel):
    hcp_id: Optional[int] = None
    hcp_name: str
    interaction_type: str = "Meeting"
    channel: str = "form"
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[str] = None
    raw_text: Optional[str] = None              # topics discussed / free text
    products_discussed: Optional[List[str]] = []
    samples_distributed: Optional[List[Dict[str, Any]]] = []
    materials_shared: Optional[List[str]] = []
    outcomes: Optional[str] = None
    follow_up_required: Optional[str] = "no"
    follow_up_date: Optional[str] = None
    follow_up_notes: Optional[str] = None


class InteractionUpdate(BaseModel):
    hcp_id: Optional[int] = None
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    products_discussed: Optional[List[str]] = None
    samples_distributed: Optional[List[Dict[str, Any]]] = None
    materials_shared: Optional[List[str]] = None
    outcomes: Optional[str] = None
    follow_up_required: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_notes: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None


class InteractionOut(BaseModel):
    id: int
    hcp_id: Optional[int] = None
    hcp_name: str
    interaction_type: Optional[str] = None
    channel: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    raw_text: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    products_discussed: Optional[List[str]] = []
    samples_distributed: Optional[List[Dict[str, Any]]] = []
    materials_shared: Optional[List[str]] = []
    outcomes: Optional[str] = None
    follow_up_required: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_notes: Optional[str] = None

    class Config:
        from_attributes = True


class ChatMessageIn(BaseModel):
    session_id: str
    message: str


class ChatMessageOut(BaseModel):
    session_id: str
    reply: str
    tool_calls: Optional[List[str]] = []
    last_interaction: Optional[InteractionOut] = None


class HCPCreate(BaseModel):
    name: str
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class HCPOut(BaseModel):
    id: int
    name: str
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class SentimentBreakdown(BaseModel):
    positive: int = 0
    neutral: int = 0
    negative: int = 0


class ProductMention(BaseModel):
    name: str
    count: int


class AnalyticsOut(BaseModel):
    total_visits: int
    positive_percentage: int
    pending_follow_ups: int
    samples_distributed: int
    sentiment_breakdown: SentimentBreakdown
    top_products: List[ProductMention]

