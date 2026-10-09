import { Router } from 'express';
import { z } from 'zod';
import { evaluateSafety } from '../services/safetyService';
import { retrieveMedicalContext } from '../services/retrievalService';
import { generateClinicalGuidance, SUPPORTED_MODELS } from '../services/nimService';

export const aiRouter = Router();

// GET /api/v1/ai/models - Return the 3 selectable NVIDIA NIM models
aiRouter.get('/models', (req, res) => {
  res.json({
    models: SUPPORTED_MODELS,
    defaultModel: SUPPORTED_MODELS[0].id,
  });
});

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional(),
  modelId: z.string().optional(),
  language: z.enum(['en', 'hi', 'mr']).optional().default('en'),
});

// POST /api/v1/ai/chat - AI Healthcare Navigator with NVIDIA NIM
aiRouter.post('/chat', async (req, res, next) => {
  try {
    const parse = chatSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { message, history, modelId, language } = parse.data;

    // 1. Evaluate deterministic medical safety
    const safety = evaluateSafety(message);

    // 2. Retrieve grounded medical knowledge, doctors, and facilities
    const retrieval = retrieveMedicalContext(message);

    // 3. Generate guidance via NVIDIA NIM
    const aiResult = await generateClinicalGuidance({
      userMessage: message,
      history,
      modelId,
      language,
      retrieval,
      safety,
    });

    res.json({
      text: aiResult.text,
      modelUsed: aiResult.modelUsed,
      citations: aiResult.citations,
      suggestedSpecialty: aiResult.suggestedSpecialty,
      isEmergency: aiResult.isEmergency,
      safetyEvaluation: safety,
      recommendedDoctors: retrieval.matchedDoctors,
      recommendedFacilities: retrieval.matchedFacilities,
    });
  } catch (err) {
    next(err);
  }
});

const triageSchema = z.object({
  symptoms: z.string().min(1, 'Symptoms description is required'),
  duration: z.string().optional(),
  severity: z.string().optional(),
});

// POST /api/v1/ai/triage - Dedicated symptom triage assessment
aiRouter.post('/triage', async (req, res, next) => {
  try {
    const parse = triageSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { symptoms } = parse.data;
    const safety = evaluateSafety(symptoms);
    const retrieval = retrieveMedicalContext(symptoms);

    let urgencyLevel: 'routine' | 'moderate' | 'emergency' = 'routine';
    if (safety.isEmergency) {
      urgencyLevel = 'emergency';
    } else if (
      symptoms.toLowerCase().includes('fever') ||
      symptoms.toLowerCase().includes('pain') ||
      symptoms.toLowerCase().includes('vomit')
    ) {
      urgencyLevel = 'moderate';
    }

    res.json({
      urgencyLevel,
      suggestedSpecialist: retrieval.suggestedSpecialty || 'General Physician',
      safetyEvaluation: safety,
      guidanceSummary: retrieval.groundedKnowledge[0]?.summary || 'Symptom review completed.',
      recommendedDoctors: retrieval.matchedDoctors,
      recommendedFacilities: retrieval.matchedFacilities,
    });
  } catch (err) {
    next(err);
  }
});
