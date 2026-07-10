/**
 * Generate Block Kit layout for doctor listing
 */
function getDoctorListBlocks(doctors, reason) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🏥 *ClinicFlow Triage: Available Doctors*\nBased on your request (*"${reason}"*), here are the available specialists:`
      }
    },
    {
      type: "divider"
    }
  ];

  doctors.forEach(doc => {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${doc.name}* - ${doc.specialty}\n📍 Location: ${doc.area || 'JHB'} | 🪙 Fee: R${doc.consultation_fee || 650}`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Book",
            emoji: true
          },
          value: JSON.stringify({ doctorId: doc.id, doctorName: doc.name, reason }),
          action_id: "book_doctor"
        }
      },
      {
        type: "divider"
      }
    );
  });

  return blocks;
}

/**
 * Generate Block Kit layout for booking confirmation
 */
function getBookingConfirmationBlocks(doctorName, reason) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `✅ *Appointment Booked Successfully!*`
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Doctor:*\n${doctorName}`
        },
        {
          type: "mrkdwn",
          text: `*Reason:*\n${reason}`
        },
        {
          type: "mrkdwn",
          text: `*Time:*\nTomorrow (Scheduled)`
        },
        {
          type: "mrkdwn",
          text: `*Status:*\nConfirmed`
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "An email confirmation has been sent. Thank you!"
      }
    }
  ];
}

module.exports = {
  getDoctorListBlocks,
  getBookingConfirmationBlocks
};
