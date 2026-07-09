require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'onboarding@resend.dev';

/**
 * Send an email notification using Resend API
 */
async function sendBookingNotification(toEmail, patientName, doctorName, reason) {
  if (!RESEND_API_KEY) {
    console.warn('Warning: RESEND_API_KEY is not defined. Skipping email notification.');
    return { skipped: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: `ClinicFlow Confirmation: Appointment with ${doctorName}`,
        html: `
          <h1>Appointment Confirmed!</h1>
          <p>Hi ${patientName},</p>
          <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
          <p><strong>Reason</strong>: ${reason}</p>
          <p>Thank you for choosing ClinicFlow.</p>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Resend');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending Resend email:', error);
    throw error;
  }
}

module.exports = {
  sendBookingNotification
};
