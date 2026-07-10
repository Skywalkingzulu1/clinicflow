const { getAvailableDoctors, getProfileByEmail, createProfile, bookAppointment } = require('../services/supabaseService');
const { sendBookingNotification } = require('../services/resendService');
const { auditPrescription, getAuditBlocks } = require('../services/prescriptionService');
const { getDoctorListBlocks, getBookingConfirmationBlocks } = require('./templates');

function registerListeners(app) {
  // Listen for direct messages or channel messages containing "book" or "appointment"
  app.message(/(book|appointment|doctor|triage)/i, async ({ message, say, client }) => {
    try {
      const reason = message.text || "Consultation";
      console.log(`Processing triage request for message: "${reason}"`);

      // Query available doctors from Supabase
      const doctors = await getAvailableDoctors();
      if (doctors.length === 0) {
        await say("🏥 I'm sorry, there are currently no doctors available in the directory.");
        return;
      }

      // Generate doctor list blocks
      const blocks = getDoctorListBlocks(doctors, reason);

      await say({
        blocks,
        text: "ClinicFlow Triage: Available Doctors"
      });
    } catch (error) {
      console.error('Error handling triage request:', error);
      await say("⚠️ Sorry, an error occurred while processing your request. Please try again later.");
    }
  });

  // Handle the "book_doctor" button click interaction
  app.action('book_doctor', async ({ ack, body, client, respond }) => {
    await ack(); // Acknowledge Slack action immediately

    try {
      const actionValue = JSON.parse(body.actions[0].value);
      const { doctorId, doctorName, reason } = actionValue;
      
      // Get user information from Slack
      const slackUser = await client.users.info({ user: body.user.id });
      const email = slackUser.user.profile.email || `${body.user.name}@slack-user.local`;
      const name = slackUser.user.profile.real_name || body.user.name;

      console.log(`Booking request from ${name} (${email}) for doctor ${doctorName}`);

      // Step 1: Ensure user profile exists in database
      let profile = await getProfileByEmail(email);
      if (!profile) {
        profile = await createProfile(email, name, 'PATIENT');
      }

      // Step 2: Book appointment in database
      await bookAppointment({
        patientId: profile.id,
        doctorId: doctorId,
        reason: reason,
        priceCredits: 150
      });

      // Step 3: Trigger async Resend email notification
      try {
        await sendBookingNotification(email, name, doctorName, reason);
      } catch (err) {
        console.error('Non-blocking: Failed to send email confirmation:', err);
      }

      // Step 4: Update Slack view with confirmation
      const blocks = getBookingConfirmationBlocks(doctorName, reason);
      await respond({
        blocks,
        text: "Appointment Booked Successfully!"
      });

    } catch (error) {
      console.error('Error handling booking action:', error);
      await respond({
        text: "⚠️ Failed to book appointment. Please try again."
      });
    }
  });

  // Listen for prescription audit requests
  app.message(/(prescription|audit|medication|drug)/i, async ({ message, say }) => {
    try {
      const text = message.text || "";
      
      // Try to extract medication and dosage from message
      // Example: "audit prescription Metformin 500mg"
      const match = text.match(/(?:prescription|audit|medication|drug)\s+(.+)/i);
      if (!match) {
        await say("💊 To audit a prescription, please specify the medication and dosage.\nExample: `audit prescription Metformin 500mg`");
        return;
      }

      const parts = match[1].trim().split(/\s+/);
      const medication = parts[0];
      const dosage = parts[1] || "500mg";

      console.log(`Prescription audit request: ${medication} ${dosage}`);

      // Run the audit
      const audit = await auditPrescription({
        medication,
        dosage,
        patientAge: null,
        patientWeight: null,
        currentMedications: []
      });

      // Generate and send audit report
      const blocks = getAuditBlocks(audit, medication, dosage);
      await say({
        blocks,
        text: `Prescription Audit: ${medication} ${dosage}`
      });

    } catch (error) {
      console.error('Error handling prescription audit:', error);
      await say("⚠️ Sorry, an error occurred while auditing the prescription. Please try again later.");
    }
  });
}

module.exports = {
  registerListeners
};
