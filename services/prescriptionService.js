require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Audit a prescription for safety, dosage, and drug interactions
 * Uses OpenAI for LLM reasoning
 */
async function auditPrescription({ medication, dosage, patientAge, patientWeight, currentMedications = [] }) {
  if (!OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not defined. Using basic audit.');
    return basicAudit(medication, dosage);
  }

  const prompt = `You are a clinical pharmacist AI assistant. Audit this prescription for safety:

Medication: ${medication}
Dosage: ${dosage}
Patient Age: ${patientAge || 'Not specified'}
Patient Weight: ${patientWeight || 'Not specified'}
Current Medications: ${currentMedications.length > 0 ? currentMedications.join(', ') : 'None reported'}

Provide a structured audit with:
1. SAFETY_SCORE: 1-10 (10 = safest)
2. DOSAGE_CHECK: Is the dosage appropriate? (APPROPRIATE / TOO_HIGH / TOO_LOW / NEEDS_REVIEW)
3. INTERACTIONS: Any drug interactions with current medications? (NONE / MINOR / MODERATE / SEVERE)
4. WARNINGS: Any specific warnings or concerns
5. RECOMMENDATION: APPROVE / APPROVE_WITH_MONITORING / REJECT / CONSULT_PHYSICIAN

Format as JSON with these exact keys: safety_score, dosage_check, interactions, warnings, recommendation`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content;
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return basicAudit(medication, dosage);
  } catch (error) {
    console.error('Error calling OpenAI for prescription audit:', error);
    return basicAudit(medication, dosage);
  }
}

/**
 * Basic audit when LLM is unavailable
 */
function basicAudit(medication, dosage) {
  const highRiskMedications = ['warfarin', 'insulin', 'morphine', 'fentanyl', 'methotrexate', 'lithium'];
  const isHighRisk = highRiskMedications.some(m => medication.toLowerCase().includes(m));
  
  const dosageNum = parseInt(dosage);
  const isHighDosage = dosageNum > 500;

  return {
    safety_score: isHighRisk ? 4 : (isHighDosage ? 6 : 8),
    dosage_check: isHighDosage ? 'TOO_HIGH' : 'APPROPRIATE',
    interactions: 'NEEDS_REVIEW',
    warnings: isHighRisk 
      ? `${medication} is a high-risk medication requiring careful monitoring`
      : 'Basic audit only - LLM not available for full analysis',
    recommendation: isHighRisk ? 'CONSULT_PHYSICIAN' : 'APPROVE_WITH_MONITORING'
  };
}

/**
 * Generate audit report as Slack Block Kit
 */
function getAuditBlocks(audit, medication, dosage) {
  const scoreColor = audit.safety_score >= 7 ? '#22c55e' : (audit.safety_score >= 4 ? '#f59e0b' : '#ef4444');
  const recommendationEmoji = {
    'APPROVE': '✅',
    'APPROVE_WITH_MONITORING': '⚠️',
    'REJECT': '❌',
    'CONSULT_PHYSICIAN': '👨‍⚕️'
  }[audit.recommendation] || 'ℹ️';

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `💊 *Prescription Audit Report*`
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Medication:*\n${medication}`
        },
        {
          type: "mrkdwn",
          text: `*Dosage:*\n${dosage}`
        }
      ]
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Safety Score:*\n${audit.safety_score}/10`
        },
        {
          type: "mrkdwn",
          text: `*Dosage Check:*\n${audit.dosage_check}`
        }
      ]
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Interactions:*\n${audit.interactions}`
        },
        {
          type: "mrkdwn",
          text: `*Recommendation:*\n${recommendationEmoji} ${audit.recommendation}`
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Warnings:*\n${audit.warnings}`
      }
    },
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "This is an AI-assisted audit. Always verify with a qualified healthcare professional."
        }
      ]
    }
  ];
}

module.exports = {
  auditPrescription,
  getAuditBlocks
};
