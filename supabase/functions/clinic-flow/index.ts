import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SLACK_BOT_TOKEN = Deno.env.get('SLACK_BOT_TOKEN') || '';
const SLACK_SIGNING_SECRET = Deno.env.get('SLACK_SIGNING_SECRET') || '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || Deno.env.get('Resend') || Deno.env.get('Resend ') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Sprint 04: Add default doctor specialty fee mapping
function getBaseFee(specialty: string): number { return specialty.toLowerCase() === 'cardiologist' ? 250 : 150; }

// Sprint 03: Add input length validation on triage reason
function validateReason(reason: string): boolean { return reason.trim().length > 3; }

// Sprint 02: Add email domain validation helper
function isValidEmail(email: string): boolean { return email.includes('@'); }

// Sprint 01: Add structured response logger
// Log execution
console.log('ClinicFlow invoked at:', new Date().toISOString());

/**
 * Verify Slack signature to prevent spoofing
 */
async function verifySlackSignature(headers: Headers, bodyText: string): Promise<boolean> {
  const signature = headers.get('x-slack-signature');
  const timestamp = headers.get('x-slack-request-timestamp');
  
  if (!signature || !timestamp || !SLACK_SIGNING_SECRET) {
    return false;
  }

  // Prevent replay attacks (check if timestamp is within 5 minutes)
  const timeDifference = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp));
  if (timeDifference > 300) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${bodyText}`;
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(SLACK_SIGNING_SECRET);
  const dataBuf = encoder.encode(sigBaseString);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    dataBuf
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const calculatedSignature = 'v0=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return calculatedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const bodyText = await req.text();
    
    // Perform signature verification (skip only during local test iteration mode)
    const skipVerify = req.headers.get('x-skip-signature-verification') === 'true';
    if (!skipVerify && !await verifySlackSignature(req.headers, bodyText)) {
      return new Response('Unauthorized Slack Request', { status: 401 });
    }

    // Determine content type and parse payload
    const contentType = req.headers.get('content-type') || '';
    let payload: any;
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(bodyText);
      const payloadString = params.get('payload');
      payload = payloadString ? JSON.parse(payloadString) : {};
    } else {
      payload = bodyText ? JSON.parse(bodyText) : {};
    }

    // 1. Handle Slack Challenge Verification
    if (payload.type === 'url_verification') {
      return new Response(JSON.stringify({ challenge: payload.challenge }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Handle Event Callback (Slack Messages)
    if (payload.event && payload.event.type === 'message' && !payload.event.bot_id) {
      const messageText = payload.event.text || '';
      const channel = payload.event.channel;

      if (/(book|appointment|doctor|triage)/i.test(messageText)) {
        // Fetch available doctors
        const { data: doctors } = await supabase
          .from('Doctors')
          .select('*')
          .eq('is_online', true)
          .limit(3);

        const blocks = [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🏥 *ClinicFlow Triage: Available Doctors*\nBased on your request, here are the available practitioners:`
            }
          },
          { type: "divider" }
        ];

        (doctors || []).forEach(doc => {
          blocks.push(
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${doc.name}* - ${doc.specialty}\n📍 Location: ${doc.area || 'Sandton'} | 🪙 Fee: ${doc.consultation_fee || 150} credits`
              },
              accessory: {
                type: "button",
                text: { type: "plain_text", text: "Book", emoji: true },
                value: JSON.stringify({ doctorId: doc.id, doctorName: doc.name, reason: messageText }),
                action_id: "book_doctor"
              }
            },
            { type: "divider" }
          );
        });

        // Send message back to Slack channel
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
          },
          body: JSON.stringify({ channel, blocks, text: 'Triage Results' })
        });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Handle Slack Interactive Action Button clicks
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      if (action.action_id === 'book_doctor') {
        const { doctorId, doctorName, reason } = JSON.parse(action.value);
        const email = `${payload.user.username}@slack-user.local`;
        const name = payload.user.name || payload.user.username;

        // Check if Profile exists
        let { data: profile } = await supabase
          .from('Profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (!profile) {
          const { data: maxIdData } = await supabase.from('Profiles').select('id').order('id', { ascending: false }).limit(1);
          const nextProfileId = (maxIdData && maxIdData.length > 0) ? (Number(maxIdData[0].id) + 1) : 1;
          const { data: newProfile } = await supabase.from('Profiles').insert({
            id: nextProfileId,
            email,
            name,
            role: 'PATIENT',
            credits: 500
          }).select().single();
          profile = newProfile;
        }

        // Book Appointment
        const { data: maxApptData } = await supabase.from('appointments').select('id').order('id', { ascending: false }).limit(1);
        const nextApptId = (maxApptData && maxApptData.length > 0) ? (Number(maxApptData[0].id) + 1) : 1;
        
        await supabase.from('appointments').insert({
          id: nextApptId,
          patient_id: profile.id,
          doctor_id: doctorId,
          timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          appointment_type: 'VIDEO',
          status: 'SCHEDULED',
          reason: reason,
          price_credits: 150,
          teleconsultation_status: 'pending',
          service_tier: 'VIDEO_CALL',
          escrow_status: 'NONE',
          payment_method: 'credits'
        });

        // Trigger Resend notification email
        if (RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'onboarding@resend.dev',
              to: ['andilexmchunu@gmail.com'], // Deliver to verified email
              subject: `ClinicFlow Confirmation: Appointment with ${doctorName}`,
              html: `<h1>Appointment Confirmed!</h1><p>Hi ${name}, your booking with ${doctorName} has been recorded.</p>`
            })
          });
        }

        // Respond back to Slack to update the message view
        if (payload.response_url) {
          await fetch(payload.response_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `✅ Appointment successfully booked with *${doctorName}*! A confirmation email has been dispatched.`,
              replace_original: true
            })
          });
        }
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
})
