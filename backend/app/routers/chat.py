from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import Interaction
from app.schemas import ChatMessageIn, ChatMessageOut, InteractionOut
from app.agent.graph import run_agent

router = APIRouter(prefix="/api/chat", tags=["Chat Agent"])


@router.post("/", response_model=ChatMessageOut)
def chat_with_agent(payload: ChatMessageIn, db: Session = Depends(get_db)):
    """Conversational path: the LangGraph ReAct agent decides which of the 5
    tools to call based on the rep's natural-language message."""
    result = run_agent(payload.session_id, payload.message)

    # Fetch the most recent interaction so the frontend can update its list
    last = db.query(Interaction).order_by(Interaction.created_at.desc()).first()
    last_out = None
    if last:
        try:
            last_out = InteractionOut.model_validate(last)
        except Exception:
            pass

    return ChatMessageOut(
        session_id=payload.session_id,
        reply=result["reply"],
        tool_calls=result["tool_calls"],
        last_interaction=last_out,
    )
