import { Doctor, HealthcareFacility, Appointment } from '../types';

const API_BASE = '/api/v1';

export interface AiModelOption {
  id: string;
  name: string;
  tag: string;
  provider: string;
}

export interface ChatResponse {
  text: string;
  modelUsed: string;
  citations: Array<{ title: string; url: string }>;
  suggestedSpecialty: string;
  isEmergency: boolean;
  safetyEvaluation: {
    isEmergency: boolean;
    emergencyCategory?: string;
    recommendedAction: string;
    emergencyPhone: string;
    redFlagsTriggered: string[];
  };
  recommendedDoctors: Doctor[];
  recommendedFacilities: HealthcareFacility[];
}

export interface TriageResponse {
  urgencyLevel: 'routine' | 'moderate' | 'emergency';
  suggestedSpecialist: string;
  safetyEvaluation: {
    isEmergency: boolean;
    emergencyCategory?: string;
    recommendedAction: string;
    emergencyPhone: string;
    redFlagsTriggered: string[];
  };
  guidanceSummary: string;
  recommendedDoctors: Doctor[];
  recommendedFacilities: HealthcareFacility[];
}

export const api = {
  // Health Check
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  // AI Models
  async getAiModels(): Promise<{ models: AiModelOption[]; defaultModel: string }> {
    try {
      const res = await fetch(`${API_BASE}/ai/models`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /ai/models fallback');
    }
    return {
      models: [
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
      ],
      defaultModel: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    };
  },

  // AI Healthcare Chat
  async sendAiChat({
    message,
    history = [],
    modelId,
    language = 'en',
  }: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    modelId?: string;
    language?: string;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, modelId, language }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `AI Chat error: ${res.status}`);
    }

    return res.json();
  },

  // AI Triage
  async triageSymptoms(data: {
    symptoms: string;
    duration?: string;
    severity?: string;
  }): Promise<TriageResponse> {
    const res = await fetch(`${API_BASE}/ai/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`AI Triage error: ${res.status}`);
    }

    return res.json();
  },

  // Doctors
  async getDoctors(params?: { query?: string; specialty?: string; location?: string }): Promise<Doctor[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.specialty) searchParams.set('specialty', params.specialty);
    if (params?.location) searchParams.set('location', params.location);

    const res = await fetch(`${API_BASE}/doctors?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    const data = await res.json();
    return data.doctors;
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.doctor;
  },

  // Facilities
  async getFacilities(params?: { query?: string; type?: string; emergency?: boolean }): Promise<HealthcareFacility[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.emergency) searchParams.set('emergency', 'true');

    const res = await fetch(`${API_BASE}/facilities?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    const data = await res.json();
    return data.facilities;
  },

  // Appointments
  async getAppointments(userId: string = 'usr_001'): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/appointments?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    const data = await res.json();
    return data.appointments;
  },

  async getAppointmentSlots(doctorId: string, date: string): Promise<{
    allSlots: string[];
    bookedSlots: string[];
    availableSlots: string[];
  }> {
    const res = await fetch(
      `${API_BASE}/appointments/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`
    );
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json();
  },

  async bookAppointment(data: {
    userId?: string;
    doctorId: string;
    date: string;
    time: string;
    type?: 'video' | 'in-person';
    symptoms?: string;
    notes?: string;
  }): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Booking failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.appointment;
  },

  async cancelAppointment(id: string, userId: string = 'usr_001'): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/${id}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel appointment');
    }

    const json = await res.json();
    return json.appointment;
  },

  // Report Analyzer
  async analyzeReport(data: {
    reportText: string;
    reportType?: string;
    modelId?: string;
  }): Promise<{
    summary: string;
    abnormalFindings: string[];
    riskLevel: 'low' | 'moderate' | 'high';
    discussionQuestions: string[];
    suggestedSpecialist: string;
    modelUsed: string;
    disclaimer: string;
  }> {
    const res = await fetch(`${API_BASE}/reports/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze report');
    }

    return res.json();
  },

  // Auth (with Demo support)
  async login(email?: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async signup(data: { name: string; email: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },
};
