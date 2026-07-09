# S2 Demo Script - ClinicFlow

This 5-element demo script is designed for a 60–90 second pitch/demo video.

---

## 🎭 1. The Hook / Problem (15 seconds)
* **Visual**: Show a busy medical clinic waiting room or a patient holding a phone looking stressed.
* **Narration**: *"Clinics spend over 20 hours a week answering basic scheduling questions, while patients wait on hold just to find out when a doctor is free. We wanted to solve this by bringing the clinic directory directly to where people work."*

## 📱 2. The Before-State / Context (15 seconds)
* **Visual**: Opening a Slack workspace, showing standard conversation channels.
* **Narration**: *"Instead of navigating complicated patient portals, ClinicFlow brings the medical desk inside Slack."*

## ⚡ 3. The Trigger (15 seconds)
* **Visual**: Patient DMs the ClinicFlow bot: *"I have mild flu symptoms and need to see a doctor."*
* **Narration**: *"With a simple DM, the AI Clinic Agent initiates a symptom triage using Slack Block Kit."*

## 💡 4. The "Aha!" Moment (25 seconds)
* **Visual**: The bot returns a beautiful interactive layout listing available doctors (fetched from Supabase) and a `Book GP` button. The patient clicks `Book`. The bot immediately registers the appointment in the database and fires a confirmation email.
* **Narration**: *"Aha! The agent queries our live database, presents available GPs in Sandton, and lets the patient book instantly. The state is committed to Supabase, and a notification email is automatically sent via Resend."*

## 🏁 5. The Close / Call to Action (10 seconds)
* **Visual**: Showing a summary screen or dashboard with the confirmed booking.
* **Narration**: *"ClinicFlow eliminates booking friction and admin overhead, making healthcare access as easy as sending a message. Thank you."*
