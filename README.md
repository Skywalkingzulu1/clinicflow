# ClinicFlow — Autonomous Healthtech Slack Agent

An autonomous workspace agent built for the [Slack Agent Builder Challenge](https://slack-agent-challenge.devpost.com) that triages patient symptoms, audits prescriptions, and manages bookings directly in chat.

---

## What

ClinicFlow is a Slack bot that acts as a virtual front desk for medical practices. Patients DM the bot with symptoms, and it instantly returns available doctors from a Supabase database, lets them book appointments, audits prescriptions for safety, and sends email confirmations — all without leaving Slack.

## Why

Medical practices spend 20+ hours/week on scheduling calls. Patients wait on hold just to find out when a doctor is free. ClinicFlow eliminates this friction by bringing healthcare scheduling into the workspace where people already work.

## Who

- **Patients** who want frictionless access to medical booking
- **Clinic staff** who want to manage operations within their chat interface
- **Healthcare startups** looking for AI-powered patient engagement

## How

1. **Slack Bolt SDK** — Listens to triage keywords via Socket Mode, returns interactive Block Kit cards
2. **Supabase** — Reads doctor availability, writes booking logs, manages patient profiles, sends email notifications via Edge Functions
3. **Rule-based AI** — Powers the Prescription Auditor with medication safety checks and drug interaction detection

---

## Project Structure

```
clinicflow/
├── config/
│   └── supabase.js              # Supabase client setup
├── services/
│   ├── resendService.js         # Email notification API
│   ├── supabaseService.js       # DB queries (Profiles, Doctors, appointments)
│   └── prescriptionService.js   # Prescription audit with OpenAI
├── slack/
│   ├── app.js                   # Bolt app initialization
│   ├── listeners.js             # Event & message handlers
│   └── templates.js             # Block Kit JSON layouts
├── supabase/
│   └── migrations/
│       └── 20260709000000_init_schema.sql
├── .env.example                 # Environment variables template
├── index.js                     # App entry point
├── index.html                   # GitHub Pages landing page
└── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Slack workspace with a configured app
- Supabase project with the schema applied

### Slack App Setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable **Socket Mode** → generate App Token with `connections:write` scope
3. Add these **Bot Token Scopes** under OAuth & Permissions:
   - `chat:write` — Send messages
   - `im:history` — Read DM messages
   - `im:write` — Open direct messages
   - `users:read` — Get user information
   - `assistant:write` — Slack AI features
4. Install app to your workspace → copy the Bot Token
5. Event Subscriptions: Enable and subscribe to `message.im` events

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Skywalkingzulu1/clinicflow.git
   cd clinicflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys in `.env`:
   - `SLACK_BOT_TOKEN` — Your Slack bot token
   - `SLACK_SIGNING_SECRET` — Your Slack app signing secret
   - `SLACK_APP_TOKEN` — Your Slack app-level token (Socket Mode)
   - `SUPABASE_URL` — Your Supabase project URL
   - `SUPABASE_ANON_KEY` — Your Supabase anonymous key
   - `RESEND_API_KEY` — Your Resend API key

4. Start the application:
   ```bash
   npm start
   ```

---

## How It Works

### Triage Flow
1. **Patient sends a message** — DM or mention with keywords like "book", "appointment", "doctor", or "triage"
2. **Bot triages the request** — Queries available doctors from Supabase based on specialty and availability
3. **Interactive card appears** — Block Kit layout shows doctor list with "Book" buttons
4. **Patient books** — Clicks a button, appointment is created in the database
5. **Confirmation sent** — Email notification via Resend, Slack confirmation card

### Prescription Audit Flow
1. **User requests audit** — Sends message like "audit prescription Metformin 500mg"
2. **Bot analyzes** — OpenAI reviews medication, dosage, and potential interactions
3. **Audit report appears** — Safety score, dosage check, interactions, and recommendation displayed
4. **Action taken** — APPROVE, APPROVE_WITH_MONITORING, REJECT, or CONSULT_PHYSICIAN

---

## Sponsor Tech Integration

### Supabase (Load-Bearing)
- **How used:** Reads `Doctors` table for availability, writes to `appointments` and `Profiles` tables, sends email notifications via Edge Functions with Resend
- **Why essential:** Without Supabase, the bot has no data to query and no way to send emails. It IS the backend.

### Slack Bolt SDK (Load-Bearing)
- **How used:** Real-time event handling via Socket Mode, Block Kit for interactive UI
- **Why essential:** The entire user experience happens inside Slack.

---

## API Keys Required

| Key | Where to Get It | Purpose |
|-----|-----------------|---------|
| `SLACK_BOT_TOKEN` | [api.slack.com/apps](https://api.slack.com/apps) | Bot authentication |
| `SLACK_SIGNING_SECRET` | [api.slack.com/apps](https://api.slack.com/apps) | Request verification |
| `SLACK_APP_TOKEN` | [api.slack.com/apps](https://api.slack.com/apps) → Socket Mode | Real-time events |
| `SUPABASE_URL` | [supabase.com/dashboard](https://supabase.com/dashboard) | Database access |
| `SUPABASE_ANON_KEY` | [supabase.com/dashboard](https://supabase.com/dashboard) → Settings → API | Database access |
| `SUPABASE_SERVICE_KEY` | [supabase.com/dashboard](https://supabase.com/dashboard) → Settings → API | Edge Functions |

---

## License

MIT
