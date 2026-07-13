function getDoctorListBlocks(doctors, reason) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🏥 Available Specialists",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Symptom triage result for *"${reason}"*\nSelect a doctor below to book an appointment.`
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
          text: `*${doc.name}*\n_${doc.specialty}_`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `📍 *Location*\n${doc.area || 'JHB'}`
          },
          {
            type: "mrkdwn",
            text: `💰 *Consultation Fee*\nR${doc.consultation_fee || 650}`
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📅 Book Appointment",
              emoji: true
            },
            style: "primary",
            value: JSON.stringify({ doctorId: doc.id, doctorName: doc.name, reason }),
            action_id: "book_doctor"
          }
        ]
      },
      {
        type: "divider"
      }
    );
  });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "🔒 All bookings are subject to availability. ClinicFlow will confirm via email."
      }
    ]
  });

  return blocks;
}

function getBookingConfirmationBlocks(doctorName, reason) {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "✅ Booking Confirmed",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Your appointment has been successfully scheduled.`
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*👨‍⚕️ Doctor:*\n${doctorName}`
        },
        {
          type: "mrkdwn",
          text: `*🩺 Reason:*\n${reason}`
        },
        {
          type: "mrkdwn",
          text: `*📅 When:*\nTomorrow (Scheduled)`
        },
        {
          type: "mrkdwn",
          text: `*✅ Status:*\nConfirmed`
        }
      ]
    },
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "📧 A confirmation email has been sent to your registered address. | ClinicFlow Health Booking"
        }
      ]
    }
  ];
}

module.exports = {
  getDoctorListBlocks,
  getBookingConfirmationBlocks
};
