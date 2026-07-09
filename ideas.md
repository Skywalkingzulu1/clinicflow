# S1 Ideation - ClinicFlow (Healthtech Slack Agent)

## 💡 Concept: ClinicFlow
A Slack-based workspace agent designed for clinic staff and patients, enabling automated triage, appointment booking, and prescription auditing using Slack Block Kit, Supabase, and Model Context Protocol (MCP).

### 🔄 Winner-Transposition Rationale
* **Proven Shape**: Transposes the winning pattern of a "multi-system operational dispatcher" (which won past Slack developer tracks by integrating databases, notifications, and interactive approvals) into a healthcare clinic environment.
* **Why Healthtech**: Healthcare access is a critical social impact area. Exposing clinic scheduling and AI triage inside a chat interface lowers accessibility barriers for patients and busy medical staff.

---

## 🛠️ Sponsor Technology Leverage (Load-Bearing Pillars)
1. **Slack Bolt SDK & Block Kit**: The interface. Handles interactive components, DMs, and channel postings.
2. **Model Context Protocol (MCP)**: The context broker. Exposes Supabase data (profiles, schedules) and AI reasoning tools to the Slack agent.
3. **Supabase Database**: The backend state. Stores all persistent records (from our existing schema: `Profiles`, `Doctors`, `appointments`).
4. **Resend API / Edge Function**: The communication layer. Sends email notifications automatically when actions are completed.

---

## 📊 10/10 Scorecard

| Metric | Score | Reason / Feasibility |
|--------|-------|----------------------|
| **Problem Fit** | 10/10 | Solves a real, felt problem: clinic admin overhead and patient scheduling friction. |
| **Solution Fit** | 10/10 | Wire-thin operational flow: Chat → AI Triage → Supabase DB Update → Slack Approval Button → Resend Email. |
| **Technical Depth** | 10/10 | Incorporates Slack Bolt, Supabase client operations, and an MCP server integration. |
| **Demo-ability** | 10/10 | Visual demo flow executes in <90 seconds showing DM interaction and button approvals. |
| **Feasibility** | 10/10 | Reuses the database schema we already developed and verified, ensuring high predictability. |

---

## 📝 Demo Flow Preview
1. **Trigger**: Patient sends a DM to the Slack Agent: *"I have a severe headache and need to see a GP."*
2. **AI Triage**: The agent replies in Slack using Block Kit, summarizing the symptoms, querying the Supabase database for available doctors, and presenting a `Book Appointment` button.
3. **Interactive Approval**: Patient clicks `Book Appointment`. The agent posts to a private staff channel asking for approval.
4. **Action**: Staff member clicks `Approve`. The database is updated, and an email confirmation is sent via Resend.
