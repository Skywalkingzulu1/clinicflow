# ClinicFlow — Autonomous Healthtech Slack Agent

ClinicFlow is a workspace agent built for Slack that automates patient triage, doctor scheduling, and appointment booking using **Supabase** and the **Model Context Protocol (MCP)**.

---

## 🧭 Overview (3W1H)

### ❓ What is it?
An autonomous front desk assistant operating entirely inside Slack. It collects patient symptoms, displays available doctors from a Supabase database, handles booking clicks, and emails confirmation notifications via Resend.

### 🎯 Why build it?
Medical practices spend dozens of hours managing calendars and answering basic calls, while patients experience delays booking simple consultations. ClinicFlow eliminates admin friction by bringing healthcare scheduling into the workspace.

### 👤 Who is it for?
Patients who want frictionless access to medical booking, and clinic staff who want to manage operations and schedules directly within their standard chat interface.

### ⚙️ How does it work?
1. **Interactive UI**: The Slack Bolt SDK listens to triage keywords and returns interactive cards using Block Kit.
2. **Database State**: Reads and updates `Profiles`, `Doctors`, and `appointments` tables in Supabase.
3. **Automated Notification**: Fires confirmation emails using the Resend API.

---

## 🛠️ Project Structure
* [index.js](file:///C:/Users/stumi/clinicflow/index.js): Application entry point.
* [slack/app.js](file:///C:/Users/stumi/clinicflow/slack/app.js): Bolt app configuration.
* [slack/listeners.js](file:///C:/Users/stumi/clinicflow/slack/listeners.js): Event controllers (triage, bookings).
* [slack/templates.js](file:///C:/Users/stumi/clinicflow/slack/templates.js): Block Kit JSON layouts.
* [services/supabaseService.js](file:///C:/Users/stumi/clinicflow/services/supabaseService.js): Supabase database queries.
* [services/resendService.js](file:///C:/Users/stumi/clinicflow/services/resendService.js): Resend email notification service.
* [supabase/migrations/20260709000000_init_schema.sql](file:///C:/Users/stumi/clinicflow/supabase/migrations/20260709000000_init_schema.sql): Database table definitions.

---

## ⚙️ Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Slack API credentials (`SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_APP_TOKEN`) and your Resend key (`RESEND_API_KEY`).

3. **Start the application**:
   ```bash
   npm start
   ```
