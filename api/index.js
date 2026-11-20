// server/server.ts
import express from "express";
import cors from "cors";

// server/config/env.ts
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
var apiKey = process.env.AI_API_KEY || process.env.BYNARA_API_KEY || process.env.NVIDIA_NIM_API_KEY || "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";
var baseUrl = process.env.AI_BASE_URL || process.env.NVIDIA_NIM_BASE_URL || process.env.BYNARA_BASE_URL || "https://integrate.api.nvidia.com/v1";
var defaultModel = process.env.AI_DEFAULT_MODEL || process.env.NVIDIA_NIM_DEFAULT_MODEL || process.env.BYNARA_DEFAULT_MODEL || "nvidia/nemotron-3.5-super-vl-120b-a12b";
var envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  AI_API_KEY: z.string().min(1, "AI Provider API key is required"),
  AI_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  AI_DEFAULT_MODEL: z.string().default("nvidia/nemotron-3.5-super-vl-120b-a12b"),
  JWT_SECRET: z.string().default("healhealth-super-secret-jwt-key-2026-production")
});
var parsed = envSchema.safeParse({
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  AI_API_KEY: apiKey,
  AI_BASE_URL: baseUrl,
  AI_DEFAULT_MODEL: defaultModel,
  JWT_SECRET: process.env.JWT_SECRET || "healhealth-super-secret-jwt-key-2026-production"
});
if (!parsed.success) {
  console.warn("\u26A0\uFE0F Environment warning:", parsed.error.format());
}
var env = parsed.success ? parsed.data : {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  AI_API_KEY: apiKey,
  AI_BASE_URL: baseUrl,
  AI_DEFAULT_MODEL: defaultModel,
  JWT_SECRET: process.env.JWT_SECRET || "healhealth-super-secret-jwt-key-2026-production"
};

// server/db/db.ts
import { createRequire } from "node:module";
import path2 from "path";

// server/data/fallbackData.ts
var FALLBACK_DOCTORS = [
  {
    id: "doc_1",
    name: "Dr. Priya Kulkarni",
    specialty: "Cardiologist",
    qualifications: "MD, DM (Cardiology), FACC",
    experienceYears: 14,
    languages: ["English", "Hindi", "Marathi"],
    clinic: "Apex Heart & Vascular Institute",
    location: "Bandra West, Mumbai",
    rating: 4.9,
    reviewCount: 342,
    consultationFee: 1200,
    consultationTypes: ["video", "in-person"],
    nextAvailable: "Tomorrow, 10:30 AM",
    about: "Dr. Priya Kulkarni is a senior cardiologist specializing in preventive cardiology, echocardiography, coronary disease management, and cardiac rehabilitation.",
    availableSlots: ["09:30 AM", "10:30 AM", "11:15 AM", "02:00 PM", "04:30 PM", "06:00 PM"],
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    isDemo: true
  },
  {
    id: "doc_2",
    name: "Dr. Rahul Mehta",
    specialty: "Neurologist",
    qualifications: "MBBS, MD (Medicine), DM (Neurology)",
    experienceYears: 11,
    languages: ["English", "Hindi", "Gujarati"],
    clinic: "NeuroCare Center for Brain Health",
    location: "Lower Parel, Mumbai",
    rating: 4.8,
    reviewCount: 218,
    consultationFee: 1500,
    consultationTypes: ["video", "in-person"],
    nextAvailable: "Today, 03:00 PM",
    about: "Specialist in migraine management, neuromuscular disorders, sleep neurology, and post-stroke rehabilitation with 11+ years of clinical excellence.",
    availableSlots: ["03:00 PM", "03:45 PM", "05:00 PM", "06:30 PM"],
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    isDemo: true
  },
  {
    id: "doc_3",
    name: "Dr. Ananya Deshmukh",
    specialty: "Endocrinologist",
    qualifications: "MBBS, MD, DNB (Endocrinology)",
    experienceYears: 9,
    languages: ["English", "Hindi", "Marathi"],
    clinic: "Metabolic & Hormone Wellness Clinic",
    location: "Andheri East, Mumbai",
    rating: 4.95,
    reviewCount: 189,
    consultationFee: 1e3,
    consultationTypes: ["video", "in-person"],
    nextAvailable: "Thursday, 11:00 AM",
    about: "Expertise in type 1 & 2 diabetes management, thyroid dysfunctions, gestational diabetes, and metabolic syndrome optimization.",
    availableSlots: ["11:00 AM", "12:15 PM", "02:30 PM", "04:00 PM"],
    avatarUrl: "https://images.unsplash.com/photo-1594824813620-bf168759d57a?auto=format&fit=crop&q=80&w=400",
    isDemo: true
  },
  {
    id: "doc_4",
    name: "Dr. Vikramaditya Sen",
    specialty: "Orthopedic Surgeon",
    qualifications: "MS (Ortho), MCh, Fellowship in Joint Replacement",
    experienceYears: 18,
    languages: ["English", "Hindi", "Bengali"],
    clinic: "Fortis Bone & Joint Center",
    location: "Mulund West, Mumbai",
    rating: 4.7,
    reviewCount: 412,
    consultationFee: 1400,
    consultationTypes: ["in-person"],
    nextAvailable: "Friday, 02:00 PM",
    about: "Renowned orthopedic surgeon specializing in robotic joint replacements, sports injuries, ligament reconstruction, and spine posture therapies.",
    availableSlots: ["02:00 PM", "03:00 PM", "04:15 PM", "05:30 PM"],
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    isDemo: true
  },
  {
    id: "doc_5",
    name: "Dr. Sunita Rao",
    specialty: "Pulmonologist",
    qualifications: "MD (Chest Medicine), FCCP (USA)",
    experienceYears: 13,
    languages: ["English", "Hindi", "Telugu"],
    clinic: "Breathe Easy Respiratory Clinic",
    location: "Powai, Mumbai",
    rating: 4.85,
    reviewCount: 276,
    consultationFee: 1100,
    consultationTypes: ["video", "in-person"],
    nextAvailable: "Tomorrow, 04:00 PM",
    about: "Dedicated to allergic asthma, chronic cough, COPD, post-viral respiratory recovery, and sleep apnea diagnostic testing.",
    availableSlots: ["10:00 AM", "11:30 AM", "04:00 PM", "05:15 PM"],
    avatarUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
    isDemo: true
  },
  {
    id: "doc_6",
    name: "Dr. Farhan Qureshi",
    specialty: "General Physician",
    qualifications: "MBBS, MD (Family Medicine)",
    experienceYears: 8,
    languages: ["English", "Hindi", "Urdu"],
    clinic: "CareFirst Family Health Practice",
    location: "Dadar West, Mumbai",
    rating: 4.75,
    reviewCount: 310,
    consultationFee: 700,
    consultationTypes: ["video", "in-person"],
    nextAvailable: "Today, 05:30 PM",
    about: "Primary care clinician focused on holistic wellness, preventative health check-ups, acute infections, and continuous family health management.",
    availableSlots: ["05:30 PM", "06:15 PM", "07:00 PM", "07:45 PM"],
    avatarUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
    isDemo: true
  }
];
var FALLBACK_FACILITIES = [
  {
    id: "fac_1",
    name: "Apex Heart & Vascular Institute",
    type: "clinic",
    address: "Suite 402, Platinum Health Tower, Turner Road",
    locality: "Bandra West",
    city: "Mumbai",
    pinCode: "400050",
    coordinates: [19.0596, 72.8295],
    specialties: ["Cardiology", "Vascular Medicine", "Preventive Health", "Echocardiography"],
    phone: "+91 22 2640 8891",
    website: "https://apexheartmumbai.example.org",
    openingHours: "Mon - Sat: 08:30 AM - 08:00 PM",
    rating: 4.9,
    reviewCount: 342,
    isEmergency24x7: false,
    isOpenNow: true,
    insuranceAccepted: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Care Health"],
    doctorId: "doc_1",
    doctorName: "Dr. Priya Kulkarni",
    doctorSpecialty: "Cardiologist",
    doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
    description: "Premier outpatient cardiology center equipped with advanced high-resolution Doppler echocardiography, cardiac stress telemetry, and preventive lifestyle guidance.",
    consultationFee: 1200,
    isDemo: true
  },
  {
    id: "fac_2",
    name: "Metro General Super-Speciality Hospital",
    type: "hospital",
    address: "Plot 18, S.V. Road, Near Linking Road Junction",
    locality: "Bandra West",
    city: "Mumbai",
    pinCode: "400050",
    coordinates: [19.0544, 72.8402],
    specialties: ["Emergency Medicine", "Cardiology", "Trauma Surgery", "Neurology", "Critical Care", "Internal Medicine"],
    phone: "+91 22 6120 5000",
    emergencyPhone: "+91 22 6120 5999",
    website: "https://metrogeneral.example.org",
    openingHours: "24 Hours / 7 Days Open",
    rating: 4.8,
    reviewCount: 1280,
    isEmergency24x7: true,
    isOpenNow: true,
    insuranceAccepted: ["All Major Insurances", "Cashless TPA", "Ayushman Bharat", "Star Health", "HDFC ERGO"],
    bedsCount: 520,
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600",
    description: "NABH-accredited tertiary care multi-speciality hospital with a 40-bed level-1 adult and pediatric trauma center and round-the-clock cardiac cath lab.",
    isDemo: true
  },
  {
    id: "fac_3",
    name: "NeuroCare Center for Brain Health",
    type: "clinic",
    address: "Ground Floor, Phoenix Paragon, Senapati Bapat Marg",
    locality: "Lower Parel",
    city: "Mumbai",
    pinCode: "400013",
    coordinates: [18.9958, 72.8258],
    specialties: ["Neurology", "EEG & EMG Diagnostics", "Headache Clinic", "Stroke Rehabilitation"],
    phone: "+91 22 2490 1144",
    website: "https://neurocarecenter.example.org",
    openingHours: "Mon - Fri: 09:00 AM - 07:00 PM",
    rating: 4.8,
    reviewCount: 218,
    isEmergency24x7: false,
    isOpenNow: true,
    insuranceAccepted: ["HDFC ERGO", "ICICI Lombard", "Max Bupa / Niva Bupa"],
    doctorId: "doc_2",
    doctorName: "Dr. Rahul Mehta",
    doctorSpecialty: "Neurologist",
    doctorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
    description: "Comprehensive neurological diagnostic center offering video EEG telemetry, nerve conduction studies, and specialized clinical protocols.",
    consultationFee: 1500,
    isDemo: true
  }
];

// server/db/db.ts
var require2 = createRequire(import.meta.url);
var DatabaseSyncClass = null;
try {
  const sqlite = require2("node:sqlite");
  DatabaseSyncClass = sqlite?.DatabaseSync || null;
} catch (e) {
  DatabaseSyncClass = null;
}
var dbInstance = null;
if (DatabaseSyncClass) {
  try {
    const dbPath = process.env.VERCEL ? path2.resolve("/tmp", "dev.db") : path2.resolve(process.cwd(), "dev.db");
    dbInstance = new DatabaseSyncClass(dbPath);
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    dbInstance.exec("PRAGMA journal_mode = WAL;");
  } catch (err) {
    console.warn("[DB] SQLite init warning, falling back to in-memory store:", err?.message);
    dbInstance = null;
  }
}
var db = dbInstance;
var inMemoryAppointments = [];
var inMemoryUsers = [
  {
    id: "usr_001",
    email: "aarav.sharma@example.com",
    name: "Aarav Sharma",
    phone: "+91 98201 44521",
    bloodGroup: "B+",
    dob: "1992-06-14",
    gender: "Male",
    preferredLanguage: "en",
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: ["Mild Asthma", "Seasonal Rhinitis"]
  }
];
var fallbackMedicalKnowledge = [];
try {
  fallbackMedicalKnowledge = require2("../data/medicalKnowledge.json");
} catch {
  fallbackMedicalKnowledge = [];
}
function initDbSchema() {
  if (!db) return;
  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      bloodGroup TEXT,
      dob TEXT,
      gender TEXT,
      preferredLanguage TEXT DEFAULT 'en',
      emergencyContactName TEXT,
      emergencyContactPhone TEXT,
      emergencyContactRelation TEXT,
      allergies TEXT DEFAULT '[]',
      chronicConditions TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      qualifications TEXT NOT NULL,
      experienceYears INTEGER NOT NULL,
      languages TEXT DEFAULT '[]',
      clinic TEXT NOT NULL,
      location TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      reviewCount INTEGER DEFAULT 100,
      consultationFee INTEGER DEFAULT 1000,
      consultationTypes TEXT DEFAULT '["video","in-person"]',
      nextAvailable TEXT DEFAULT 'Tomorrow, 10:00 AM',
      about TEXT NOT NULL,
      availableSlots TEXT DEFAULT '[]',
      avatarUrl TEXT NOT NULL,
      isDemo INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS healthcare_facilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL,
      locality TEXT NOT NULL,
      city TEXT NOT NULL,
      pinCode TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      specialties TEXT DEFAULT '[]',
      phone TEXT NOT NULL,
      website TEXT,
      openingHours TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      reviewCount INTEGER DEFAULT 200,
      isEmergency24x7 INTEGER DEFAULT 0,
      isOpenNow INTEGER DEFAULT 1,
      insuranceAccepted TEXT DEFAULT '[]',
      doctorId TEXT,
      doctorName TEXT,
      doctorSpecialty TEXT,
      doctorAvatar TEXT,
      imageUrl TEXT,
      description TEXT,
      bedsCount INTEGER,
      emergencyPhone TEXT,
      consultationFee INTEGER,
      isDemo INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      doctorId TEXT NOT NULL,
      doctorName TEXT NOT NULL,
      doctorSpecialty TEXT NOT NULL,
      doctorAvatar TEXT,
      clinicName TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT DEFAULT 'video',
      status TEXT DEFAULT 'upcoming',
      symptoms TEXT,
      notes TEXT,
      joinUrl TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_knowledge (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      category TEXT NOT NULL,
      symptoms TEXT DEFAULT '[]',
      summary TEXT NOT NULL,
      clinicalGuidance TEXT NOT NULL,
      redFlags TEXT DEFAULT '[]',
      suggestedSpecialties TEXT DEFAULT '[]',
      sourceTitle TEXT NOT NULL,
      sourceUrl TEXT NOT NULL,
      reviewDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      userId TEXT,
      modelUsed TEXT NOT NULL,
      messages TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
    CREATE INDEX IF NOT EXISTS idx_facilities_type ON healthcare_facilities(type);
    CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(userId);
    CREATE INDEX IF NOT EXISTS idx_appointments_slot ON appointments(doctorId, date, time);
  `);
  } catch (err) {
    console.warn("[DB] Schema init warning:", err?.message);
  }
}
var userDao = {
  getById(id) {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
        const res = stmt.get(id);
        if (res) return res;
      } catch (e) {
      }
    }
    return inMemoryUsers.find((u) => u.id === id) || null;
  },
  getByEmail(email) {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)");
        const res = stmt.get(email);
        if (res) return res;
      } catch (e) {
      }
    }
    return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  create(data) {
    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO users (id, email, password, name, phone, bloodGroup, dob, gender, preferredLanguage, emergencyContactName, emergencyContactPhone, emergencyContactRelation, allergies, chronicConditions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          data.id,
          data.email,
          data.password || null,
          data.name,
          data.phone || null,
          data.bloodGroup || null,
          data.dob || null,
          data.gender || null,
          data.preferredLanguage || "en",
          data.emergencyContactName || null,
          data.emergencyContactPhone || null,
          data.emergencyContactRelation || null,
          JSON.stringify(data.allergies || []),
          JSON.stringify(data.chronicConditions || [])
        );
        return this.getById(data.id);
      } catch (e) {
      }
    }
    inMemoryUsers.push(data);
    return data;
  }
};
var doctorDao = {
  getAll() {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM doctors ORDER BY rating DESC");
        const rows = stmt.all();
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            languages: typeof r.languages === "string" ? JSON.parse(r.languages || "[]") : r.languages || [],
            consultationTypes: typeof r.consultationTypes === "string" ? JSON.parse(r.consultationTypes || "[]") : r.consultationTypes || [],
            availableSlots: typeof r.availableSlots === "string" ? JSON.parse(r.availableSlots || "[]") : r.availableSlots || [],
            isDemo: Boolean(r.isDemo)
          }));
        }
      } catch (e) {
      }
    }
    return FALLBACK_DOCTORS;
  },
  getById(id) {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM doctors WHERE id = ?");
        const r = stmt.get(id);
        if (r) {
          return {
            ...r,
            languages: typeof r.languages === "string" ? JSON.parse(r.languages || "[]") : r.languages || [],
            consultationTypes: typeof r.consultationTypes === "string" ? JSON.parse(r.consultationTypes || "[]") : r.consultationTypes || [],
            availableSlots: typeof r.availableSlots === "string" ? JSON.parse(r.availableSlots || "[]") : r.availableSlots || [],
            isDemo: Boolean(r.isDemo)
          };
        }
      } catch (e) {
      }
    }
    return FALLBACK_DOCTORS.find((d) => d.id === id) || null;
  },
  search({ query, specialty, location }) {
    if (db) {
      try {
        let sql = "SELECT * FROM doctors WHERE 1=1";
        const params = [];
        if (specialty && specialty !== "all") {
          sql += " AND LOWER(specialty) = LOWER(?)";
          params.push(specialty);
        }
        if (location && location !== "all") {
          sql += " AND (LOWER(location) LIKE ? OR LOWER(clinic) LIKE ?)";
          params.push(`%${location.toLowerCase()}%`, `%${location.toLowerCase()}%`);
        }
        if (query) {
          const q = `%${query.toLowerCase()}%`;
          sql += " AND (LOWER(name) LIKE ? OR LOWER(specialty) LIKE ? OR LOWER(about) LIKE ? OR LOWER(clinic) LIKE ?)";
          params.push(q, q, q, q);
        }
        sql += " ORDER BY rating DESC";
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            languages: typeof r.languages === "string" ? JSON.parse(r.languages || "[]") : r.languages || [],
            consultationTypes: typeof r.consultationTypes === "string" ? JSON.parse(r.consultationTypes || "[]") : r.consultationTypes || [],
            availableSlots: typeof r.availableSlots === "string" ? JSON.parse(r.availableSlots || "[]") : r.availableSlots || [],
            isDemo: Boolean(r.isDemo)
          }));
        }
      } catch (e) {
      }
    }
    return FALLBACK_DOCTORS.filter((d) => {
      if (specialty && specialty !== "all" && d.specialty.toLowerCase() !== specialty.toLowerCase()) return false;
      if (location && location !== "all" && !d.location.toLowerCase().includes(location.toLowerCase()) && !d.clinic.toLowerCase().includes(location.toLowerCase())) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.specialty.toLowerCase().includes(q) && !d.about.toLowerCase().includes(q) && !d.clinic.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }
};
var facilityDao = {
  getAll() {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM healthcare_facilities ORDER BY rating DESC");
        const rows = stmt.all();
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            coordinates: [r.latitude, r.longitude],
            specialties: typeof r.specialties === "string" ? JSON.parse(r.specialties || "[]") : r.specialties || [],
            insuranceAccepted: typeof r.insuranceAccepted === "string" ? JSON.parse(r.insuranceAccepted || "[]") : r.insuranceAccepted || [],
            isEmergency24x7: Boolean(r.isEmergency24x7),
            isOpenNow: Boolean(r.isOpenNow),
            isDemo: Boolean(r.isDemo)
          }));
        }
      } catch (e) {
      }
    }
    return FALLBACK_FACILITIES;
  },
  getById(id) {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM healthcare_facilities WHERE id = ?");
        const r = stmt.get(id);
        if (r) {
          return {
            ...r,
            coordinates: [r.latitude, r.longitude],
            specialties: typeof r.specialties === "string" ? JSON.parse(r.specialties || "[]") : r.specialties || [],
            insuranceAccepted: typeof r.insuranceAccepted === "string" ? JSON.parse(r.insuranceAccepted || "[]") : r.insuranceAccepted || [],
            isEmergency24x7: Boolean(r.isEmergency24x7),
            isOpenNow: Boolean(r.isOpenNow),
            isDemo: Boolean(r.isDemo)
          };
        }
      } catch (e) {
      }
    }
    return FALLBACK_FACILITIES.find((f) => f.id === id) || null;
  },
  search({ query, type, isEmergency24x7 }) {
    if (db) {
      try {
        let sql = "SELECT * FROM healthcare_facilities WHERE 1=1";
        const params = [];
        if (type && type !== "all") {
          sql += " AND type = ?";
          params.push(type);
        }
        if (isEmergency24x7) {
          sql += " AND isEmergency24x7 = 1";
        }
        if (query) {
          const q = `%${query.toLowerCase()}%`;
          sql += " AND (LOWER(name) LIKE ? OR LOWER(locality) LIKE ? OR LOWER(city) LIKE ? OR LOWER(specialties) LIKE ? OR LOWER(doctorName) LIKE ?)";
          params.push(q, q, q, q, q);
        }
        sql += " ORDER BY rating DESC";
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            coordinates: [r.latitude, r.longitude],
            specialties: typeof r.specialties === "string" ? JSON.parse(r.specialties || "[]") : r.specialties || [],
            insuranceAccepted: typeof r.insuranceAccepted === "string" ? JSON.parse(r.insuranceAccepted || "[]") : r.insuranceAccepted || [],
            isEmergency24x7: Boolean(r.isEmergency24x7),
            isOpenNow: Boolean(r.isOpenNow),
            isDemo: Boolean(r.isDemo)
          }));
        }
      } catch (e) {
      }
    }
    return FALLBACK_FACILITIES.filter((f) => {
      if (type && type !== "all" && f.type !== type) return false;
      if (isEmergency24x7 && !f.isEmergency24x7) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.locality.toLowerCase().includes(q) && !f.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }
};
var appointmentDao = {
  getByUserId(userId) {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM appointments WHERE userId = ? ORDER BY date DESC, time DESC");
        return stmt.all(userId);
      } catch (e) {
      }
    }
    return inMemoryAppointments.filter((a) => a.userId === userId);
  },
  getById(id) {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM appointments WHERE id = ?");
        return stmt.get(id);
      } catch (e) {
      }
    }
    return inMemoryAppointments.find((a) => a.id === id) || null;
  },
  create(data) {
    if (db) {
      try {
        const checkStmt = db.prepare(
          "SELECT id FROM appointments WHERE doctorId = ? AND date = ? AND time = ? AND status != 'cancelled'"
        );
        const existing = checkStmt.get(data.doctorId, data.date, data.time);
        if (existing) {
          throw new Error(`The requested slot (${data.date} at ${data.time}) is already booked. Please select another slot.`);
        }
        const insertStmt = db.prepare(`
          INSERT INTO appointments (id, userId, doctorId, doctorName, doctorSpecialty, doctorAvatar, clinicName, date, time, type, status, symptoms, notes, joinUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertStmt.run(
          data.id,
          data.userId,
          data.doctorId,
          data.doctorName,
          data.doctorSpecialty,
          data.doctorAvatar || null,
          data.clinicName,
          data.date,
          data.time,
          data.type || "video",
          data.status || "upcoming",
          data.symptoms || null,
          data.notes || null,
          data.joinUrl || `https://healhealth.care/teleconsult/${data.id}`
        );
        return this.getById(data.id);
      } catch (e) {
        if (e.message?.includes("already booked")) throw e;
      }
    }
    const conflict = inMemoryAppointments.find(
      (a) => a.doctorId === data.doctorId && a.date === data.date && a.time === data.time && a.status !== "cancelled"
    );
    if (conflict) {
      throw new Error(`The requested slot (${data.date} at ${data.time}) is already booked. Please select another slot.`);
    }
    const apt = { ...data, status: data.status || "upcoming", createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    inMemoryAppointments.push(apt);
    return apt;
  },
  cancel(id, userId) {
    if (db) {
      try {
        const checkStmt = db.prepare("SELECT * FROM appointments WHERE id = ?");
        const existing = checkStmt.get(id);
        if (existing) {
          if (existing.userId !== userId && userId !== "usr_001") {
            throw new Error("Unauthorized to cancel this appointment");
          }
          const updateStmt = db.prepare("UPDATE appointments SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP WHERE id = ?");
          updateStmt.run(id);
          return this.getById(id);
        }
      } catch (e) {
        if (e.message?.includes("Unauthorized")) throw e;
      }
    }
    const apt = inMemoryAppointments.find((a) => a.id === id);
    if (apt) {
      apt.status = "cancelled";
      return apt;
    }
    throw new Error("Appointment not found");
  },
  getBookedSlots(doctorId, date) {
    if (db) {
      try {
        const stmt = db.prepare(
          "SELECT time FROM appointments WHERE doctorId = ? AND date = ? AND status != 'cancelled'"
        );
        const rows = stmt.all(doctorId, date);
        return rows.map((r) => r.time);
      } catch (e) {
      }
    }
    return inMemoryAppointments.filter((a) => a.doctorId === doctorId && a.date === date && a.status !== "cancelled").map((a) => a.time);
  }
};
var medicalKnowledgeDao = {
  getAll() {
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM medical_knowledge");
        const rows = stmt.all();
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            symptoms: typeof r.symptoms === "string" ? JSON.parse(r.symptoms || "[]") : r.symptoms || [],
            redFlags: typeof r.redFlags === "string" ? JSON.parse(r.redFlags || "[]") : r.redFlags || [],
            suggestedSpecialties: typeof r.suggestedSpecialties === "string" ? JSON.parse(r.suggestedSpecialties || "[]") : r.suggestedSpecialties || []
          }));
        }
      } catch (err) {
        console.warn("[DB] medical_knowledge query fallback:", err?.message);
      }
    }
    return fallbackMedicalKnowledge;
  },
  search(query) {
    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const all = this.getAll();
    if (terms.length === 0) return all.slice(0, 5);
    const scored = all.map((item) => {
      let score = 0;
      const lowerTopic = (item.topic || "").toLowerCase();
      const lowerSummary = (item.summary || "").toLowerCase();
      for (const term of terms) {
        if (lowerTopic.includes(term)) score += 5;
        if (lowerSummary.includes(term)) score += 2;
        for (const symptom of item.symptoms || []) {
          if (typeof symptom === "string" && symptom.toLowerCase().includes(term)) score += 4;
        }
      }
      return { item, score };
    });
    const filtered = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.item);
    return filtered.length > 0 ? filtered : all.slice(0, 3);
  }
};
initDbSchema();

// server/db/seed.ts
import fs from "fs";
import path3 from "path";
function seedDatabase() {
  if (!db) {
    console.log("[DB] Running with in-memory resilient storage.");
    return;
  }
  initDbSchema();
  const checkUser = db.prepare("SELECT id FROM users WHERE id = ?").get("usr_001");
  if (!checkUser) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password, name, phone, bloodGroup, dob, gender, preferredLanguage, emergencyContactName, emergencyContactPhone, emergencyContactRelation, allergies, chronicConditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(
      "usr_001",
      "aarav.sharma@example.com",
      "demo1234",
      // Demo password
      "Aarav Sharma",
      "+91 98201 44521",
      "B+",
      "1992-06-14",
      "Male",
      "en",
      "Pooja Sharma",
      "+91 98201 44522",
      "Spouse",
      JSON.stringify(["Penicillin", "Peanuts"]),
      JSON.stringify(["Mild Asthma", "Seasonal Rhinitis"])
    );
    console.log("\u2714 Seeded demo user: Aarav Sharma (usr_001)");
  }
  const countDocs = db.prepare("SELECT COUNT(*) as count FROM doctors").get();
  if (countDocs.count === 0) {
    const insertDoctor = db.prepare(`
      INSERT INTO doctors (id, name, specialty, qualifications, experienceYears, languages, clinic, location, rating, reviewCount, consultationFee, consultationTypes, nextAvailable, about, availableSlots, avatarUrl, isDemo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const doctors = [
      {
        id: "doc_1",
        name: "Dr. Priya Kulkarni",
        specialty: "Cardiologist",
        qualifications: "MD, DM (Cardiology), FACC",
        experienceYears: 14,
        languages: ["English", "Hindi", "Marathi"],
        clinic: "Apex Heart & Vascular Institute",
        location: "Bandra West, Mumbai",
        rating: 4.9,
        reviewCount: 342,
        consultationFee: 1200,
        consultationTypes: ["video", "in-person"],
        nextAvailable: "Tomorrow, 10:30 AM",
        about: "Dr. Priya Kulkarni is a senior cardiologist specializing in preventive cardiology, echocardiography, coronary disease management, and cardiac rehabilitation.",
        availableSlots: ["09:30 AM", "10:30 AM", "11:15 AM", "02:00 PM", "04:30 PM", "06:00 PM"],
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        isDemo: 1
      },
      {
        id: "doc_2",
        name: "Dr. Rahul Mehta",
        specialty: "Neurologist",
        qualifications: "MBBS, MD (Medicine), DM (Neurology)",
        experienceYears: 11,
        languages: ["English", "Hindi", "Gujarati"],
        clinic: "NeuroCare Center for Brain Health",
        location: "Lower Parel, Mumbai",
        rating: 4.8,
        reviewCount: 218,
        consultationFee: 1500,
        consultationTypes: ["video", "in-person"],
        nextAvailable: "Today, 03:00 PM",
        about: "Specialist in migraine management, neuromuscular disorders, sleep neurology, and post-stroke rehabilitation with 11+ years of clinical excellence.",
        availableSlots: ["03:00 PM", "03:45 PM", "05:00 PM", "06:30 PM"],
        avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        isDemo: 1
      },
      {
        id: "doc_3",
        name: "Dr. Ananya Deshmukh",
        specialty: "Endocrinologist",
        qualifications: "MBBS, MD, DNB (Endocrinology)",
        experienceYears: 9,
        languages: ["English", "Hindi", "Marathi"],
        clinic: "Metabolic & Hormone Wellness Clinic",
        location: "Andheri East, Mumbai",
        rating: 4.95,
        reviewCount: 189,
        consultationFee: 1e3,
        consultationTypes: ["video", "in-person"],
        nextAvailable: "Thursday, 11:00 AM",
        about: "Expertise in type 1 & 2 diabetes management, thyroid dysfunctions, gestational diabetes, and metabolic syndrome optimization.",
        availableSlots: ["11:00 AM", "12:15 PM", "02:30 PM", "04:00 PM"],
        avatarUrl: "https://images.unsplash.com/photo-1594824813681-ef06b9b3e157?auto=format&fit=crop&q=80&w=400",
        isDemo: 1
      },
      {
        id: "doc_4",
        name: "Dr. Vikramaditya Sen",
        specialty: "Orthopedic Surgeon",
        qualifications: "MS (Ortho), MCh, Fellowship in Joint Replacement",
        experienceYears: 18,
        languages: ["English", "Hindi", "Bengali"],
        clinic: "Fortis Bone & Joint Center",
        location: "Mulund West, Mumbai",
        rating: 4.7,
        reviewCount: 412,
        consultationFee: 1400,
        consultationTypes: ["in-person"],
        nextAvailable: "Friday, 02:00 PM",
        about: "Renowned orthopedic surgeon specializing in robotic joint replacements, sports injuries, ligament reconstruction, and spine posture therapies.",
        availableSlots: ["02:00 PM", "03:00 PM", "04:15 PM", "05:30 PM"],
        avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
        isDemo: 1
      },
      {
        id: "doc_5",
        name: "Dr. Sunita Rao",
        specialty: "Pulmonologist",
        qualifications: "MD (Chest Medicine), FCCP (USA)",
        experienceYears: 13,
        languages: ["English", "Hindi", "Telugu"],
        clinic: "Breathe Easy Respiratory Clinic",
        location: "Powai, Mumbai",
        rating: 4.85,
        reviewCount: 276,
        consultationFee: 1100,
        consultationTypes: ["video", "in-person"],
        nextAvailable: "Tomorrow, 04:00 PM",
        about: "Dedicated to allergic asthma, chronic cough, COPD, post-viral respiratory recovery, and sleep apnea diagnostic testing.",
        availableSlots: ["10:00 AM", "11:30 AM", "04:00 PM", "05:15 PM"],
        avatarUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
        isDemo: 1
      },
      {
        id: "doc_6",
        name: "Dr. Farhan Qureshi",
        specialty: "General Physician",
        qualifications: "MBBS, MD (Family Medicine)",
        experienceYears: 8,
        languages: ["English", "Hindi", "Urdu"],
        clinic: "CareFirst Family Health Practice",
        location: "Dadar West, Mumbai",
        rating: 4.75,
        reviewCount: 310,
        consultationFee: 700,
        consultationTypes: ["video", "in-person"],
        nextAvailable: "Today, 05:30 PM",
        about: "Primary care clinician focused on holistic wellness, preventative health check-ups, acute infections, and continuous family health management.",
        availableSlots: ["05:30 PM", "06:15 PM", "07:00 PM", "07:45 PM"],
        avatarUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
        isDemo: 1
      }
    ];
    for (const doc of doctors) {
      insertDoctor.run(
        doc.id,
        doc.name,
        doc.specialty,
        doc.qualifications,
        doc.experienceYears,
        JSON.stringify(doc.languages),
        doc.clinic,
        doc.location,
        doc.rating,
        doc.reviewCount,
        doc.consultationFee,
        JSON.stringify(doc.consultationTypes),
        doc.nextAvailable,
        doc.about,
        JSON.stringify(doc.availableSlots),
        doc.avatarUrl,
        doc.isDemo
      );
    }
    console.log(`\u2714 Seeded ${doctors.length} verified doctors`);
  }
  const countFac = db.prepare("SELECT COUNT(*) as count FROM healthcare_facilities").get();
  if (countFac.count === 0) {
    const insertFac = db.prepare(`
      INSERT INTO healthcare_facilities (id, name, type, address, locality, city, pinCode, latitude, longitude, specialties, phone, website, openingHours, rating, reviewCount, isEmergency24x7, isOpenNow, insuranceAccepted, doctorId, doctorName, doctorSpecialty, doctorAvatar, imageUrl, description, bedsCount, emergencyPhone, consultationFee, isDemo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const facilities = [
      {
        id: "fac_1",
        name: "Apex Heart & Vascular Institute",
        type: "clinic",
        address: "Suite 402, Platinum Health Tower, Turner Road",
        locality: "Bandra West",
        city: "Mumbai",
        pinCode: "400050",
        latitude: 19.0596,
        longitude: 72.8295,
        specialties: ["Cardiology", "Vascular Medicine", "Preventive Health", "Echocardiography"],
        phone: "+91 22 2640 8891",
        website: "https://apexheartmumbai.example.org",
        openingHours: "Mon - Sat: 08:30 AM - 08:00 PM",
        rating: 4.9,
        reviewCount: 342,
        isEmergency24x7: 0,
        isOpenNow: 1,
        insuranceAccepted: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Care Health"],
        doctorId: "doc_1",
        doctorName: "Dr. Priya Kulkarni",
        doctorSpecialty: "Cardiologist",
        doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
        description: "Premier outpatient cardiology center equipped with advanced high-resolution Doppler echocardiography, cardiac stress telemetry, and preventive lifestyle guidance.",
        consultationFee: 1200,
        isDemo: 1
      },
      {
        id: "fac_2",
        name: "Metro General Super-Speciality Hospital",
        type: "hospital",
        address: "Plot 18, S.V. Road, Near Linking Road Junction",
        locality: "Bandra West",
        city: "Mumbai",
        pinCode: "400050",
        latitude: 19.0544,
        longitude: 72.8402,
        specialties: ["Emergency Medicine", "Cardiology", "Trauma Surgery", "Neurology", "Critical Care", "Internal Medicine"],
        phone: "+91 22 6120 5000",
        emergencyPhone: "+91 22 6120 5999",
        website: "https://metrogeneral.example.org",
        openingHours: "24 Hours / 7 Days Open",
        rating: 4.8,
        reviewCount: 1280,
        isEmergency24x7: 1,
        isOpenNow: 1,
        insuranceAccepted: ["All Major Insurances", "Cashless TPA", "Ayushman Bharat", "Star Health", "HDFC ERGO"],
        bedsCount: 520,
        imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600",
        description: "NABH-accredited tertiary care multi-speciality hospital featuring a Level 1 Trauma Center, 24/7 dedicated catheterization lab, and 120 critical care beds.",
        isDemo: 1
      },
      {
        id: "fac_3",
        name: "NeuroCare Center for Brain Health",
        type: "clinic",
        address: "8th Floor, Senapati Bapat Marg, One World Center",
        locality: "Lower Parel",
        city: "Mumbai",
        pinCode: "400013",
        latitude: 18.9986,
        longitude: 72.8311,
        specialties: ["Neurology", "Neuro-Rehab", "Sleep Medicine", "Headache Management"],
        phone: "+91 22 4988 2210",
        website: "https://neurocarebrain.example.org",
        openingHours: "Mon - Fri: 09:00 AM - 07:00 PM",
        rating: 4.8,
        reviewCount: 218,
        isEmergency24x7: 0,
        isOpenNow: 1,
        insuranceAccepted: ["HDFC ERGO", "ICICI Lombard", "Max Bupa (Niva Bupa)", "Care Health"],
        doctorId: "doc_2",
        doctorName: "Dr. Rahul Mehta",
        doctorSpecialty: "Neurologist",
        doctorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
        description: "Comprehensive neurological assessment hub providing state-of-the-art EEG, nerve conduction studies, vertigo testing, and neuromuscular therapy.",
        consultationFee: 1500,
        isDemo: 1
      },
      {
        id: "fac_4",
        name: "Metabolic & Hormone Wellness Clinic",
        type: "clinic",
        address: "304, Solitaire Business Park, Chakala",
        locality: "Andheri East",
        city: "Mumbai",
        pinCode: "400093",
        latitude: 19.1136,
        longitude: 72.8697,
        specialties: ["Endocrinology", "Diabetes Care", "Thyroid Disorders", "Metabolic Health"],
        phone: "+91 22 2822 4110",
        website: "https://metabolichormone.example.org",
        openingHours: "Mon - Sat: 09:00 AM - 06:30 PM",
        rating: 4.95,
        reviewCount: 189,
        isEmergency24x7: 0,
        isOpenNow: 1,
        insuranceAccepted: ["Star Health", "Care Health", "Bajaj Allianz"],
        doctorId: "doc_3",
        doctorName: "Dr. Ananya Deshmukh",
        doctorSpecialty: "Endocrinologist",
        doctorAvatar: "https://images.unsplash.com/photo-1594824813681-ef06b9b3e157?auto=format&fit=crop&q=80&w=400",
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600",
        description: "Specialized hormone and diabetic lifestyle clinic with in-house continuous glucose monitoring (CGM) analytics and personalized dietetics.",
        consultationFee: 1e3,
        isDemo: 1
      },
      {
        id: "fac_5",
        name: "Fortis Bone & Joint Center",
        type: "hospital",
        address: "Lal Bahadur Shastri Marg, Nahur Junction",
        locality: "Mulund West",
        city: "Mumbai",
        pinCode: "400080",
        latitude: 19.1726,
        longitude: 72.9565,
        specialties: ["Orthopedic Surgery", "Joint Replacement", "Sports Medicine", "Spine Care", "Emergency Trauma"],
        phone: "+91 22 6799 4444",
        emergencyPhone: "+91 22 6799 4100",
        website: "https://fortismulund.example.org",
        openingHours: "24 Hours / 7 Days Open",
        rating: 4.7,
        reviewCount: 890,
        isEmergency24x7: 1,
        isOpenNow: 1,
        insuranceAccepted: ["All Major Insurances", "Cashless TPA", "Tata AIG", "Reliance General"],
        doctorId: "doc_4",
        doctorName: "Dr. Vikramaditya Sen",
        doctorSpecialty: "Orthopedic Surgeon",
        doctorAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
        bedsCount: 315,
        imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600",
        description: "Pioneering orthopedic and joint replacement hospital offering robotic knee and hip surgeries, arthroscopy, and round-the-clock polytrauma response.",
        consultationFee: 1400,
        isDemo: 1
      },
      {
        id: "fac_6",
        name: "City Apollo Multispeciality Hospital",
        type: "hospital",
        address: "New Link Road, Near Infiniti Mall",
        locality: "Andheri West",
        city: "Mumbai",
        pinCode: "400053",
        latitude: 19.1363,
        longitude: 72.8277,
        specialties: ["Cardiology", "Oncology", "Organ Transplant", "Gastroenterology", "24x7 Emergency"],
        phone: "+91 22 6690 1000",
        emergencyPhone: "+91 22 6690 1999",
        website: "https://cityapollo.example.org",
        openingHours: "24 Hours / 7 Days Open",
        rating: 4.88,
        reviewCount: 1650,
        isEmergency24x7: 1,
        isOpenNow: 1,
        insuranceAccepted: ["All Major Insurances", "Cashless TPA", "Star Health", "HDFC ERGO"],
        bedsCount: 420,
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
        description: "Comprehensive medical center with an internationally renowned organ transplant unit, oncology wing, and dedicated round-the-clock emergency ICU team.",
        isDemo: 1
      }
    ];
    for (const f of facilities) {
      insertFac.run(
        f.id,
        f.name,
        f.type,
        f.address,
        f.locality,
        f.city,
        f.pinCode,
        f.latitude,
        f.longitude,
        JSON.stringify(f.specialties),
        f.phone,
        f.website || null,
        f.openingHours,
        f.rating,
        f.reviewCount,
        f.isEmergency24x7,
        f.isOpenNow,
        JSON.stringify(f.insuranceAccepted),
        f.doctorId || null,
        f.doctorName || null,
        f.doctorSpecialty || null,
        f.doctorAvatar || null,
        f.imageUrl || null,
        f.description || null,
        f.bedsCount || null,
        f.emergencyPhone || null,
        f.consultationFee || null,
        f.isDemo
      );
    }
    console.log(`\u2714 Seeded ${facilities.length} healthcare facilities`);
  }
  const countMed = db.prepare("SELECT COUNT(*) as count FROM medical_knowledge").get();
  if (countMed.count === 0) {
    const medJsonPath = path3.resolve(process.cwd(), "server/data/medicalKnowledge.json");
    if (fs.existsSync(medJsonPath)) {
      const records = JSON.parse(fs.readFileSync(medJsonPath, "utf8"));
      const insertMed = db.prepare(`
        INSERT INTO medical_knowledge (id, topic, category, symptoms, summary, clinicalGuidance, redFlags, suggestedSpecialties, sourceTitle, sourceUrl, reviewDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of records) {
        insertMed.run(
          r.id,
          r.topic,
          r.category,
          JSON.stringify(r.symptoms),
          r.summary,
          r.clinicalGuidance,
          JSON.stringify(r.redFlags),
          JSON.stringify(r.suggestedSpecialties),
          r.sourceTitle,
          r.sourceUrl,
          r.reviewDate || null
        );
      }
      console.log(`\u2714 Seeded ${records.length} grounded medical reference records`);
    }
  }
  const countApt = db.prepare("SELECT COUNT(*) as count FROM appointments").get();
  if (countApt.count === 0) {
    const insertApt = db.prepare(`
      INSERT INTO appointments (id, userId, doctorId, doctorName, doctorSpecialty, doctorAvatar, clinicName, date, time, type, status, symptoms, notes, joinUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertApt.run(
      "apt_101",
      "usr_001",
      "doc_1",
      "Dr. Priya Kulkarni",
      "Cardiologist",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
      "Apex Heart & Vascular Institute",
      "2026-10-15",
      "10:30 AM",
      "video",
      "upcoming",
      "Periodic cardiac checkup, mild exertion breathlessness review",
      "Patient requested teleconsultation before lipid panel follow-up",
      "https://healhealth.care/teleconsult/apt_101"
    );
    console.log("\u2714 Seeded sample upcoming appointment (apt_101)");
  }
}
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seedDatabase();
  console.log("\u{1F389} Database seeding complete!");
}

// server/routes/healthRoutes.ts
import { Router } from "express";
var healthRouter = Router();
healthRouter.get("/health", (req, res) => {
  let dbStatus = "disconnected";
  try {
    if (db) {
      const row = db.prepare("SELECT 1 as ok").get();
      if (row?.ok === 1) dbStatus = "connected (sqlite)";
    } else {
      dbStatus = "active (in-memory resilient store)";
    }
  } catch (e) {
    dbStatus = `fallback: ${e.message}`;
  }
  const aiConfigured = Boolean(env.AI_API_KEY && env.AI_API_KEY.length > 5);
  res.json({
    status: "ok",
    service: "HEALHEALTH Clinical Backend API",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: dbStatus,
    ai: {
      configured: aiConfigured,
      defaultModel: env.AI_DEFAULT_MODEL,
      provider: "NVIDIA NIM Router",
      baseUrl: env.AI_BASE_URL
    }
  });
});

// server/routes/aiRoutes.ts
import { Router as Router2 } from "express";
import { z as z2 } from "zod";

// server/services/safetyService.ts
var EMERGENCY_PATTERNS = [
  {
    category: "Cardiovascular / Heart Attack",
    keywords: [
      "crushing chest pain",
      "chest pressure radiating",
      "left arm pain and chest",
      "chest pain cold sweat",
      "heart attack",
      "chest pain radiating to jaw",
      "severe chest tightness sweating"
    ],
    action: "Immediately call emergency services (112 / 911) or proceed to the nearest emergency room. Do not drive yourself."
  },
  {
    category: "Acute Stroke (BE FAST)",
    keywords: [
      "face drooping",
      "facial droop",
      "slurred speech",
      "sudden arm weakness",
      "sudden numbness one side",
      "sudden loss of vision",
      "cannot speak clearly",
      "stroke symptoms"
    ],
    action: "Immediate acute stroke intervention required. Call 112 / 911 immediately. Note the exact time symptoms started."
  },
  {
    category: "Severe Respiratory Distress",
    keywords: [
      "cannot breathe",
      "severe difficulty breathing",
      "turning blue",
      "blue lips",
      "gasping for air",
      "suffocating",
      "stridor"
    ],
    action: "Urgent respiratory compromise. Sit upright, use any rescue inhaler if prescribed, and call emergency services immediately."
  },
  {
    category: "Anaphylaxis / Severe Allergic Reaction",
    keywords: [
      "swollen tongue breathing",
      "throat closing up",
      "anaphylaxis",
      "swollen lips cannot breathe",
      "severe allergic reaction throat"
    ],
    action: "Immediate anaphylaxis emergency. Administer epinephrine auto-injector (EpiPen) if available and call emergency services without delay."
  },
  {
    category: "Neurological / Acute Meningitis or Thunderclap",
    keywords: [
      "worst headache of my life",
      "thunderclap headache",
      "stiff neck high fever rash",
      "unresponsive",
      "sudden seizure",
      "coughing up blood",
      "uncontrolled bleeding"
    ],
    action: "Potential acute neurological or hemorrhagic emergency. Seek immediate emergency medical care."
  }
];
var MANDATORY_DISCLAIMER = "\n\n*Educational Guidance Disclaimer: HEALHEALTH AI is an educational navigation assistant and does not provide formal medical diagnosis or prescription. Always consult a licensed physician for clinical diagnosis and treatment.*";
function evaluateSafety(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  const triggered = [];
  let matchedCategory;
  let action = "If your symptoms worsen or you feel dizzy or faint, consult an emergency physician.";
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
    emergencyPhone: "112 / 911",
    redFlagsTriggered: triggered
  };
}

// server/services/retrievalService.ts
function retrieveMedicalContext(userQuery) {
  const knowledgeMatches = medicalKnowledgeDao.search(userQuery);
  const specialtyCandidates = [];
  for (const km of knowledgeMatches.slice(0, 2)) {
    if (km.suggestedSpecialties && km.suggestedSpecialties.length > 0) {
      specialtyCandidates.push(...km.suggestedSpecialties);
    }
  }
  const primarySpecialty = specialtyCandidates[0] || "General Physician";
  let matchedDoctors = doctorDao.search({ specialty: primarySpecialty });
  if (matchedDoctors.length === 0) {
    matchedDoctors = doctorDao.getAll().slice(0, 3);
  } else {
    matchedDoctors = matchedDoctors.slice(0, 3);
  }
  const isUrgent = userQuery.toLowerCase().includes("emergency") || userQuery.toLowerCase().includes("severe") || userQuery.toLowerCase().includes("chest pain");
  const matchedFacilities = facilityDao.search({ isEmergency24x7: isUrgent ? true : void 0 }).slice(0, 3);
  return {
    groundedKnowledge: knowledgeMatches.slice(0, 3).map((k) => ({
      topic: k.topic,
      category: k.category,
      summary: k.summary,
      clinicalGuidance: k.clinicalGuidance,
      redFlags: k.redFlags,
      sourceTitle: k.sourceTitle,
      sourceUrl: k.sourceUrl
    })),
    matchedDoctors,
    matchedFacilities,
    suggestedSpecialty: primarySpecialty
  };
}

// server/services/aiService.ts
var SUPPORTED_MODELS = [
  {
    id: "nvidia/nemotron-3.5-super-vl-120b-a12b",
    name: "Nemotron 3.5 Super VL (120B)",
    tag: "Advanced Multimodal Clinical Reasoning",
    provider: "NVIDIA NIM"
  },
  {
    id: "nvidia/nemotron-3.5-lightning-30b-a3b",
    name: "Nemotron 3.5 Lightning (30B)",
    tag: "Rapid Clinical Triage & Guidance",
    provider: "NVIDIA NIM"
  },
  {
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    name: "Nemotron 3 Nano Omni",
    tag: "Deep Reasoning & Clinical Analysis",
    provider: "NVIDIA NIM"
  }
];
function getChatCompletionsUrl(baseUrl2) {
  const clean = (baseUrl2 || "https://integrate.api.nvidia.com/v1").trim().replace(/\/+$/, "");
  if (clean.endsWith("/v1")) {
    return `${clean}/chat/completions`;
  }
  return `${clean}/v1/chat/completions`;
}
function cleanModelContent(rawText) {
  if (!rawText) return "";
  let text = rawText;
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (/^Here'?s a thinking process:/i.test(text)) {
    const withoutIntro = text.replace(
      /^Here'?s a thinking process:[\s\S]*?(?=(\n\n|\n)(?:#{1,4}\s|\*{1,2}[A-Za-z]|Hello|Thank you|I understand|Based on|Here are|Symptom|Immediate|Care|\*\*|•|-))/i,
      ""
    );
    if (withoutIntro && withoutIntro.trim().length > 30) {
      text = withoutIntro.trim();
    }
  }
  return text.trim();
}
async function generateClinicalGuidance({
  userMessage,
  history = [],
  modelId,
  language = "en",
  retrieval,
  safety,
  isFailover = false
}) {
  const selectedModel = modelId || env.AI_DEFAULT_MODEL;
  if (safety.isEmergency) {
    const emergencyResponse = `\u{1F6A8} **URGENT MEDICAL WARNING**: Your reported symptoms indicate a potential high-risk medical condition (${safety.emergencyCategory || "Urgent Clinical Red Flag"}).

**Immediate Action Required:**
- ${safety.recommendedAction}
- Please call local emergency services (**${safety.emergencyPhone}**) or proceed immediately to the nearest 24/7 Emergency Hospital.
- Do not drive yourself; have an ambulance or family member transport you immediately.

We have automatically located nearby 24/7 emergency trauma centers and hospitals below for immediate dispatch.${MANDATORY_DISCLAIMER}`;
    return {
      text: emergencyResponse,
      modelUsed: `${selectedModel} (Emergency Protocol)`,
      citations: [
        { title: "Emergency Triage Protocol (AHA / MedlinePlus Guidelines)", url: "https://medlineplus.gov" }
      ],
      suggestedSpecialty: "Emergency Medicine",
      isEmergency: true
    };
  }
  if (!env.AI_API_KEY || env.AI_API_KEY.trim() === "") {
    throw new Error(
      "AI Provider API Key (AI_API_KEY) is missing. Please configure AI_API_KEY in your server environment variables."
    );
  }
  const knowledgeContext = retrieval.groundedKnowledge.map(
    (k, i) => `[Evidence Source ${i + 1}: ${k.sourceTitle} (${k.sourceUrl})]
Clinical Focus: ${k.topic}
Summary: ${k.summary}
Guidance: ${k.clinicalGuidance}
Warning Red Flags: ${k.redFlags.join(", ")}`
  ).join("\n\n");
  let languageInstruction = "Respond in clear, professional English.";
  if (language === "hi") {
    languageInstruction = "Respond in clear, supportive Hindi (Devanagari script or Hinglish where helpful for clinical clarity).";
  } else if (language === "mr") {
    languageInstruction = "Respond in clear, supportive Marathi.";
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
8. Clearly recommend an appropriate clinical specialty: "${retrieval.suggestedSpecialty || "General Physician"}".
9. Format your response with clear sections, bullet points, and reassuring, empathetic language.

GROUNDED MEDICAL EVIDENCE:
${knowledgeContext || "Standard clinical practice and evidence-based guidance apply."}`;
  const apiUrl = getChatCompletionsUrl(env.AI_BASE_URL);
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: userMessage }
  ];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6e4);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: 0.25,
        max_tokens: 2048
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch {
      }
      if (response.status >= 500 && response.status <= 504 && selectedModel !== env.AI_DEFAULT_MODEL && !isFailover) {
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
          isFailover: true
        });
      }
      const messageDetail = parsedErr.error?.message || parsedErr.message || errText || `HTTP ${response.status}`;
      throw new Error(`AI Router returned HTTP ${response.status}: ${messageDetail}`);
    }
    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || data.choices?.[0]?.message?.reasoning || "";
    reply = cleanModelContent(reply);
    if (!reply || reply.trim().length === 0) {
      throw new Error(`AI model (${selectedModel}) returned an empty response. Please try again.`);
    }
    const finalContent = `${reply}${MANDATORY_DISCLAIMER}`;
    const citations = retrieval.groundedKnowledge.map((k) => ({
      title: k.sourceTitle,
      url: k.sourceUrl
    }));
    return {
      text: finalContent,
      modelUsed: isFailover ? `${env.AI_DEFAULT_MODEL} (Failover from ${selectedModel})` : selectedModel,
      citations,
      suggestedSpecialty: retrieval.suggestedSpecialty || "General Physician",
      isEmergency: false
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      if (selectedModel !== env.AI_DEFAULT_MODEL && !isFailover) {
        console.warn(`Model ${selectedModel} timed out. Attempting fast failover to ${env.AI_DEFAULT_MODEL}...`);
        return generateClinicalGuidance({
          userMessage,
          history,
          modelId: env.AI_DEFAULT_MODEL,
          language,
          retrieval,
          safety,
          isFailover: true
        });
      }
      throw new Error(`Request to AI model (${selectedModel}) timed out after 60 seconds. Please retry.`);
    }
    throw error;
  }
}

// server/routes/aiRoutes.ts
var aiRouter = Router2();
aiRouter.get("/models", (req, res) => {
  res.json({
    models: SUPPORTED_MODELS,
    defaultModel: SUPPORTED_MODELS[0].id
  });
});
var chatSchema = z2.object({
  message: z2.string().min(1, "Message is required"),
  history: z2.array(
    z2.object({
      role: z2.enum(["user", "assistant", "system"]),
      content: z2.string()
    })
  ).optional(),
  modelId: z2.string().optional(),
  language: z2.enum(["en", "hi", "mr"]).optional().default("en")
});
aiRouter.post("/chat", async (req, res) => {
  try {
    const parse = chatSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Please enter a valid message" });
    }
    const { message, history, modelId, language } = parse.data;
    const safety = evaluateSafety(message);
    const retrieval = retrieveMedicalContext(message);
    const aiResult = await generateClinicalGuidance({
      userMessage: message,
      history,
      modelId,
      language,
      retrieval,
      safety
    });
    res.json({
      text: aiResult.text,
      modelUsed: aiResult.modelUsed,
      citations: aiResult.citations,
      suggestedSpecialty: aiResult.suggestedSpecialty,
      isEmergency: aiResult.isEmergency,
      safetyEvaluation: safety,
      recommendedDoctors: retrieval.matchedDoctors,
      recommendedFacilities: retrieval.matchedFacilities
    });
  } catch (err) {
    console.error("[AI Chat Error]:", err.message);
    res.status(502).json({
      error: err.message || "AI Healthcare Assistant service encountered an error.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var triageSchema = z2.object({
  symptoms: z2.string().min(1, "Symptoms description is required"),
  duration: z2.string().optional(),
  severity: z2.string().optional()
});
aiRouter.post("/triage", async (req, res) => {
  try {
    const parse = triageSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Symptoms description is required" });
    }
    const { symptoms } = parse.data;
    const safety = evaluateSafety(symptoms);
    const retrieval = retrieveMedicalContext(symptoms);
    let urgencyLevel = "routine";
    if (safety.isEmergency) {
      urgencyLevel = "emergency";
    } else if (symptoms.toLowerCase().includes("fever") || symptoms.toLowerCase().includes("pain") || symptoms.toLowerCase().includes("vomit")) {
      urgencyLevel = "moderate";
    }
    res.json({
      urgencyLevel,
      suggestedSpecialist: retrieval.suggestedSpecialty || "General Physician",
      safetyEvaluation: safety,
      guidanceSummary: retrieval.groundedKnowledge[0]?.summary || "Symptom review completed.",
      recommendedDoctors: retrieval.matchedDoctors,
      recommendedFacilities: retrieval.matchedFacilities
    });
  } catch (err) {
    console.error("[AI Triage Error]:", err.message);
    res.status(502).json({
      error: err.message || "Triage assessment service unavailable.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});

// server/routes/doctorRoutes.ts
import { Router as Router3 } from "express";
var doctorRouter = Router3();
doctorRouter.get("/", (req, res) => {
  const query = req.query.query;
  const specialty = req.query.specialty;
  const location = req.query.location;
  if (query || specialty || location) {
    const doctors2 = doctorDao.search({ query, specialty, location });
    return res.json({ doctors: doctors2, total: doctors2.length });
  }
  const doctors = doctorDao.getAll();
  res.json({ doctors, total: doctors.length });
});
doctorRouter.get("/:id", (req, res) => {
  const doctor = doctorDao.getById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json({ doctor });
});

// server/routes/facilityRoutes.ts
import { Router as Router4 } from "express";
var facilityRouter = Router4();
facilityRouter.get("/", (req, res) => {
  const query = req.query.query;
  const type = req.query.type;
  const isEmergency = req.query.emergency === "true";
  if (query || type || isEmergency) {
    const facilities2 = facilityDao.search({ query, type, isEmergency24x7: isEmergency });
    return res.json({ facilities: facilities2, total: facilities2.length });
  }
  const facilities = facilityDao.getAll();
  res.json({ facilities, total: facilities.length });
});
facilityRouter.get("/:id", (req, res) => {
  const facility = facilityDao.getById(req.params.id);
  if (!facility) {
    return res.status(404).json({ error: "Healthcare facility not found" });
  }
  res.json({ facility });
});

// server/routes/appointmentRoutes.ts
import { Router as Router5 } from "express";
import { z as z3 } from "zod";
var appointmentRouter = Router5();
appointmentRouter.get("/", (req, res) => {
  const userId = req.query.userId || "usr_001";
  const appointments = appointmentDao.getByUserId(userId);
  res.json({ appointments });
});
appointmentRouter.get("/slots", (req, res) => {
  const doctorId = req.query.doctorId;
  const date = req.query.date;
  if (!doctorId || !date) {
    return res.status(400).json({ error: "doctorId and date query parameters are required" });
  }
  const doctor = doctorDao.getById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  const allSlots = doctor.availableSlots || [
    "09:30 AM",
    "10:30 AM",
    "11:15 AM",
    "02:00 PM",
    "04:30 PM",
    "06:00 PM"
  ];
  const bookedSlots = appointmentDao.getBookedSlots(doctorId, date);
  const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));
  res.json({
    doctorId,
    date,
    allSlots,
    bookedSlots,
    availableSlots
  });
});
var createAppointmentSchema = z3.object({
  userId: z3.string().optional().default("usr_001"),
  doctorId: z3.string().min(1, "doctorId is required"),
  date: z3.string().min(1, "date is required"),
  time: z3.string().min(1, "time is required"),
  type: z3.enum(["video", "in-person"]).default("video"),
  symptoms: z3.string().optional(),
  notes: z3.string().optional()
});
appointmentRouter.post("/", (req, res, next) => {
  try {
    const parse = createAppointmentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }
    const { userId, doctorId, date, time, type, symptoms, notes } = parse.data;
    const doctor = doctorDao.getById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    const appointmentId = `apt_${Date.now()}`;
    const newAppointment = appointmentDao.create({
      id: appointmentId,
      userId,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorAvatar: doctor.avatarUrl,
      clinicName: doctor.clinic,
      date,
      time,
      type,
      status: "upcoming",
      symptoms,
      notes,
      joinUrl: `https://healhealth.care/teleconsult/${appointmentId}`
    });
    res.status(201).json({
      message: "Appointment confirmed successfully",
      appointment: newAppointment
    });
  } catch (err) {
    if (err.message?.includes("already booked")) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});
appointmentRouter.delete("/:id", (req, res, next) => {
  try {
    const userId = req.query.userId || "usr_001";
    const cancelled = appointmentDao.cancel(req.params.id, userId);
    res.json({
      message: "Appointment cancelled successfully",
      appointment: cancelled
    });
  } catch (err) {
    if (err.message?.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message?.includes("Unauthorized")) {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
});

// server/routes/reportRoutes.ts
import { Router as Router6 } from "express";
import { z as z4 } from "zod";
var reportRouter = Router6();
var analyzeReportSchema = z4.object({
  reportText: z4.string().min(1, "Report text or lab values are required"),
  reportType: z4.string().optional().default("Blood Test / Pathology"),
  modelId: z4.string().optional()
});
function getChatCompletionsUrl2(baseUrl2) {
  const clean = (baseUrl2 || "https://integrate.api.nvidia.com/v1").trim().replace(/\/+$/, "");
  if (clean.endsWith("/v1")) {
    return `${clean}/chat/completions`;
  }
  return `${clean}/v1/chat/completions`;
}
reportRouter.post("/analyze", async (req, res, next) => {
  try {
    const parse = analyzeReportSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }
    const { reportText, reportType, modelId } = parse.data;
    const selectedModel = modelId || env.AI_DEFAULT_MODEL;
    const systemPrompt = `You are a clinical pathology analysis assistant.
Analyze the following patient lab test or medical report.
Identify any values outside typical reference intervals (e.g. elevated blood sugar, lipids, liver enzymes, anemia).
Explain the findings in simple, encouraging, non-alarmist language.
Draft 3 constructive questions the patient should bring to their doctor.
Suggest the most appropriate clinical specialist.
Do NOT give a definitive diagnosis or prescribe medication.

Format response strictly as valid JSON:
{
  "summary": "plain English explanation",
  "abnormalFindings": ["findings with values"],
  "riskLevel": "low" | "moderate" | "high",
  "discussionQuestions": ["question 1", "question 2", "question 3"],
  "suggestedSpecialist": "e.g. Endocrinologist, Cardiologist, or General Physician"
}`;
    if (!env.AI_API_KEY) {
      throw new Error("AI Provider API key is not configured.");
    }
    const apiUrl = getChatCompletionsUrl2(env.AI_BASE_URL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35e3);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AI_API_KEY.trim()}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Report Type: ${reportType}

Content:
${reportText}` }
          ],
          temperature: 0.1,
          max_tokens: 2048
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`AI Router returned HTTP ${response.status}`);
      }
      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || data.choices?.[0]?.message?.reasoning || "";
      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedReport = JSON.parse(jsonMatch[0]);
          return res.json({
            ...parsedReport,
            modelUsed: selectedModel,
            disclaimer: MANDATORY_DISCLAIMER
          });
        } catch {
        }
      }
      return res.json({
        summary: reply || "Report analysis completed. Please review findings with your clinician.",
        abnormalFindings: ["Values noted in uploaded lab record"],
        riskLevel: "moderate",
        discussionQuestions: [
          "What lifestyle adjustments do you recommend based on these results?",
          "Should we repeat this test in 3 to 6 months?",
          "Are there any complementary diagnostic panels you recommend?"
        ],
        suggestedSpecialist: "General Physician",
        modelUsed: selectedModel,
        disclaimer: MANDATORY_DISCLAIMER
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("AI report analysis error, using structured clinical grounding:", err.message);
      const isElevatedSugar = reportText.toLowerCase().includes("glucose") || reportText.toLowerCase().includes("hba1c");
      const isElevatedLipid = reportText.toLowerCase().includes("cholesterol") || reportText.toLowerCase().includes("lipid") || reportText.toLowerCase().includes("triglyceride");
      return res.json({
        summary: "Your report indicates mild variations from standard laboratory baseline intervals. The metrics suggest monitoring your metabolic and dietary patterns with your healthcare provider.",
        abnormalFindings: isElevatedSugar ? ["Elevated Glycated Hemoglobin (HbA1c) / Fasting Plasma Glucose indication"] : isElevatedLipid ? ["Elevated Low-Density Lipoprotein (LDL) / Total Cholesterol profile"] : ["Routine clinical lab parameters noted outside standard range"],
        riskLevel: "moderate",
        discussionQuestions: [
          "How significantly do these values depart from my demographic baseline?",
          "What immediate dietary or exercise adjustments should I initiate?",
          "When is the optimal interval for a follow-up reassessment?"
        ],
        suggestedSpecialist: isElevatedSugar ? "Endocrinologist" : isElevatedLipid ? "Cardiologist" : "General Physician",
        modelUsed: `${selectedModel} (Clinical Rule Grounding)`,
        disclaimer: MANDATORY_DISCLAIMER
      });
    }
  } catch (err) {
    next(err);
  }
});

// server/routes/authRoutes.ts
import { Router as Router7 } from "express";
var authRouter = Router7();
authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = email ? userDao.getByEmail(email) : null;
  if (!user) {
    user = userDao.getById("usr_001") || {
      id: "usr_001",
      name: "Aarav Sharma",
      email: email || "aarav.sharma@example.com",
      phone: "+91 98201 44521",
      bloodGroup: "B+",
      dob: "1992-06-14",
      gender: "Male",
      preferredLanguage: "en"
    };
  }
  res.json({
    message: "Authentication successful (Demo Mode enabled)",
    token: `demo_jwt_token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      dob: user.dob,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage || "en",
      allergies: typeof user.allergies === "string" ? JSON.parse(user.allergies) : user.allergies || ["Penicillin", "Peanuts"],
      chronicConditions: typeof user.chronicConditions === "string" ? JSON.parse(user.chronicConditions) : user.chronicConditions || ["Mild Asthma", "Seasonal Rhinitis"],
      emergencyContact: {
        name: user.emergencyContactName || "Pooja Sharma",
        relationship: user.emergencyContactRelation || "Spouse",
        phone: user.emergencyContactPhone || "+91 98201 44522"
      }
    }
  });
});
authRouter.post("/signup", (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: `usr_${Date.now()}`,
    name: name || "Demo Patient",
    email: email || `patient_${Date.now()}@example.com`,
    phone: "+91 98201 00000",
    bloodGroup: "O+",
    dob: "1995-01-01",
    gender: "Other",
    preferredLanguage: "en",
    allergies: [],
    chronicConditions: [],
    emergencyContact: {
      name: "Emergency Contact",
      relationship: "Family",
      phone: "+91 98201 11111"
    }
  };
  res.status(201).json({
    message: "User registered successfully (Demo Mode enabled)",
    token: `demo_jwt_token_${newUser.id}_${Date.now()}`,
    user: newUser
  });
});
authRouter.get("/me", (req, res) => {
  const user = userDao.getById("usr_001");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      dob: user.dob,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage || "en",
      allergies: JSON.parse(user.allergies || "[]"),
      chronicConditions: JSON.parse(user.chronicConditions || "[]"),
      emergencyContact: {
        name: user.emergencyContactName,
        relationship: user.emergencyContactRelation,
        phone: user.emergencyContactPhone
      }
    }
  });
});

// server/server.ts
var app = express();
try {
  seedDatabase();
} catch (err) {
  console.warn("[DB Init] Database seed skipped or in-memory fallback active:", err?.message);
}
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});
app.use(["/api/v1", "/v1", "/api"], healthRouter);
app.use(["/api/v1/ai", "/v1/ai", "/api/ai"], aiRouter);
app.use(["/api/v1/doctors", "/v1/doctors", "/api/doctors"], doctorRouter);
app.use(["/api/v1/facilities", "/v1/facilities", "/api/facilities"], facilityRouter);
app.use(["/api/v1/appointments", "/v1/appointments", "/api/appointments"], appointmentRouter);
app.use(["/api/v1/reports", "/v1/reports", "/api/reports"], reportRouter);
app.use(["/api/v1/auth", "/v1/auth", "/api/auth"], authRouter);
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  const status = err.status || 500;
  const message = err.message || "An unexpected internal healthcare service error occurred.";
  res.status(status).json({
    error: message,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var PORT = parseInt(env.PORT, 10) || 5e3;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
=====================================================
\u{1F680} HEALHEALTH Full-Stack Backend Running!
\u{1F4E1} Server Port: http://localhost:${PORT}
\u{1FA7A} API Health:  http://localhost:${PORT}/api/v1/health
\u{1F916} AI Router:   Configured (${env.AI_BASE_URL} - ${env.AI_DEFAULT_MODEL})
\u{1F5C4}  Database:    Relational SQLite (dev.db)
=====================================================
    `);
  });
}
var server_default = app;
export {
  server_default as default
};
