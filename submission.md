# Devpost Submission Draft: ClinicFlow

## The Hook
ClinicFlow brings the medical front desk inside Slack, enabling patients to book GP appointments and trigger automated AI triage audits directly in their workspace.

## Live Demo & Video
* **Live Demo**: `https://skywalkingzulu1.github.io/clinicflow/`
* **GitHub Repository**: `https://github.com/Skywalkingzulu1/clinicflow`

## What it does
ClinicFlow is a workspace agent that manages clinic operations:
* **Real-time Triage**: Listens to messages and returns interactive forms to collect patient symptoms.
* **Database Scheduling**: Connects directly to Supabase to match patients with verified, online doctors.
* **Block Kit Interaction**: books appointments with a single click and posts confirmations back to Slack.
* **Email dispatch**: Automatically triggers a Resend notification to the patient.

## How we built it
* **Backend**: Node.js, Slack Bolt SDK, and `@supabase/supabase-js`.
* **Database**: Supabase Postgres (with custom schemas for `Profiles`, `Doctors`, and `appointments`).
* **Communications**: Resend API.

## Sponsor Integrations
* **Slack Bolt SDK & Block Kit**: Powering the entire patient/doctor interface and event loops.
* **Model Context Protocol (MCP)**: Used to query database states and fetch clinic availabilities.
* **Supabase**: Serves as our primary datastore.

## Challenges we overcame
* **Database Concurrency**: Custom ID tracking in the insertion code to avoid standard sequence desynchronization when executing public inserts.
* **Subpath Routing**: Resolved directory URL references to support GitHub Pages subdirectory hosting.
