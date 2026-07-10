const supabase = require('../config/supabase');

/**
 * Send email notification via Supabase Edge Function
 * The Resend API key is stored in Supabase secrets
 */
async function sendBookingNotification(toEmail, patientName, doctorName, reason) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: toEmail,
        subject: `ClinicFlow Confirmation: Appointment with ${doctorName}`,
        html: `
          <h1>Appointment Confirmed!</h1>
          <p>Hi ${patientName},</p>
          <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
          <p><strong>Reason</strong>: ${reason}</p>
          <p>Thank you for choosing ClinicFlow.</p>
        `
      }
    });

    if (error) {
      console.error('Error calling send-email function:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email via Supabase function:', error);
    throw error;
  }
}

module.exports = {
  sendBookingNotification
};
