import { env } from '../config/env';
import { RetrievalResult } from './retrievalService';
import { SafetyEvaluation, MANDATORY_DISCLAIMER } from './safetyService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const SUPPORTED_MODELS = [
  {
    id: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    name: 'Nemotron 3.5 Super VL (120B)',
    tag: 'Advanced Multimodal Clinical Reasoning',
    provider: 'NVIDIA NIM',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    name: 'Nemotron 3.5 Lightning (30B)',
    tag: 'Rapid Clinical Triage & Guidance',
    provider: 'NVIDIA NIM',
  },
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    name: 'Nemotron 3 Nano Omni',
    tag: 'Deep Reasoning & Clinical Analysis',
    provider: 'NVIDIA NIM',
  },
];

function getChatCompletionsUrl(baseUrl: string): string {
  const clean = (baseUrl || 'https://integrate.api.nvidia.com/v1').trim().replace(/\/+$/, '');
  if (clean.endsWith('/v1')) {
    return `${clean}/chat/completions`;
  }
  return `${clean}/v1/chat/completions`;
}

function cleanModelContent(rawText: string): string {
  if (!rawText) return '';
  let text = rawText;

  // 1. Remove XML/HTML style <think>...</think> blocks
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip raw Chain-of-Thought intros if dumped directly by reasoning models
  if (/^Here'?s a thinking process:/i.test(text)) {
    const withoutIntro = text.replace(
      /^Here'?s a thinking process:[\s\S]*?(?=(\n\n|\n)(?:#{1,4}\s|\*{1,2}[A-Za-z]|Hello|Thank you|I understand|Based on|Here are|Symptom|Immediate|Care|\*\*|•|-))/i,
      ''
    );
    if (withoutIntro && withoutIntro.trim().length > 30) {
      text = withoutIntro.trim();
    }
  }

  return text.trim();
}

export async function generateClinicalGuidance({
  userMessage,
  history = [],
  modelId,
  language = 'en',
  retrieval,
  safety,
  isFailover = false,
}: {
  userMessage: string;
  history?: ChatMessage[];
  modelId?: string;
  language?: string;
  retrieval: RetrievalResult;
  safety: SafetyEvaluation;
  isFailover?: boolean;
}): Promise<{
  text: string;
  modelUsed: string;
  citations: Array<{ title: string; url: string }>;
  suggestedSpecialty: string;
  isEmergency: boolean;
}> {
  const selectedModel = modelId || env.AI_DEFAULT_MODEL;

  // 1. Deterministic safety protocol: High-risk red flags trigger immediate emergency action
  if (safety.isEmergency) {
    const emergencyResponse = `🚨 **URGENT MEDICAL WARNING**: Your reported symptoms indicate a potential high-risk medical condition (${safety.emergencyCategory || 'Urgent Clinical Red Flag'}).

**Immediate Action Required:**
- ${safety.recommendedAction}
- Please call local emergency services (**${safety.emergencyPhone}**) or proceed immediately to the nearest 24/7 Emergency Hospital.
- Do not drive yourself; have an ambulance or family member transport you immediately.

We have automatically located nearby 24/7 emergency trauma centers and hospitals below for immediate dispatch.${MANDATORY_DISCLAIMER}`;

    return {
      text: emergencyResponse,
      modelUsed: `${selectedModel} (Emergency Protocol)`,
      citations: [
        { title: 'Emergency Triage Protocol (AHA / MedlinePlus Guidelines)', url: 'https://medlineplus.gov' },
      ],
      suggestedSpecialty: 'Emergency Medicine',
      isEmergency: true,
    };
  }

  // 2. Validate API key
  if (!env.AI_API_KEY || env.AI_API_KEY.trim() === '') {
    throw new Error(
      'AI Provider API Key (AI_API_KEY) is missing. Please configure AI_API_KEY in your server environment variables.'
    );
  }

  // 3. Grounded medical citations from verified database
  const knowledgeContext = retrieval.groundedKnowledge
    .map(
      (k, i) =>
        `[Evidence Source ${i + 1}: ${k.sourceTitle} (${k.sourceUrl})]\nClinical Focus: ${k.topic}\nSummary: ${k.summary}\nGuidance: ${k.clinicalGuidance}\nWarning Red Flags: ${k.redFlags.join(', ')}`
    )
    .join('\n\n');

  let languageInstruction = 'Respond in clear, professional English.';
  if (language === 'hi') {
    languageInstruction =
      'Respond in clear, supportive Hindi (Devanagari script or Hinglish where helpful for clinical clarity).';
  } else if (language === 'mr') {
    languageInstruction = 'Respond in clear, supportive Marathi.';
  }

  const systemPrompt = `You are HEALHEALTH AI Clinical Navigator, a compassionate, evidence-grounded healthcare navigation assistant.
Your goal is to guide users to understand their symptoms, identify missing clinical context, provide practical supportive self-care, and recommend appropriate verified medical specialists.

CLINICAL & SAFETY RULES:
1. Ground your guidance STRICTLY on sound medical principles and the evidence provided below.
2. ${languageInstruction}
3. Never claim to give a definitive diagnosis. Frame possible causes as educational possibilities to discuss with a clinician.
4. If the user's description is brief or missing details (e.g. onset, duration, pain severity, other symptoms), ask 2-3 targeted follow-up questions to clarify.
5. Suggest evidence-based, low-risk supportive care (e.g. hydration, rest, warm salt-water gargle, steam, cool compresses).
6. NEVER prescribe specific prescription drugs or dictate drug dosages.
7. Always advise the user when to seek immediate or emergency in-person medical evaluation.
8. Clearly recommend an appropriate clinical specialty: "${retrieval.suggestedSpecialty || 'General Physician'}".
9. Format your response with clear sections, bullet points, and reassuring, empathetic language.

GROUNDED MEDICAL EVIDENCE:
${knowledgeContext || 'Standard clinical practice and evidence-based guidance apply.'}`;

  const apiUrl = getChatCompletionsUrl(env.AI_BASE_URL);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: userMessage },
  ];

  // Request to AI Router with timeout protection (60 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: 0.25,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr: any = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        // Not JSON
      }

      // If upstream model provider is experiencing a 5xx origin error and not already failed over,
      // failover to default model
      if (
        (response.status >= 500 && response.status <= 504) &&
        selectedModel !== env.AI_DEFAULT_MODEL &&
        !isFailover
      ) {
        console.warn(
          `Upstream provider returned HTTP ${response.status} for ${selectedModel}. Automatically failing over to ${env.AI_DEFAULT_MODEL}...`
        );
        return generateClinicalGuidance({
          userMessage,
          history,
          modelId: env.AI_DEFAULT_MODEL,
          language,
          retrieval,
          safety,
          isFailover: true,
        });
      }

      const messageDetail = parsedErr.error?.message || parsedErr.message || errText || `HTTP ${response.status}`;
      throw new Error(`AI Router returned HTTP ${response.status}: ${messageDetail}`);
    }

    const data = await response.json();
    let reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.message?.reasoning_content ||
      data.choices?.[0]?.message?.reasoning ||
      '';

    reply = cleanModelContent(reply);

    if (!reply || reply.trim().length === 0) {
      throw new Error(`AI model (${selectedModel}) returned an empty response. Please try again.`);
    }

    // Append mandatory educational disclaimer
    const finalContent = `${reply}${MANDATORY_DISCLAIMER}`;

    const citations = retrieval.groundedKnowledge.map((k) => ({
      title: k.sourceTitle,
      url: k.sourceUrl,
    }));

    return {
      text: finalContent,
      modelUsed: isFailover ? `${env.AI_DEFAULT_MODEL} (Failover from ${selectedModel})` : selectedModel,
      citations,
      suggestedSpecialty: retrieval.suggestedSpecialty || 'General Physician',
      isEmergency: false,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If timeout occurred and this was a secondary model, attempt failover to default model
    if (error.name === 'AbortError') {
      if (selectedModel !== env.AI_DEFAULT_MODEL && !isFailover) {
        console.warn(`Model ${selectedModel} timed out. Attempting fast failover to ${env.AI_DEFAULT_MODEL}...`);
        return generateClinicalGuidance({
          userMessage,
          history,
          modelId: env.AI_DEFAULT_MODEL,
          language,
          retrieval,
          safety,
          isFailover: true,
        });
      }
      throw new Error(`Request to AI model (${selectedModel}) timed out after 60 seconds. Please retry.`);
    }

    throw error;
  }
}
