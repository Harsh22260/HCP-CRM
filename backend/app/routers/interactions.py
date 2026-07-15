from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.db_models import Interaction
from app.schemas import InteractionCreate, InteractionUpdate, InteractionOut
from app.agent.tools import _extract_entities_and_summary

router = APIRouter(prefix="/api/interactions", tags=["Interactions"])


@router.post("/", response_model=InteractionOut)
def create_interaction(payload: InteractionCreate, db: Session = Depends(get_db)):
    """Structured-form path: runs the topics/notes through the LLM for summary/sentiment
    if raw_text is provided, otherwise stores the form fields as-is."""
    extracted = {}
    if payload.raw_text:
        extracted = _extract_entities_and_summary(payload.raw_text)

    record = Interaction(
        hcp_name=payload.hcp_name,
        interaction_type=payload.interaction_type,
        channel=payload.channel,
        date=payload.date,
        time=payload.time,
        attendees=payload.attendees,
        topics_discussed=payload.raw_text,
        raw_text=payload.raw_text,
        summary=extracted.get("summary"),
        sentiment=extracted.get("sentiment", "neutral"),
        products_discussed=payload.products_discussed or extracted.get("products_discussed", []),
        samples_distributed=payload.samples_distributed or extracted.get("samples_distributed", []),
        materials_shared=payload.materials_shared or extracted.get("materials_shared", []),
        outcomes=payload.outcomes or extracted.get("outcomes"),
        follow_up_required=payload.follow_up_required or extracted.get("follow_up_required", "no"),
        follow_up_date=payload.follow_up_date or extracted.get("follow_up_date"),
        follow_up_notes=payload.follow_up_notes or extracted.get("follow_up_notes"),
        entities=extracted,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/", response_model=List[InteractionOut])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).all()


@router.get("/{interaction_id}", response_model=InteractionOut)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return record


@router.put("/{interaction_id}", response_model=InteractionOut)
def update_interaction(interaction_id: int, payload: InteractionUpdate, db: Session = Depends(get_db)):
    record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Interaction not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Interaction not found")
    db.delete(record)
    db.commit()
    return {"detail": f"Interaction {interaction_id} deleted"}
