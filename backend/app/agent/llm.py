"""
Groq LLM setup for the LangGraph agent.
Primary model: gemma2-9b-it (fast, cheap — good for tool-routing + extraction)
Fallback model: llama-3.3-70b-versatile (used for complex reasoning if needed)
"""
from langchain_groq import ChatGroq
from app.config import settings

llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_MODEL,
    temperature=0.2,
)

llm_fallback = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_MODEL_FALLBACK,
    temperature=0.3,
)
