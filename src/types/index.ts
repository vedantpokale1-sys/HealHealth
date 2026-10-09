export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bloodGroup: string;
  dob: string;
  gender: string;
  preferredLanguage: Language;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicConditions: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  languages: string[];
  clinic: string;
  location: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  consultationTypes: ('video' | 'in-person')[];
  nextAvailable: string;
  about: string;
  availableSlots: string[];
  avatarUrl: string;
  isDemo: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  clinic: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
  patientName: string;
  notes?: string;
  symptoms?: string;
  meetingLink?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  category: 'Blood Test' | 'Radiology' | 'Pathology' | 'Prescription' | 'Cardiology';
  uploadDate: string;
  fileSize: string;
  fileName: string;
  summary: string;
  doctorName?: string;
  parameters: {
    name: string;
    value: string;
    referenceRange: string;
    unit: string;
    status: 'normal' | 'low' | 'high' | 'critical';
    explanation: string;
  }[];
  questionsForDoctor: string[];
  isDemo: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  timeSlots: { time: string; taken: boolean; takenAt?: string }[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  avatarColor: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'medication' | 'report' | 'system';
  isRead: boolean;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedSpecialty?: string;
  urgencyLevel?: 'routine' | 'moderate' | 'emergency';
  doctorRecommendation?: {
    id: string;
    name: string;
    specialty: string;
  };
}

export interface AnatomyRegion {
  id: string;
  name: string;
  category: 'Cranial' | 'Cardiovascular' | 'Respiratory' | 'Digestive' | 'Musculoskeletal' | 'Endocrine';
  description: string;
  commonSymptoms: string[];
  suggestedSpecialists: string[];
  educationalNotes: string;
  hotspotPosition: [number, number, number];
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'doctor';
  address: string;
  locality: string;
  city: string;
  pinCode: string;
  coordinates: [number, number]; // [lat, lng]
  specialties: string[];
  phone: string;
  website?: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  isEmergency24x7: boolean;
  isOpenNow: boolean;
  insuranceAccepted: string[];
  doctorId?: string; // links to existing Doctor record
  doctorName?: string;
  doctorSpecialty?: string;
  doctorAvatar?: string;
  imageUrl?: string;
  description?: string;
  bedsCount?: number;
  emergencyPhone?: string;
  consultationFee?: number;
  isDemo: boolean;
}
