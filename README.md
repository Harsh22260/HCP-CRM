# 🏥 AI-First HCP CRM — Log Interaction Module

> **An AI-native CRM system for pharma field representatives**, built around a LangGraph ReAct agent that turns free-text conversation into structured, queryable CRM data — with a full analytics, directory, and reporting layer on top.

**Stack:** React 18 + Redux Toolkit · FastAPI · LangGraph (ReAct + persistent memory) · Groq (`gemma2-9b-it`) · SQLAlchemy (SQLite / PostgreSQL)

---

## 📋 Table of Contents

- [Overview](#overview)
- [What Makes This "AI-First"](#what-makes-this-ai-first)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [LangGraph Agent & 5 Tools](#langgraph-agent--5-tools)
- [Data Model](#data-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [What I Understood From the Task](#what-i-understood-from-the-task)

---

## Overview

This is the **Log Interaction module** of a pharma CRM's HCP (Healthcare Professional) workflow — but it's built out as a working mini-CRM, not just a single screen. A field rep can:

1. **Log via structured form** — full interaction capture: HCP, type, date/time, attendees, products, samples, materials, outcomes, follow-up.
2. **Log via conversation** — talk to **Sage**, a LangGraph agent that extracts everything above from a single free-text sentence.
3. **Browse an HCP Directory** with AI-computed *Visit Priority Scores*.
4. **View a live Analytics dashboard** — sentiment breakdown, monthly visit trend, top products, pending follow-ups — computed on the fly from the database, not hardcoded.
5. **Get AI-drafted follow-up emails** per interaction.
6. **Export interactions to CSV** on demand.

Both entry points — form and chat — write through the **same service functions and the same `Interaction`/`HCP` tables**, so there's no data drift between the two UX paths.

---

## What Makes This "AI-First"

A common failure mode for this kind of assignment is bolting a chatbot onto a CRUD app. This project avoids that in a few concrete ways:

| Feature | Why it's AI-first, not AI-decorated |
|---|---|
| **Entity extraction runs on *both* paths** | Even the structured form pipes free-text notes through the LLM extractor — the model isn't only invoked in the chat tab. |
| **Auto-created HCP profiles** | When Sage logs an interaction for an HCP that doesn't exist yet, it infers specialty, hospital, email, and phone from context and creates the profile — the rep never manually enters HCP master data. |
| **Session-persistent agent memory** | The LangGraph agent uses a `MemorySaver` checkpointer keyed by `session_id` — Sage remembers earlier turns in the same conversation (e.g. "edit that last one" resolves correctly). |
| **AI Visit Priority Score** | `/api/hcps/{id}/priority` isn't a static field — it's computed from recency of last visit, sentiment trend, pending follow-ups, and interaction count, then surfaced as a color-coded score in the directory. |
| **LLM-drafted follow-up messages** | `/api/interactions/{id}/draft-followup` generates a ready-to-send follow-up email grounded in that specific interaction's summary and objective — not a generic template. |

---

## System Architecture

```mermaid
flowchart LR
    subgraph FE["FRONTEND — React 18 + Redux Toolkit"]
        FORM["Structured Form Panel"]
        CHAT["Chat Panel (Sage)"]
        SLICES["interactionsSlice / chatSlice (Redux)"]
        PAGES["Directory · Analytics · Follow-ups · Products · Reports · Settings"]
        FORM --> SLICES
        CHAT --> SLICES
    end

    subgraph BE["BACKEND — FastAPI + SQLAlchemy"]
        R1["/api/interactions router"]
        R2["/api/chat router"]
        R3["/api/hcps router"]
        TOOLS["Shared Service / Tool Layer (tools.py)"]
        AGENT["LangGraph ReAct Agent\n(create_react_agent + MemorySaver checkpoint)"]
        LLM["Groq LLM — gemma2-9b-it (primary)\nllama-3.3-70b-versatile (fallback)"]
        DB[("SQLAlchemy ORM\nSQLite (dev) / PostgreSQL (prod)")]

        R1 --> TOOLS
        R2 --> AGENT
        R3 --> DB
        AGENT --> TOOLS
        TOOLS --> LLM
        TOOLS --> DB
    end

    SLICES -- "HTTP / JSON" --> R1
    SLICES -- "HTTP / JSON" --> R2
    SLICES -- "HTTP / JSON" --> R3
```

**Key architectural decision:** `routers/interactions.py` and `routers/chat.py` both call into `agent/tools.py` (specifically `_extract_entities_and_summary` and the tool functions) rather than duplicating extraction logic. This is what keeps the form path and the conversational path consistent — a single source of truth for "what does an interaction look like once the LLM has processed it."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router, Axios, Vite |
| Styling | Vanilla CSS, Google **Inter** font |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI Agent | LangGraph `create_react_agent` (ReAct pattern) + `MemorySaver` checkpointer |
| LLM Provider | Groq — `gemma2-9b-it` (primary), `llama-3.3-70b-versatile` (fallback / heavier reasoning) |
| ORM / DB | SQLAlchemy 2.0 → SQLite (dev) or PostgreSQL (prod, via `psycopg2-binary`) |
| Migrations | Alembic (wired via `requirements.txt`, ready for schema evolution) |

---

## LangGraph Agent & 5 Tools

**Sage** is a `langgraph.prebuilt.create_react_agent` instance bound to a fixed system prompt and exactly five tools. It runs a Reason → Act → Observe loop per message: it decides intent, calls a tool, reads the tool's return string, and only then produces a natural-language reply — with the tool-call trace surfaced in the UI (`🛠 tools used: ...`) for transparency.

Conversation state is kept per `session_id` via LangGraph's `MemorySaver` checkpointer, so multi-turn references ("edit *that* one", "schedule a follow-up *for it*") resolve against real prior context instead of being stateless.

### 1. 📝 `log_interaction` — *required*
- **Signature:** `log_interaction(hcp_name, interaction_type, raw_text, channel)`
- Sends the rep's free text to the Groq LLM with a strict JSON-extraction prompt, pulling: `summary`, `sentiment`, `products_discussed`, `samples_distributed`, `follow_up_required/date/notes`, and inferred HCP metadata (`specialty`, `hospital`, `email`, `phone`).
- Looks up the HCP by name (case-insensitive); if not found, **auto-creates the HCP profile** from the LLM-inferred fields.
- Persists a new `Interaction` row linked to that HCP.

### 2. ✏️ `edit_interaction` — *required*
- **Signature:** `edit_interaction(interaction_id, field, new_value)`
- Whitelists editable fields (`hcp_name`, `interaction_type`, `summary`, `sentiment`, `follow_up_required`, `follow_up_date`, `follow_up_notes`, `attendees`, `topics_discussed`) — rejects anything outside that set.
- Normalizes `sentiment` casing on write, then confirms the change conversationally.

### 3. 📜 `get_hcp_history`
- **Signature:** `get_hcp_history(hcp_name, limit=5)`
- Case-insensitive partial-match lookup by HCP name, returns the most recent interactions with ID, type, timestamp, and summary — the rep's pre-visit briefing, generated on demand.

### 4. 🗓️ `schedule_follow_up`
- **Signature:** `schedule_follow_up(interaction_id, follow_up_date)`
- Updates `follow_up_date` and flips `follow_up_required` to `"yes"` on a specific interaction. Deliberately atomic — one field-level effect per call, so the agent's action space stays predictable.

### 5. 💡 `suggest_talking_points`
- **Signature:** `suggest_talking_points(hcp_name)`
- Pulls the HCP's last 5 interaction summaries, feeds them back to the Groq LLM with a reasoning prompt, and returns 3 specific, history-grounded talking points — this is the tool that moves the agent from data entry into actual sales enablement.

---

## Data Model

```
HCP                              Interaction                       ChatSession
├─ id (PK)                       ├─ id (PK)                        ├─ id (PK)
├─ name                          ├─ hcp_id (FK → HCP)               ├─ session_id (indexed)
├─ specialty                     ├─ hcp_name                        ├─ role (user/assistant/tool)
├─ hospital                      ├─ interaction_type                ├─ content
├─ email                         ├─ channel (form / chat)            └─ created_at
├─ phone                         ├─ date / time
└─ created_at                    ├─ attendees
                                  ├─ raw_text / topics_discussed
                                  ├─ summary (LLM)
                                  ├─ sentiment (LLM)
                                  ├─ products_discussed (JSON)
                                  ├─ samples_distributed (JSON)
                                  ├─ materials_shared (JSON)
                                  ├─ outcomes
                                  ├─ follow_up_required / date / notes
                                  ├─ entities (JSON — full LLM extraction dump)
                                  ├─ created_at / updated_at
```

`HCP` is auto-populated from either logging path — there's no separate "add HCP" step required before a rep can log against them, though the directory also supports manual creation via `POST /api/hcps/`.

---

## Project Structure

```
HCP-CRM/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── graph.py          # LangGraph ReAct agent + system prompt + MemorySaver
│   │   │   ├── llm.py            # Groq client config (primary + fallback model)
│   │   │   └── tools.py          # 5 LangGraph tools + shared extraction helper
│   │   ├── models/
│   │   │   └── db_models.py      # HCP, Interaction, ChatSession ORM models
│   │   ├── routers/
│   │   │   ├── chat.py           # POST /api/chat  — conversational path
│   │   │   ├── interactions.py   # CRUD + analytics + export + AI follow-up draft
│   │   │   └── hcps.py           # HCP directory CRUD + AI priority scoring
│   │   ├── config.py             # Pydantic settings (env-driven)
│   │   ├── database.py           # SQLAlchemy engine/session (SQLite/Postgres-agnostic)
│   │   ├── main.py               # FastAPI app, router registration, CORS
│   │   └── schemas.py            # Pydantic request/response schemas
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── api/client.js                        # Axios instance
        ├── components/
        │   ├── Chat/
        │   │   ├── AiAssistant.jsx
        │   │   └── ChatWindow.jsx                # Sage chat UI, shows tool-call trace
        │   ├── LogInteraction/
        │   │   ├── InteractionForm.jsx
        │   │   └── InteractionList.jsx
        │   └── common/Sidebar.jsx
        ├── pages/
        │   ├── LogInteractionPage.jsx            # Form + chat, side by side
        │   ├── HcpDirectoryPage.jsx               # Directory + AI priority score
        │   ├── AnalyticsPage.jsx                  # Live dashboard (sentiment, trend, top products)
        │   ├── FollowUpsPage.jsx                  # Pending follow-ups + AI-drafted messages
        │   ├── ProductsPage.jsx                   # Sample distribution summary
        │   ├── ReportsPage.jsx                    # CSV export trigger
        │   └── SettingsPage.jsx
        ├── store/
        │   ├── store.js
        │   └── slices/{chatSlice.js, interactionsSlice.js}
        ├── styles/global.css
        ├── App.jsx
        └── main.jsx
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

cp .env.example .env
# set GROQ_API_KEY in .env (see Environment Variables below)

uvicorn app.main:app --reload --port 8000
```
Backend: `http://localhost:8000` · Interactive docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend: `http://localhost:5173`

---

## Usage

### Structured Form
Fill in HCP name (required), interaction type, date/time, attendees, products/samples/materials, outcomes, and follow-up — click **Log Interaction**. The LLM still runs against any free-text notes to generate a summary and sentiment.

### Chat with Sage
Try these live:
- `"Met Dr. Sharma today, discussed Cardiavex 10mg efficacy, gave 3 samples, positive meeting"`
- `"Show me interaction history for Dr. Patel"`
- `"Edit interaction #2, summary to 'Discussed new trial data for Lipitor'"`
- `"Schedule a follow-up for interaction #1 on August 1st"`
- `"What should I talk about with Dr. Kumar next visit?"`

### HCP Directory
Open any profile to see its live-computed **AI Visit Priority Score** (🔴 High / 🟡 Medium / 🟢 Low) — driven by recency, sentiment history, and pending follow-ups.

### Reports
Click **Export** on the Reports page to stream a live CSV of all interactions straight from the database.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/interactions/` | List all interactions |
| `POST` | `/api/interactions/` | Create interaction (form path, LLM-enriched) |
| `GET` | `/api/interactions/{id}` | Get a single interaction |
| `PUT` | `/api/interactions/{id}` | Update an interaction |
| `DELETE` | `/api/interactions/{id}` | Delete an interaction |
| `GET` | `/api/interactions/dashboard/analytics` | Live sentiment/trend/top-product stats |
| `GET` | `/api/interactions/dashboard/export` | Stream CSV export |
| `GET` | `/api/interactions/samples/summary` | Sample distribution by product & doctor |
| `POST` | `/api/interactions/{id}/draft-followup` | LLM-drafted follow-up email for that interaction |
| `POST` | `/api/chat/` | Send a message to the LangGraph agent |
| `GET` | `/api/hcps/` | List HCPs |
| `POST` | `/api/hcps/` | Create an HCP profile manually |
| `GET` | `/api/hcps/{id}` | Get one HCP |
| `GET` | `/api/hcps/{id}/interactions` | All interactions for that HCP |
| `GET` | `/api/hcps/{id}/priority` | AI-computed Visit Priority Score |
| `GET` | `/health` | Health check |

---

## Environment Variables

**`backend/.env`**
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=gemma2-9b-it
GROQ_MODEL_FALLBACK=llama-3.3-70b-versatile
DATABASE_URL=sqlite:///./hcp_crm.db
APP_ENV=development
CORS_ORIGINS=http://localhost:5173
```
For PostgreSQL: `DATABASE_URL=postgresql://user:password@localhost:5432/hcp_crm`

**`frontend/.env`**
```
VITE_API_BASE_URL=http://localhost:8000
```

> **Note:** `config.py` sets `gemma2-9b-it` as the default primary model to satisfy the assignment's mandatory-model requirement, with `llama-3.3-70b-versatile` as the fallback for heavier reasoning. Make sure your local `.env` matches this if you copied it from an older `.env.example` (the checked-in `.env.example` files still show the older ordering — worth a quick sync before recording your demo).

---

## Design Decisions & Trade-offs

- **Shared extraction helper, not duplicated logic.** `_extract_entities_and_summary()` lives once in `tools.py` and is imported by both `routers/interactions.py` and the `log_interaction` tool — avoids the classic "form path and chat path silently drift apart" bug.
- **Modular monolith, not microservices.** One FastAPI app, one DB. Given the 36-hour scope, splitting into services would have added deployment overhead without adding functionality — the router boundaries (`interactions`, `chat`, `hcps`) are already clean seams if this needed to scale out later.
- **SQLite for dev, Postgres-ready for prod.** `database.py` branches connection args only on the `sqlite:` prefix — swapping `DATABASE_URL` to a Postgres DSN requires no code changes.
- **Atomic tools over "do everything" tools.** `schedule_follow_up` only touches follow-up fields; it doesn't also try to edit summary or sentiment. Keeping tool scope narrow makes the ReAct agent's tool-selection more reliable and its side effects easier to reason about.
- **Analytics computed on read, not cached.** For this data volume, computing sentiment/trend/product aggregates on every `GET /dashboard/analytics` call is simpler and always-correct; a production version at scale would move this to a materialized view or scheduled aggregation job.

---

## What I Understood From the Task

This assignment asked for an **AI-first CRM module** — not a CRUD form with a chatbot bolted on the side, but a system where the AI model is genuinely load-bearing across the product:

1. **Dual input, single source of truth** — form and chat are two UX doors into the same service layer and the same tables.
2. **LangGraph as the reasoning backbone** — the ReAct loop (reason → act → observe) decides which of five tools to invoke per message, with session-scoped memory so multi-turn conversation actually works.
3. **The LLM does real work, not decoration** — entity extraction on every logged interaction (both paths), AI-computed HCP priority scoring, and LLM-drafted follow-up emails.
4. **Five domain-specific tools** mapped to an actual pharma field-rep workflow: log, edit, recall history, schedule follow-up, and generate talking points.
5. **Life-sciences framing throughout** — HCPs, samples, products, follow-ups, and territory-relevant terminology drive every schema field and prompt, not generic "customer" language.