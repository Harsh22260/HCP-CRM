# 🏥 AI-First HCP CRM — Log Interaction Module

> **An AI-powered Customer Relationship Management system for Pharma Field Representatives**  
> Built with React + Redux (frontend), FastAPI + LangGraph + Groq (backend), SQLite/PostgreSQL (database)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [LangGraph Agent & 5 Tools](#langgraph-agent--5-tools)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

---

## Overview

This is a **Log Interaction Screen** for a pharma CRM's HCP (Healthcare Professional) module. Field representatives can:

1. **Structured Form** — Fill out a detailed form with HCP name, interaction type, date/time, attendees, topics, products discussed, samples distributed, materials shared, outcomes, and follow-up details.
2. **Conversational Chat (AI)** — Talk to **Sage**, an AI assistant powered by LangGraph + Groq LLM. Sage understands natural language and automatically invokes the right CRM tool.
3. **Full-Featured Sidebar Navigation** — Seamlessly switch between routed modules like the HCP Directory, Analytics Dashboard, Follow-up lists, Product catalog, Reports exporter, and Settings.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Redux Toolkit, Axios, Vite |
| Styling   | Vanilla CSS (Google Inter font) |
| Backend   | Python 3.11+, FastAPI, Uvicorn |
| AI Agent  | LangGraph (ReAct agent), LangChain-Groq |
| LLMs      | Groq `llama-3.3-70b-versatile` (primary), `gemma2-9b-it` (configurable) |
| Database  | SQLite (dev) / PostgreSQL (prod) via SQLAlchemy |

---

## LangGraph Agent & 5 Tools

The **LangGraph ReAct Agent** (`Sage`) acts as an AI co-pilot for field reps. It lives inside the "AI Assistant" chat panel and decides which tool to invoke based on the rep's natural language message.

### Role of the Agent

Instead of filling out a structured form, the rep can describe what happened in plain English. Sage parses the message, extracts entities (HCP name, products, sentiment, follow-up dates), calls the appropriate tool(s), and confirms back conversationally — while structured CRM data is persisted in the background.

### Tools

#### 1. 📝 `log_interaction` *(Required)*
- **Trigger:** Rep describes a visit/call/email ("Met Dr. Sharma today, discussed Cardiavex, gave 2 samples")
- **What it does:**
  - Sends the raw text to Groq LLM for **entity extraction + summarization**
  - Extracts: `summary`, `sentiment`, `products_discussed`, `samples_distributed`, `follow_up_required`, `follow_up_date`, `attendees`, `materials_shared`
  - Saves a new `Interaction` record to the database
- **LLM Usage:** Yes — structured JSON extraction via prompt

#### 2. ✏️ `edit_interaction` *(Required)*
- **Trigger:** "Edit interaction #3, change summary to..."
- **What it does:**
  - Finds interaction by ID
  - Updates any allowed field: `hcp_name`, `interaction_type`, `summary`, `follow_up_required`, `follow_up_date`, `attendees`, `topics_discussed`
  - Returns confirmation message

#### 3. 📜 `get_hcp_history`
- **Trigger:** "What happened last time with Dr. Patel?" / "Show history for Dr. Kumar"
- **What it does:**
  - Queries interactions by HCP name (case-insensitive partial match)
  - Returns the 5 most recent interactions with summaries
  - Gives reps context before their next visit

#### 4. 🗓️ `schedule_follow_up`
- **Trigger:** "Set a follow-up for interaction #5 on July 15"
- **What it does:**
  - Updates `follow_up_date` on an existing interaction
  - Sets `follow_up_required = yes`
  - Returns confirmation

#### 5. 💡 `suggest_talking_points`
- **Trigger:** "What should I discuss with Dr. Shah next time?"
- **What it does:**
  - Fetches recent interaction history for the HCP
  - Sends history to Groq LLM
  - Returns 3 specific, actionable talking points tailored to the HCP's interests and past discussions
- **LLM Usage:** Yes — reasoning over past interactions

---

## Project Structure

```
App/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── graph.py          # LangGraph ReAct agent setup
│   │   │   ├── llm.py            # Groq LLM configuration
│   │   │   └── tools.py          # 5 LangGraph tools
│   │   ├── models/
│   │   │   └── db_models.py      # SQLAlchemy ORM models
│   │   ├── routers/
│   │   │   ├── chat.py           # POST /api/chat/
│   │   │   └── interactions.py   # CRUD /api/interactions/
│   │   ├── config.py             # Pydantic settings
│   │   ├── database.py           # SQLAlchemy engine/session
│   │   ├── main.py               # FastAPI app
│   │   └── schemas.py            # Pydantic schemas
│   ├── .env                      # Environment variables
│   └── requirements.txt
│
└── frontend/
    ├── src/
        ├── api/
        │   └── client.js          # Axios base client
        ├── components/
        │   ├── Chat/
        │   │   └── AiAssistant.jsx  # Chat panel with Sage
        │   ├── LogInteraction/
        │   │   ├── InteractionForm.jsx  # Structured form
        │   │   └── InteractionList.jsx  # Recent interactions
        │   └── common/
        │       └── Sidebar.jsx     # Navigation menu with active routing
        ├── pages/
        │   ├── LogInteractionPage.jsx  # Primary interaction logger
        │   ├── HcpDirectoryPage.jsx   # [NEW] HCP directory with filters
        │   ├── AnalyticsPage.jsx      # [NEW] KPI & sentiment dashboard
        │   ├── FollowUpsPage.jsx      # [NEW] Follow-up task reminders
        │   ├── ProductsPage.jsx       # [NEW] Detailed sample product catalog
        │   ├── ReportsPage.jsx        # [NEW] Spreadsheet/PDF export logs
        │   └── SettingsPage.jsx       # [NEW] CRM configuration options
        ├── store/
        │   ├── store.js
        │   └── slices/
        │       ├── chatSlice.js
        │       └── interactionsSlice.js
        ├── styles/
        │   └── global.css
        ├── App.jsx                # Router switcher configuration
        └── main.jsx               # Render entry with BrowserRouter
    ├── index.html
    └── package.json
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd App/backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and set your GROQ_API_KEY

# 5. Start the server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd App/frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## Usage

### Structured Form (Left Panel)
1. Fill in **HCP Name** (required), Interaction Type, Date, Time
2. Add attendees, discussion topics
3. Add products discussed using the tag input
4. Add materials shared and samples distributed
5. Set outcomes and toggle follow-up if needed
6. Click **📝 Log Interaction** — the LLM auto-generates a summary and extracts entities

### AI Chat (Right Panel — Sage)
Try these example messages:
- `"Met Dr. Sharma today, discussed Cardiavex 10mg efficacy, gave 3 samples, positive meeting"`
- `"Show me interaction history for Dr. Patel"`
- `"Edit interaction #2 summary to 'Discussed new trial data for Lipitor'"`
- `"Schedule follow-up for interaction #1 on 2025-08-01"`
- `"What should I talk about with Dr. Kumar next visit?"`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/interactions/` | List all interactions |
| `POST` | `/api/interactions/` | Create interaction (form path) |
| `GET` | `/api/interactions/{id}` | Get single interaction |
| `PUT` | `/api/interactions/{id}` | Update interaction |
| `DELETE` | `/api/interactions/{id}` | Delete interaction |
| `POST` | `/api/chat/` | Send message to LangGraph agent |
| `GET` | `/health` | Health check |

---

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_FALLBACK=gemma2-9b-it
DATABASE_URL=sqlite:///./hcp_crm.db
APP_ENV=development
CORS_ORIGINS=http://localhost:5173
```

For **PostgreSQL**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hcp_crm
```

---

## What I Understood from the Task

This assignment required building an **AI-First CRM module** — not just a regular form with an AI feature bolted on, but a system where the AI is the primary interface. Key design decisions:

1. **Dual Input Modes**: Field reps can log interactions via a structured form OR natural language chat — same backend, two UX paths.
2. **LangGraph as the backbone**: The ReAct agent pattern (Reason + Act) is perfect for this use case — the agent thinks about what tool to use, calls it, observes the result, and responds.
3. **LLM for enrichment**: Even on the form path, the LLM is used to auto-generate summaries and extract structured data from free-text notes — reducing manual data entry.
4. **5 domain-specific tools**: Designed around the actual workflow of a pharma field rep — logging, editing, history lookup, follow-up scheduling, and intelligent talking point generation.
5. **Life sciences context**: Every tool, prompt, and field is designed with pharma CRM terminology in mind (HCPs, samples, products, follow-ups, territory management).
# HCP-CRM
