# S2 Specifications - ClinicFlow

## 🎯 Core Thin-Slice Feature
A fully functional Slack bot that:
1. Listens to direct messages or mentions for medical appointment requests.
2. Formats a symptom triage card using Slack **Block Kit** markup.
3. Automatically queries available doctors in the Supabase database.
4. Lets the user select a slot, books it in the `appointments` table, and sends an email confirmation.

---

## 📂 Project Directory Structure
```
clinicflow/
├── config/                  # Configuration & Environment
│   └── supabase.js          # Supabase client setup
├── services/                # Integration services
│   ├── resendService.js     # Email notification API client
│   └── supabaseService.js   # DB queries (Profiles, Doctors, appointments)
├── slack/                   # Slack Bolt app controllers
│   ├── app.js               # Main Bolt app initialization
│   ├── listeners.js         # Event & message handlers
│   └── templates.js         # Block Kit JSON layouts
├── supabase/                # Database migrations (Copied from DOW project)
│   └── migrations/
│       └── 20260709000000_init_schema.sql
├── package.json             # Node dependencies
└── index.js                 # App entry point
```

---

## 👥 Subagent Role Split
* **Frontend Agent (Slack Block Kit Designer)**: Designs interactive templates in `slack/templates.js` for triage inputs, doctor selections, and success confirmations.
* **Backend Agent (Data & Integrations)**: Sets up the Supabase DB client, writes queries to read availability and insert bookings in `services/supabaseService.js`, and wires email notifications.
* **Orchestrator Agent**: Wires the Slack events to backend services in `slack/listeners.js` and manages the app lifecycle in `index.js`.
* **QA Agent (Ollama)**: Writes integration test scripts to verify DB insertions and ensures all local links resolve.

---

## ✅ Definition of Done (DoD)
* [ ] The Slack bot starts up without errors and connects to the Slack workspace.
* [ ] A direct message triggers the triage response with interactive buttons.
* [ ] The bot successfully reads data from the remote Supabase `Doctors` table.
* [ ] Clicking a booking button inserts a record into the `appointments` table.
* [ ] An email notification is successfully sent to the verified address.
* [ ] The code is clean, documented, and pushed to the Git repository.
