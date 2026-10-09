export interface SafetyEvaluation {
  isEmergency: boolean;
  emergencyCategory?: string;
  recommendedAction: string;
  emergencyPhone: string;
  redFlagsTriggered: string[];
}

const EMERGENCY_PATTERNS = [
  {
    category: 'Cardiovascular / Heart Attack',
    keywords: [
      'crushing chest pain',
      'chest pressure radiating',
      'left arm pain and chest',
      'chest pain cold sweat',
      'heart attack',
      'chest pain radiating to jaw',
      'severe chest tightness sweating',
    ],
    action: 'Immediately call emergency services (112 / 911) or proceed to the nearest emergency room. Do not drive yourself.',
  },
  {
    category: 'Acute Stroke (BE FAST)',
    keywords: [
      'face drooping',
      'facial droop',
      'slurred speech',
      'sudden arm weakness',
      'sudden numbness one side',
      'sudden loss of vision',
      'cannot speak clearly',
      'stroke symptoms',
    ],
    action: 'Immediate acute stroke intervention required. Call 112 / 911 immediately. Note the exact time symptoms started.',
  },
  {
    category: 'Severe Respiratory Distress',
    keywords: [
      'cannot breathe',
      'severe difficulty breathing',
      'turning blue',
      'blue lips',
      'gasping for air',
      'suffocating',
      'stridor',
    ],
    action: 'Urgent respiratory compromise. Sit upright, use any rescue inhaler if prescribed, and call emergency services immediately.',
  },
  {
    category: 'Anaphylaxis / Severe Allergic Reaction',
    keywords: [
      'swollen tongue breathing',
      'throat closing up',
      'anaphylaxis',
      'swollen lips cannot breathe',
      'severe allergic reaction throat',
    ],
    action: 'Immediate anaphylaxis emergency. Administer epinephrine auto-injector (EpiPen) if available and call emergency services without delay.',
  },
  {
    category: 'Neurological / Acute Meningitis or Thunderclap',
    keywords: [
      'worst headache of my life',
      'thunderclap headache',
      'stiff neck high fever rash',
      'unresponsive',
      'sudden seizure',
      'coughing up blood',
      'uncontrolled bleeding',
    ],
    action: 'Potential acute neurological or hemorrhagic emergency. Seek immediate emergency medical care.',
  },
];

export const MANDATORY_DISCLAIMER =
  '\n\n*Educational Guidance Disclaimer: HEALHEALTH AI is an educational navigation assistant and does not provide formal medical diagnosis or prescription. Always consult a licensed physician for clinical diagnosis and treatment.*';

export function evaluateSafety(userMessage: string): SafetyEvaluation {
  const lowerMsg = userMessage.toLowerCase();
  const triggered: string[] = [];
  let matchedCategory: string | undefined;
  let action = 'If your symptoms worsen or you feel dizzy or faint, consult an emergency physician.';

  for (const pat of EMERGENCY_PATTERNS) {
    for (const kw of pat.keywords) {
      if (lowerMsg.includes(kw)) {
        triggered.push(kw);
        matchedCategory = pat.category;
        action = pat.action;
        break;
      }
    }
    if (triggered.length > 0) break;
  }

  return {
    isEmergency: triggered.length > 0,
    emergencyCategory: matchedCategory,
    recommendedAction: action,
    emergencyPhone: '112 / 911',
    redFlagsTriggered: triggered,
  };
}
