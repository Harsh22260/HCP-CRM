from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import interactions, chat
from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-First HCP CRM API",
    description="Log Interaction module — structured form + LangGraph conversational agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interactions.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "hcp-crm-ai backend"}


@app.get("/health")
def health():
    return {"status": "healthy"}
