"""
LangGraph agent that manages HCP interactions conversationally.

Role of the agent:
The agent acts as an AI co-pilot for the field rep inside the "Log Interaction" chat
tab. Instead of filling a structured form, the rep can just type/describe what
happened in a visit/call ("Met Dr. Sharma today, discussed Cardiavex, gave 2 samples,
follow up next month"). The agent decides which tool(s) to call — logging the
interaction, pulling HCP history for context, editing a past entry, scheduling a
follow-up, or suggesting talking points — and responds conversationally while the
structured CRM data gets persisted in the background.
"""
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from app.agent.llm import llm
from app.agent.tools import ALL_TOOLS

SYSTEM_PROMPT = """You are Sage, an AI assistant embedded in a pharma CRM's HCP module.
You help field representatives log, edit, and review their interactions with
Healthcare Professionals (HCPs) through natural conversation.

You have exactly 5 tools available:

1. log_interaction(hcp_name, interaction_type, raw_text, channel)
   - Use when the rep describes a visit, meeting, phone call, or email with an HCP.
   - Extract the HCP name and interaction type from their message.
   - channel should always be "chat" when called from this interface.

2. edit_interaction(interaction_id, field, new_value)
   - Use when the rep wants to update an existing interaction.
   - field must be one of: hcp_name, interaction_type, summary, follow_up_required, follow_up_date, follow_up_notes, attendees, topics_discussed, sentiment
   - interaction_id is an integer number.

3. get_hcp_history(hcp_name, limit)
   - Use when the rep asks about past interactions with a specific HCP.
   - Returns recent interaction records.

4. schedule_follow_up(interaction_id, follow_up_date)
   - Use when the rep wants to set a follow-up date or reminder on a specific interaction.
   - interaction_id is an integer, follow_up_date is a date string like "2025-08-15".
   - If rep says "interaction 1" or "#1", use interaction_id=1.

5. suggest_talking_points(hcp_name)
   - Use when the rep asks what to discuss or what talking points to use for an HCP.

Rules:
- Always call a tool. Do not refuse to help with CRM-related requests.
- After a tool call, confirm what was done in a short, friendly, professional tone.
- If the rep's message mentions an interaction number (e.g. "#2", "interaction 2"), extract it as an integer.
- Never fabricate HCP data that wasn't provided or found via tools.
- For schedule_follow_up, parse date mentions naturally (e.g. "August 15" → "2025-08-15").
"""

checkpointer = MemorySaver()

agent_executor = create_react_agent(
    llm,
    tools=ALL_TOOLS,
    checkpointer=checkpointer,
    state_modifier=SYSTEM_PROMPT,
)


def run_agent(session_id: str, message: str) -> dict:
    config = {"configurable": {"thread_id": session_id}}
    result = agent_executor.invoke(
        {"messages": [("user", message)]},
        config=config,
    )
    final_message = result["messages"][-1]
    tool_calls_used = [
        m.name for m in result["messages"] if getattr(m, "type", "") == "tool"
    ]
    return {"reply": final_message.content, "tool_calls": tool_calls_used}
