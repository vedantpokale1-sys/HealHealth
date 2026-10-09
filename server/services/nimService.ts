import { env } from '../config/env';
import { RetrievalResult } from './retrievalService';
import { SafetyEvaluation, MANDATORY_DISCLAIMER } from './safetyService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const SUPPORTED_MODELS = [
  {
    id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    name: 'NVIDIA Nemotron 3.5 Lightning 30B',
    tag: 'Ultra-Fast Clinical Reasoning',
    provider: 'NVIDIA NIM',
  },
  {
    id: 'meta/muse-glimmer-30b',
    name: 'Meta Muse Glimmer 30B',
    tag: 'Advanced Dialogue & Empathy',
    provider: 'NVIDIA NIM',
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'NVIDIA Nemotron 3 Ultra 550B',
    tag: 'Flagship Deep Medical Reasoning',
    provider: 'NVIDIA NIM',
  },
];

export async function generateClinicalGuidance({
  userMessage,
  history = [],
  modelId,
  language = 'en',
  retrieval,
  safety,
}: {
  userMessage: string;
  history?: ChatMessage[];
  modelId?: string;
  language?: string;
  retrieval: RetrievalResult;
  safety: SafetyEvaluation;
}): Promise<{
  text: string;
  modelUsed: string;
  citations: Array<{ title: string; url: string }>;
  suggestedSpecialty: string;
  isEmergency: boolean;
}> {
  const selectedModel = modelId || env.NVIDIA_NIM_DEFAULT_MODEL;

  // If safety red flags triggered, return immediate urgent clinical safety response
  if (safety.isEmergency) {
    const emergencyResponse = `🚨 **URGENT MEDICAL WARNING**: Your symptoms indicate a potential high-risk medical condition (${safety.emergencyCategory}).\n\n**Immediate Action Required:**\n- ${safety.recommendedAction}\n- Please call local emergency services (**${safety.emergencyPhone}**) or go to the nearest 24/7 Emergency Hospital immediately.\n- Do not drive yourself; have emergency medical technicians or a family member transport you.\n\nWe have automatically loaded nearby 24/7 emergency trauma centers and hospitals below for immediate contact.${MANDATORY_DISCLAIMER}`;

    return {
      text: emergencyResponse,
      modelUsed: selectedModel,
      citations: [
        { title: 'Emergency Triage Protocol (BE FAST / AHA Guidelines)', url: 'https://medlineplus.gov' },
      ],
      suggestedSpecialty: 'Emergency Medicine',
      isEmergency: true,
    };
  }

  // Format grounded medical evidence
  const knowledgeContext = retrieval.groundedKnowledge
    .map(
      (k, i) =>
        `[Source ${i + 1}: ${k.sourceTitle} (${k.sourceUrl})]\nTopic: ${k.topic}\nSummary: ${k.summary}\nGuidance: ${k.clinicalGuidance}\nWarning Red Flags: ${k.redFlags.join(', ')}`
    )
    .join('\n\n');

  let languageInstruction = 'Respond in clear, professional English.';
  if (language === 'hi') {
    languageInstruction = 'Respond in clear, supportive Hindi (Devanagari script or Hinglish where helpful for medical terms).';
  } else if (language === 'mr') {
    languageInstruction = 'Respond in clear, supportive Marathi.';
  }

  const systemPrompt = `You are HEALHEALTH AI Clinical Navigator, a compassionate, evidence-grounded healthcare assistant.
Your mission is to help users understand symptoms, identify missing context, suggest low-risk self-care steps, and recommend suitable medical specialists.

RULES:
1. Ground your guidance STRICTLY on the retrieved medical facts provided below. Do not fabricate medical claims.
2. ${languageInstruction}
3. Explain general possible causes without claiming a definitive diagnosis.
4. Suggest practical, low-risk supportive home care (e.g. hydration, rest, warm liquids, salt water gargle).
5. Specify warning signs when the patient should seek immediate in-person clinical evaluation.
6. Clearly recommend an appropriate medical specialist: "${retrieval.suggestedSpecialty}".
7. NEVER prescribe specific pharmaceuticals or invent dosages.
8. Structure your answer with clear bullet points. Keep it clear, concise, and reassuring.

GROUNDED MEDICAL EVIDENCE:
${knowledgeContext || 'General evidence-based clinical guidance applies.'}`;

  // Call NVIDIA NIM API
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4), // Last 4 turns for context
      { role: 'user', content: userMessage },
    ];

    const response = await fetch(`${env.NVIDIA_NIM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.NVIDIA_NIM_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: 0.2,
        top_p: 0.8,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`NVIDIA NIM API responded with ${response.status}: ${errText}`);
      throw new Error(`NVIDIA NIM status ${response.status}`);
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content;
    const reasoning = data.choices?.[0]?.message?.reasoning_content;

    // Handle models that output reasoning in reasoning_content or within <think> tags
    if (!reply && reasoning) {
      reply = reasoning;
    }

    if (reply) {
      // Strip <think> tags if present
      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }

    if (!reply) {
      throw new Error('Empty response from model');
    }

    // Append standard educational disclaimer
    const finalContent = `${reply}${MANDATORY_DISCLAIMER}`;

    const citations = retrieval.groundedKnowledge.map(k => ({
      title: k.sourceTitle,
      url: k.sourceUrl,
    }));

    return {
      text: finalContent,
      modelUsed: selectedModel,
      citations,
      suggestedSpecialty: retrieval.suggestedSpecialty || 'General Physician',
      isEmergency: false,
    };
  } catch (error: any) {
    console.error('NVIDIA NIM invocation fallback:', error.message);

    // Reliable grounded fallback using retrieved evidence
    const fallbackTopic = retrieval.groundedKnowledge[0] || {
      topic: 'General Health Symptom Assessment',
      summary: 'Your reported symptoms should be evaluated by a healthcare specialist for proper care.',
      clinicalGuidance: 'Stay well-hydrated, rest, and monitor your symptoms. Seek prompt in-person medical evaluation if your symptoms persist or worsen.',
      sourceTitle: 'MedlinePlus Clinical Guide',
      sourceUrl: 'https://medlineplus.gov',
    };

    const fallbackResponse = `Thank you for sharing your symptoms. Based on evidence-grounded clinical references from **${fallbackTopic.sourceTitle}**:

• **Assessment**: ${fallbackTopic.summary}
• **General Supportive Care**: ${fallbackTopic.clinicalGuidance}
• **Recommended Specialist**: We recommend consulting a **${retrieval.suggestedSpecialty || 'General Physician'}** for a comprehensive evaluation.
• **When to Seek Immediate Care**: If you develop high fever, difficulty breathing, or severe pain, please visit an urgent care center or emergency room.${MANDATORY_DISCLAIMER}`;

    return {
      text: fallbackResponse,
      modelUsed: `${selectedModel} (Grounded Knowledge Mode)`,
      citations: [
        {
          title: fallbackTopic.sourceTitle,
          url: fallbackTopic.sourceUrl,
        },
      ],
      suggestedSpecialty: retrieval.suggestedSpecialty || 'General Physician',
      isEmergency: false,
    };
  }
}
