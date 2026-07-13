# ClinicFlow — Architecture Diagram

## System Architecture

```mermaid
graph TB
    subgraph "Slack Workspace"
        U[/"👨‍⚕️ Healthcare Worker"/]
        P[/"🏥 Patient"/]
    end

    subgraph "ClinicFlow Slack App"
        SB[/"🤖 Slack Bot<br/>(Bolt.js + Socket Mode)"/]
        MC[/"🔌 MCP Server<br/>(Model Context Protocol)"/]
    end

    subgraph "Backend Services"
        TS[/"🩺 Triage Agent<br/>(Rule-based)"/]
        PA[/"💊 Prescription Auditor<br/>(Drug DB + Rules)"/]
        BK[/"📅 Booking Engine<br/>(Supabase RPC)"/]
        EM[/"📧 Email Notifications<br/>(Resend via Edge Function)"/]
    end

    subgraph "Data Layer"
        DB[("🗄️ Supabase PostgreSQL<br/>doctors, patients,<br/>appointments, profiles")]
    end

    subgraph "AI Integration"
        AI[/"🧠 MCP Client<br/>(Claude / Cursor / Any AI)"/]
    end

    U -->|"DM: book appointment"| SB
    P -->|"@mention: audit Rx"| SB
    SB --> TS
    SB --> PA
    SB --> BK
    SB --> EM
    TS --> DB
    PA --> DB
    BK --> DB
    BK --> EM
    MC --> DB
    AI <-->|"stdio / HTTP"| MC
    EM -->|"Edge Function"| RES[/"📬 Resend API"/]
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User (Slack)
    participant B as Slack Bot
    participant T as Triage Agent
    participant DB as Supabase DB
    participant M as MCP Server
    participant AI as AI Agent

    Note over U,AI: Flow 1: Triage & Booking
    U->>B: "book appointment"
    B->>T: Process triage request
    T->>DB: Query available doctors
    DB-->>T: Doctor list
    T-->>B: Interactive doctor cards
    U->>B: Click "Book" button
    B->>DB: Create appointment
    DB-->>B: Confirmation
    B-->>U: Booking confirmed (Block Kit)

    Note over U,AI: Flow 2: Prescription Audit
    U->>B: "audit prescription Metformin 500mg"
    B->>DB: Check drug interactions
    DB-->>B: Drug data
    B-->>U: Safety report (Block Kit)

    Note over U,AI: Flow 3: MCP Integration
    AI->>M: search_doctors(specialty="GP")
    M->>DB: SELECT * FROM doctors
    DB-->>M: Results
    M-->>AI: Doctor list (JSON)
    AI->>M: book_appointment(...)
    M->>DB: INSERT appointment
    DB-->>M: Confirmation
    M-->>AI: Booking confirmed
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Slack Block Kit | Rich interactive UI in Slack |
| Bot Runtime | Bolt.js + Socket Mode | Real-time message handling |
| MCP Server | @modelcontextprotocol/sdk | AI agent integration |
| Database | Supabase (PostgreSQL) | Data persistence |
| Email | Resend (via Edge Function) | Notification delivery |
| Hosting | Local (dev) / Render (prod) | Runtime environment |

## MCP Server Tools

| Tool | Description |
|------|------------|
| `search_doctors` | Search available doctors by specialty or name |
| `book_appointment` | Create appointment booking in database |
| `audit_prescription` | Drug interaction and dosage safety check |
| `list_appointments` | List upcoming appointments |
