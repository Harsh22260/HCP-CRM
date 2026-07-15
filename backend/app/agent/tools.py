"""
5 LangGraph Tools for the HCP Sales Agent:

1. log_interaction        -> Creates a new interaction record (uses LLM to summarize + extract entities)
2. edit_interaction        -> Updates an existing interaction record
3. get_hcp_history          -> Fetches past interactions for a given HCP (context for the rep before a visit)
4. schedule_follow_up       -> Sets/updates a follow-up reminder on an interaction
5. suggest_talking_points   -> Uses the LLM to suggest next-visit talking points based on HCP history
"""
import json
from typing import Optional, List
from langchain_core.tools import tool
from app.database import SessionLocal
from app.models.db_models import Interaction
from app.agent.llm import llm


def _extract_entities_and_summary(raw_text: str) -> dict:
    """Helper: uses Groq LLM to summarize the interaction and pull structured entities."""
    prompt = f"""You are a pharma CRM assistant. Read the field rep's interaction note below and
return ONLY a valid JSON object (no markdown, no extra text) with these keys:
- summary: 1-2 sentence professional summary
- sentiment: one of "positive", "neutral", "negative"
- products_discussed: list of drug/product names mentioned
- samples_distributed: list of objects like {{"product": "...", "qty": number}}
- follow_up_required: "yes" or "no"
- follow_up_date: a date string if mentioned, else null
- hcp_name: the HCP/doctor name if mentioned, else null
- interaction_type: one of "Meeting", "Phone Call", "Email", "Conference" if determinable, else "Meeting"
- attendees: comma-separated list of other attendees mentioned, else null
- materials_shared: list of materials/brochures shared, else empty list

Interaction note:
\"\"\"{raw_text}\"\"\"
"""
    response = llm.invoke(prompt)
    text = response.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(text)
        if "sentiment" in data and isinstance(data["sentiment"], str):
            data["sentiment"] = data["sentiment"].strip().lower()
        return data
    except Exception:
        return {
            "summary": raw_text[:200],
            "sentiment": "neutral",
            "products_discussed": [],
            "samples_distributed": [],
            "follow_up_required": "no",
            "follow_up_date": None,
            "hcp_name": None,
            "interaction_type": "Meeting",
            "attendees": None,
            "materials_shared": [],
        }


@tool
def log_interaction(hcp_name: str, interaction_type: str, raw_text: str, channel: str = "chat") -> str:
    """Log a new HCP interaction. Extracts summary, sentiment, products discussed,
    samples distributed, materials shared and follow-up info from the raw free-text note using the LLM.
    Use this whenever the rep describes a visit, call, or email that needs to be recorded."""
    extracted = _extract_entities_and_summary(raw_text)
    db = SessionLocal()
    try:
        record = Interaction(
            hcp_name=hcp_name,
            interaction_type=interaction_type,
            channel=channel,
            raw_text=raw_text,
            topics_discussed=raw_text,
            summary=extracted.get("summary"),
            sentiment=extracted.get("sentiment"),
            products_discussed=extracted.get("products_discussed", []),
            samples_distributed=extracted.get("samples_distributed", []),
            materials_shared=extracted.get("materials_shared", []),
            follow_up_required=extracted.get("follow_up_required", "no"),
            follow_up_date=extracted.get("follow_up_date"),
            attendees=extracted.get("attendees"),
            entities=extracted,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return f"Interaction #{record.id} logged for {hcp_name}. Summary: {extracted.get('summary')}"
    finally:
        db.close()


@tool
def edit_interaction(interaction_id: int, field: str, new_value: str) -> str:
    """Edit an existing logged interaction. 'field' must be one of:
    hcp_name, interaction_type, summary, follow_up_required, follow_up_date, attendees, topics_discussed, sentiment.
    Use this when the rep wants to correct or update a previously logged interaction."""
    allowed_fields = {
        "hcp_name", "interaction_type", "summary",
        "follow_up_required", "follow_up_date",
        "attendees", "topics_discussed", "sentiment"
    }
    if field not in allowed_fields:
        return f"Cannot edit field '{field}'. Allowed fields: {', '.join(allowed_fields)}"
    db = SessionLocal()
    try:
        record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not record:
            return f"No interaction found with id {interaction_id}"
        
        # Normalize sentiment if that field is being edited
        val_to_set = new_value
        if field == "sentiment" and isinstance(new_value, str):
            val_to_set = new_value.strip().lower()

        setattr(record, field, val_to_set)
        db.commit()
        return f"Interaction #{interaction_id} updated: {field} -> {val_to_set}"
    finally:
        db.close()


@tool
def get_hcp_history(hcp_name: str, limit: int = 5) -> str:
    """Fetch the most recent past interactions for a given HCP by name.
    Useful to give the rep context before a new visit or call."""
    db = SessionLocal()
    try:
        records: List[Interaction] = (
            db.query(Interaction)
            .filter(Interaction.hcp_name.ilike(f"%{hcp_name}%"))
            .order_by(Interaction.created_at.desc())
            .limit(limit)
            .all()
        )
        if not records:
            return f"No past interactions found for {hcp_name}."
        lines = [
            f"#{r.id} [{r.interaction_type}] {r.created_at}: {r.summary or r.topics_discussed or r.raw_text}"
            for r in records
        ]
        return "\n".join(lines)
    finally:
        db.close()


@tool
def schedule_follow_up(interaction_id: int, follow_up_date: str) -> str:
    """Set or update the follow-up date on a logged interaction, marking follow_up_required as yes."""
    db = SessionLocal()
    try:
        record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not record:
            return f"No interaction found with id {interaction_id}"
        record.follow_up_date = follow_up_date
        record.follow_up_required = "yes"
        db.commit()
        return f"Follow-up scheduled for interaction #{interaction_id} on {follow_up_date}"
    finally:
        db.close()


@tool
def suggest_talking_points(hcp_name: str) -> str:
    """Use the HCP's interaction history to suggest 3 talking points for the rep's next visit."""
    db = SessionLocal()
    try:
        records = (
            db.query(Interaction)
            .filter(Interaction.hcp_name.ilike(f"%{hcp_name}%"))
            .order_by(Interaction.created_at.desc())
            .limit(5)
            .all()
        )
        history_text = "\n".join(
            [f"- {r.summary or r.topics_discussed or r.raw_text}" for r in records]
        ) or "No prior history."
        prompt = f"""Based on this HCP's interaction history, suggest 3 short, specific talking
points a pharma field rep should raise on their next visit. Return as a plain numbered list only.

History for {hcp_name}:
{history_text}
"""
        response = llm.invoke(prompt)
        return response.content.strip()
    finally:
        db.close()


ALL_TOOLS = [
    log_interaction,
    edit_interaction,
    get_hcp_history,
    schedule_follow_up,
    suggest_talking_points,
]
