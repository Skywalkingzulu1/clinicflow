/**
 * Prescription Audit Service
 * Uses rule-based logic for medication safety checks
 * Can be extended to use Slack AI or other LLM backends
 */

/**
 * Audit a prescription for safety, dosage, and drug interactions
 */
async function auditPrescription({ medication, dosage, patientAge, patientWeight, currentMedications = [] }) {
  // Rule-based audit system
  const result = {
    safety_score: 8,
    dosage_check: 'APPROPRIATE',
    interactions: 'NONE',
    warnings: [],
    recommendation: 'APPROVE',
    details: {}
  };

  // High-risk medications database
  const highRiskMedications = {
    'warfarin': { risk: 'high', class: 'anticoagulant', interactions: ['aspirin', 'ibuprofen', 'naproxen'] },
    'insulin': { risk: 'high', class: 'antidiabetic', interactions: ['alcohol', 'beta-blockers'] },
    'morphine': { risk: 'high', class: 'opioid', interactions: ['benzodiazepines', 'alcohol'] },
    'fentanyl': { risk: 'high', class: 'opioid', interactions: ['benzodiazepines', 'alcohol'] },
    'methotrexate': { risk: 'high', class: 'immunosuppressant', interactions: ['nsaids', 'penicillins'] },
    'lithium': { risk: 'high', class: 'mood stabilizer', interactions: ['nsaids', 'diuretics'] },
    'digoxin': { risk: 'high', class: 'cardiac glycoside', interactions: ['amiodarone', 'verapamil'] },
    'phenytoin': { risk: 'high', class: 'anticonvulsant', interactions: ['warfarin', 'amiodarone'] }
  };

  // Common medications with standard dosages
  const commonDosages = {
    'metformin': { min: 500, max: 2550, unit: 'mg', frequency: '1-3x daily' },
    'lisinopril': { min: 5, max: 40, unit: 'mg', frequency: '1x daily' },
    'amlodipine': { min: 2.5, max: 10, unit: 'mg', frequency: '1x daily' },
    'omeprazole': { min: 10, max: 40, unit: 'mg', frequency: '1x daily' },
    'atorvastatin': { min: 10, max: 80, unit: 'mg', frequency: '1x daily' },
    'levothyroxine': { min: 25, max: 200, unit: 'mcg', frequency: '1x daily' },
    'amlodipine': { min: 2.5, max: 10, unit: 'mg', frequency: '1x daily' },
    'gabapentin': { min: 100, max: 800, unit: 'mg', frequency: '3x daily' },
    'sertraline': { min: 25, max: 200, unit: 'mg', frequency: '1x daily' },
    'escitalopram': { min: 5, max: 20, unit: 'mg', frequency: '1x daily' }
  };

  const medLower = medication.toLowerCase();
  
  // Check if medication is high-risk
  for (const [key, info] of Object.entries(highRiskMedications)) {
    if (medLower.includes(key)) {
      result.safety_score = 4;
      result.warnings.push(`${medication} is a HIGH-RISK ${info.class} medication`);
      result.recommendation = 'CONSULT_PHYSICIAN';
      result.details.risk_class = info.class;
      
      // Check for drug interactions
      if (currentMedications.length > 0) {
        for (const currentMed of currentMedications) {
          if (info.interactions.some(i => currentMed.toLowerCase().includes(i))) {
            result.safety_score = 2;
            result.interactions = 'SEVERE';
            result.warnings.push(`SEVERE interaction with ${currentMed}`);
            result.recommendation = 'REJECT';
          }
        }
      }
      break;
    }
  }

  // Check dosage if we have data
  const dosageNum = parseInt(dosage);
  if (!isNaN(dosageNum)) {
    for (const [key, info] of Object.entries(commonDosages)) {
      if (medLower.includes(key)) {
        result.details.standard_range = `${info.min}-${info.max} ${info.unit}`;
        result.details.frequency = info.frequency;
        
        if (dosageNum < info.min) {
          result.dosage_check = 'TOO_LOW';
          result.safety_score = Math.min(result.safety_score, 6);
          result.warnings.push(`Dosage ${dosage} is below standard range (${info.min}-${info.max} ${info.unit})`);
          result.recommendation = 'APPROVE_WITH_MONITORING';
        } else if (dosageNum > info.max) {
          result.dosage_check = 'TOO_HIGH';
          result.safety_score = Math.min(result.safety_score, 4);
          result.warnings.push(`Dosage ${dosage} exceeds standard range (${info.min}-${info.max} ${info.unit})`);
          result.recommendation = 'REJECT';
        }
        break;
      }
    }
  }

  // Age-based adjustments
  if (patientAge) {
    if (patientAge < 12) {
      result.warnings.push('Pediatric patient - verify weight-based dosing');
      result.safety_score = Math.min(result.safety_score, 6);
    } else if (patientAge > 65) {
      result.warnings.push('Geriatric patient - consider reduced dosage');
      result.safety_score = Math.min(result.safety_score, 7);
    }
  }

  // Final recommendation logic
  if (result.warnings.length === 0) {
    result.recommendation = 'APPROVE';
    result.safety_score = Math.max(result.safety_score, 8);
  } else if (result.recommendation === 'APPROVE') {
    result.recommendation = 'APPROVE_WITH_MONITORING';
  }

  return result;
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

  const blocks = [
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
    }
  ];

  // Add warnings if any
  if (audit.warnings.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Warnings:*\n${audit.warnings.map(w => `• ${w}`).join('\n')}`
      }
    });
  }

  // Add details if available
  if (audit.details.standard_range) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Standard Range:* ${audit.details.standard_range}\n*Frequency:* ${audit.details.frequency}`
      }
    });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "This is an AI-assisted audit. Always verify with a qualified healthcare professional."
      }
    ]
  });

  return blocks;
}

module.exports = {
  auditPrescription,
  getAuditBlocks
};
