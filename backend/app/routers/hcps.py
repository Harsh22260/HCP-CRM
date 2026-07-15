from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.database import get_db
from app.models.db_models import HCP, Interaction
from app.schemas import HCPCreate, HCPOut, InteractionOut

router = APIRouter(prefix="/api/hcps", tags=["HCP Directory"])


@router.get("/", response_model=List[HCPOut])
def list_hcps(db: Session = Depends(get_db)):
    return db.query(HCP).order_by(HCP.name.asc()).all()


@router.post("/", response_model=HCPOut)
def create_hcp(payload: HCPCreate, db: Session = Depends(get_db)):
    existing = db.query(HCP).filter(HCP.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="HCP with this name already exists")
    record = HCP(
        name=payload.name.strip(),
        specialty=payload.specialty or "General Practitioner",
        hospital=payload.hospital or "General Hospital",
        email=payload.email,
        phone=payload.phone
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{hcp_id}", response_model=HCPOut)
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    record = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="HCP profile not found")
    return record


@router.get("/{hcp_id}/interactions", response_model=List[InteractionOut])
def get_hcp_interactions(hcp_id: int, db: Session = Depends(get_db)):
    """Return all past interactions for a given HCP, newest first."""
    hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    interactions = (
        db.query(Interaction)
        .filter(Interaction.hcp_id == hcp_id)
        .order_by(Interaction.created_at.desc())
        .all()
    )
    return interactions


@router.get("/{hcp_id}/priority")
def get_hcp_priority(hcp_id: int, db: Session = Depends(get_db)):
    """Compute an AI Visit Priority Score (1-10) for the HCP based on:
    - Days since last interaction (stale = higher priority)
    - Average sentiment (negative/neutral = needs attention)
    - Pending follow-up (yes = urgent boost)
    - Total interactions (low = less known = higher priority)
    """
    hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")

    interactions = (
        db.query(Interaction)
        .filter(Interaction.hcp_id == hcp_id)
        .order_by(Interaction.created_at.desc())
        .all()
    )

    score = 5  # baseline medium

    # Factor 1: Days since last visit
    if interactions:
        last = interactions[0]
        if last.created_at:
            now = datetime.now(timezone.utc)
            last_dt = last.created_at
            if last_dt.tzinfo is None:
                last_dt = last_dt.replace(tzinfo=timezone.utc)
            days_ago = (now - last_dt).days
            if days_ago > 30:
                score += 3
            elif days_ago > 14:
                score += 2
            elif days_ago > 7:
                score += 1
    else:
        # Never visited = high priority
        score += 4

    # Factor 2: Average sentiment
    if interactions:
        neg = sum(1 for i in interactions if (i.sentiment or "").lower() == "negative")
        neu = sum(1 for i in interactions if (i.sentiment or "").lower() == "neutral")
        if neg > 0:
            score += 2
        elif neu > len(interactions) // 2:
            score += 1

    # Factor 3: Pending follow-up
    has_pending = any(i.follow_up_required == "yes" for i in interactions)
    if has_pending:
        score += 2

    # Factor 4: Low interaction count (less known)
    if len(interactions) < 2:
        score += 1

    # Clamp to 1–10
    score = max(1, min(10, score))

    if score >= 7:
        level = "high"
        color = "#EF4444"
        label = "🔴 High Priority"
    elif score >= 4:
        level = "medium"
        color = "#F59E0B"
        label = "🟡 Medium Priority"
    else:
        level = "low"
        color = "#22C55E"
        label = "🟢 Low Priority"

    return {
        "hcp_id": hcp_id,
        "hcp_name": hcp.name,
        "score": score,
        "level": level,
        "color": color,
        "label": label,
        "total_interactions": len(interactions),
        "has_pending_followup": has_pending,
    }
