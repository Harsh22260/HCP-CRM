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

    from app.models.db_models import HCP
    hcp = db.query(HCP).filter(HCP.name.ilike(payload.hcp_name.strip())).first()
    if not hcp:
        hcp = HCP(
            name=payload.hcp_name.strip(),
            specialty=extracted.get("hcp_specialty") or "General Practitioner",
            hospital=extracted.get("hcp_hospital") or "General Hospital",
            email=extracted.get("hcp_email"),
            phone=extracted.get("hcp_phone")
        )
        db.add(hcp)
        db.commit()
        db.refresh(hcp)

    record = Interaction(
        hcp_id=hcp.id,
        hcp_name=hcp.name,
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


@router.get("/dashboard/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Computes dynamic statistics + monthly trend based on DB data."""
    import json
    from collections import defaultdict
    from datetime import datetime

    records = db.query(Interaction).all()
    total_visits = len(records)
    pos_count = neu_count = neg_count = pending_follow_ups = total_samples = 0
    product_counts = {}
    monthly_counts = defaultdict(int)

    for r in records:
        sent = (r.sentiment or "neutral").lower()
        if "pos" in sent:
            pos_count += 1
        elif "neg" in sent:
            neg_count += 1
        else:
            neu_count += 1

        if r.follow_up_required == "yes":
            pending_follow_ups += 1

        if r.samples_distributed:
            try:
                samples = r.samples_distributed
                if isinstance(samples, str):
                    samples = json.loads(samples)
                if isinstance(samples, list):
                    for item in samples:
                        qty = item.get("qty") or item.get("quantity") or 1
                        total_samples += int(qty)
            except Exception:
                pass

        if r.products_discussed:
            try:
                prods = r.products_discussed
                if isinstance(prods, str):
                    prods = json.loads(prods)
                if isinstance(prods, list):
                    for p in prods:
                        p_name = str(p).strip()
                        if p_name:
                            product_counts[p_name] = product_counts.get(p_name, 0) + 1
            except Exception:
                pass

        if r.created_at:
            month_key = r.created_at.strftime("%b %Y")
            monthly_counts[month_key] += 1

    pos_pct = int((pos_count / total_visits) * 100) if total_visits > 0 else 0
    top_products = [
        {"name": k, "count": v}
        for k, v in sorted(product_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    monthly_trend = []
    for k, v in monthly_counts.items():
        try:
            dt = datetime.strptime(k, "%b %Y")
            monthly_trend.append({"month": k, "visits": v, "_dt": dt})
        except Exception:
            pass
    monthly_trend.sort(key=lambda x: x["_dt"])
    monthly_trend = [{"month": x["month"], "visits": x["visits"]} for x in monthly_trend]

    return {
        "total_visits": total_visits,
        "positive_percentage": pos_pct,
        "pending_follow_ups": pending_follow_ups,
        "samples_distributed": total_samples,
        "sentiment_breakdown": {"positive": pos_count, "neutral": neu_count, "negative": neg_count},
        "top_products": top_products[:5],
        "monthly_trend": monthly_trend,
    }


@router.get("/dashboard/export")
def export_interactions_csv(db: Session = Depends(get_db)):
    """Generates a dynamic CSV export of all interactions."""
    import csv, io
    from fastapi.responses import StreamingResponse

    records = db.query(Interaction).order_by(Interaction.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "HCP ID", "HCP Name", "Interaction Type", "Channel",
        "Date", "Time", "Attendees", "Sentiment", "Summary",
        "Products Discussed", "Outcomes", "Follow-up Required", "Follow-up Date", "Follow-up Notes"
    ])
    for r in records:
        prods = r.products_discussed
        if isinstance(prods, list):
            prods = ", ".join(prods)
        writer.writerow([
            r.id, r.hcp_id, r.hcp_name, r.interaction_type, r.channel,
            r.date, r.time, r.attendees, r.sentiment, r.summary,
            prods, r.outcomes, r.follow_up_required, r.follow_up_date, r.follow_up_notes
        ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hcp_interactions_export.csv"}
    )


@router.get("/samples/summary")
def get_samples_summary(db: Session = Depends(get_db)):
    """Aggregated sample distribution per product and per doctor."""
    import json
    records = db.query(Interaction).all()
    product_totals = {}
    doctor_samples = {}

    for r in records:
        if not r.samples_distributed:
            continue
        try:
            samples = r.samples_distributed
            if isinstance(samples, str):
                samples = json.loads(samples)
            if not isinstance(samples, list):
                continue
            for item in samples:
                prod = str(item.get("product") or item.get("name") or "Unknown").strip()
                qty = int(item.get("qty") or item.get("quantity") or 1)
                if prod not in product_totals:
                    product_totals[prod] = {"qty": 0, "doctors": set()}
                product_totals[prod]["qty"] += qty
                product_totals[prod]["doctors"].add(r.hcp_name)
                if r.hcp_name not in doctor_samples:
                    doctor_samples[r.hcp_name] = {}
                doctor_samples[r.hcp_name][prod] = doctor_samples[r.hcp_name].get(prod, 0) + qty
        except Exception:
            pass

    products_list = [
        {"product": k, "total_qty": v["qty"], "doctor_count": len(v["doctors"]), "doctors": list(v["doctors"])}
        for k, v in sorted(product_totals.items(), key=lambda x: x[1]["qty"], reverse=True)
    ]
    doctor_list = [
        {"hcp_name": doc, "samples": [{"product": p, "qty": q} for p, q in prods.items()]}
        for doc, prods in doctor_samples.items()
    ]
    return {"by_product": products_list, "by_doctor": doctor_list, "total_products_tracked": len(products_list)}


@router.post("/{interaction_id}/draft-followup")
def draft_followup_message(interaction_id: int, db: Session = Depends(get_db)):
    """Uses LLM to draft a professional follow-up message based on the interaction."""
    from app.agent.llm import llm
    record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Interaction not found")

    context = record.summary or record.topics_discussed or record.raw_text or ""
    follow_up_notes = record.follow_up_notes or "General follow-up"
    prompt = f"""You are a professional pharma field representative. Write a brief, polished follow-up message
to send to Dr. {record.hcp_name} after a {record.interaction_type}.

Interaction Summary: {context}
Follow-up Objective: {follow_up_notes}
Products Discussed: {record.products_discussed}

Write a short, professional follow-up email (Subject line + Body, 3-4 sentences max).
Keep it warm but professional. Sign off as "Harsh, Field Representative". No placeholders.
"""
    response = llm.invoke(prompt)
    return {"draft": response.content.strip(), "interaction_id": interaction_id}


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
