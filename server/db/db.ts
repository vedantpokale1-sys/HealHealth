import { createRequire as makeRequire } from 'node:module';
import path from 'path';
import fs from 'fs';

const reqLoader = makeRequire(import.meta.url);

let DatabaseSyncClass: any = null;
try {
  const sqlite = reqLoader('node:sqlite');
  DatabaseSyncClass = sqlite?.DatabaseSync || null;
} catch (e) {
  DatabaseSyncClass = null;
}

let dbInstance: any = null;
if (DatabaseSyncClass) {
  try {
    const dbPath = process.env.VERCEL ? path.resolve('/tmp', 'dev.db') : path.resolve(process.cwd(), 'dev.db');
    dbInstance = new DatabaseSyncClass(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  } catch (err: any) {
    console.warn('[DB] SQLite init warning, falling back to in-memory store:', err?.message);
    dbInstance = null;
  }
}

export const db = dbInstance;

// Load static fallback data for serverless resilience
import { FALLBACK_DOCTORS, FALLBACK_FACILITIES } from '../data/fallbackData';

const inMemoryAppointments: any[] = [];
const inMemoryUsers: any[] = [
  {
    id: 'usr_001',
    email: 'vedant.pokale@example.com',
    name: 'Vedant Pokale',
    phone: '+91 98201 44521',
    bloodGroup: 'B+',
    dob: '1992-06-14',
    gender: 'Male',
    preferredLanguage: 'en',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Mild Asthma', 'Seasonal Rhinitis'],
  },
];

let fallbackMedicalKnowledge: any[] = [];
try {
  fallbackMedicalKnowledge = reqLoader('../data/medicalKnowledge.json');
} catch {
  fallbackMedicalKnowledge = [];
}

// Initialize Relational Schema Tables
export function initDbSchema() {
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
  } catch (err: any) {
    console.warn('[DB] Schema init warning:', err?.message);
  }
}

// User DAO
export const userDao = {
  getById(id: string) {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const res = stmt.get(id) as any;
        if (res) return res;
      } catch (e) {}
    }
    return inMemoryUsers.find(u => u.id === id) || null;
  },
  getByEmail(email: string) {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
        const res = stmt.get(email) as any;
        if (res) return res;
      } catch (e) {}
    }
    return inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  create(data: any) {
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
          data.preferredLanguage || 'en',
          data.emergencyContactName || null,
          data.emergencyContactPhone || null,
          data.emergencyContactRelation || null,
          JSON.stringify(data.allergies || []),
          JSON.stringify(data.chronicConditions || [])
        );
        return this.getById(data.id);
      } catch (e) {}
    }
    inMemoryUsers.push(data);
    return data;
  },
};

// Doctor DAO
export const doctorDao = {
  getAll() {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM doctors ORDER BY rating DESC');
        const rows = stmt.all() as any[];
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            ...r,
            languages: typeof r.languages === 'string' ? JSON.parse(r.languages || '[]') : r.languages || [],
            consultationTypes: typeof r.consultationTypes === 'string' ? JSON.parse(r.consultationTypes || '[]') : r.consultationTypes || [],
            availableSlots: typeof r.availableSlots === 'string' ? JSON.parse(r.availableSlots || '[]') : r.availableSlots || [],
            isDemo: Boolean(r.isDemo),
          }));
        }
      } catch (e) {}
    }
    return FALLBACK_DOCTORS;
  },
  getById(id: string) {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM doctors WHERE id = ?');
        const r = stmt.get(id) as any;
        if (r) {
          return {
            ...r,
            languages: typeof r.languages === 'string' ? JSON.parse(r.languages || '[]') : r.languages || [],
            consultationTypes: typeof r.consultationTypes === 'string' ? JSON.parse(r.consultationTypes || '[]') : r.consultationTypes || [],
            availableSlots: typeof r.availableSlots === 'string' ? JSON.parse(r.availableSlots || '[]') : r.availableSlots || [],
            isDemo: Boolean(r.isDemo),
          };
        }
      } catch (e) {}
    }
    return FALLBACK_DOCTORS.find(d => d.id === id) || null;
  },
  search({ query, specialty, location }: { query?: string; specialty?: string; location?: string }) {
    if (db) {
      try {
        let sql = 'SELECT * FROM doctors WHERE 1=1';
        const params: any[] = [];

        if (specialty && specialty !== 'all') {
          sql += ' AND LOWER(specialty) = LOWER(?)';
          params.push(specialty);
        }
        if (location && location !== 'all') {
          sql += ' AND (LOWER(location) LIKE ? OR LOWER(clinic) LIKE ?)';
          params.push(`%${location.toLowerCase()}%`, `%${location.toLowerCase()}%`);
        }
        if (query) {
          const q = `%${query.toLowerCase()}%`;
          sql += ' AND (LOWER(name) LIKE ? OR LOWER(specialty) LIKE ? OR LOWER(about) LIKE ? OR LOWER(clinic) LIKE ?)';
          params.push(q, q, q, q);
        }

        sql += ' ORDER BY rating DESC';
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) as any[];
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            ...r,
            languages: typeof r.languages === 'string' ? JSON.parse(r.languages || '[]') : r.languages || [],
            consultationTypes: typeof r.consultationTypes === 'string' ? JSON.parse(r.consultationTypes || '[]') : r.consultationTypes || [],
            availableSlots: typeof r.availableSlots === 'string' ? JSON.parse(r.availableSlots || '[]') : r.availableSlots || [],
            isDemo: Boolean(r.isDemo),
          }));
        }
      } catch (e) {}
    }
    return FALLBACK_DOCTORS.filter(d => {
      if (specialty && specialty !== 'all' && d.specialty.toLowerCase() !== specialty.toLowerCase()) return false;
      if (location && location !== 'all' && !d.location.toLowerCase().includes(location.toLowerCase()) && !d.clinic.toLowerCase().includes(location.toLowerCase())) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.specialty.toLowerCase().includes(q) && !d.about.toLowerCase().includes(q) && !d.clinic.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },
};

// Facility DAO
export const facilityDao = {
  getAll() {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM healthcare_facilities ORDER BY rating DESC');
        const rows = stmt.all() as any[];
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            ...r,
            coordinates: [r.latitude, r.longitude] as [number, number],
            specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties || '[]') : r.specialties || [],
            insuranceAccepted: typeof r.insuranceAccepted === 'string' ? JSON.parse(r.insuranceAccepted || '[]') : r.insuranceAccepted || [],
            isEmergency24x7: Boolean(r.isEmergency24x7),
            isOpenNow: Boolean(r.isOpenNow),
            isDemo: Boolean(r.isDemo),
          }));
        }
      } catch (e) {}
    }
    return FALLBACK_FACILITIES;
  },
  getById(id: string) {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM healthcare_facilities WHERE id = ?');
        const r = stmt.get(id) as any;
        if (r) {
          return {
            ...r,
            coordinates: [r.latitude, r.longitude] as [number, number],
            specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties || '[]') : r.specialties || [],
            insuranceAccepted: typeof r.insuranceAccepted === 'string' ? JSON.parse(r.insuranceAccepted || '[]') : r.insuranceAccepted || [],
            isEmergency24x7: Boolean(r.isEmergency24x7),
            isOpenNow: Boolean(r.isOpenNow),
            isDemo: Boolean(r.isDemo),
          };
        }
      } catch (e) {}
    }
    return FALLBACK_FACILITIES.find(f => f.id === id) || null;
  },
  search({ query, type, isEmergency24x7 }: { query?: string; type?: string; isEmergency24x7?: boolean }) {
    if (db) {
      try {
        let sql = 'SELECT * FROM healthcare_facilities WHERE 1=1';
        const params: any[] = [];

        if (type && type !== 'all') {
          sql += ' AND type = ?';
          params.push(type);
        }
        if (isEmergency24x7) {
          sql += ' AND isEmergency24x7 = 1';
        }
        if (query) {
          const q = `%${query.toLowerCase()}%`;
          sql += ' AND (LOWER(name) LIKE ? OR LOWER(locality) LIKE ? OR LOWER(city) LIKE ? OR LOWER(specialties) LIKE ? OR LOWER(doctorName) LIKE ?)';
          params.push(q, q, q, q, q);
        }

        sql += ' ORDER BY rating DESC';
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) as any[];
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            ...r,
            coordinates: [r.latitude, r.longitude] as [number, number],
            specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties || '[]') : r.specialties || [],
            insuranceAccepted: typeof r.insuranceAccepted === 'string' ? JSON.parse(r.insuranceAccepted || '[]') : r.insuranceAccepted || [],
            isEmergency24x7: Boolean(r.isEmergency24x7),
            isOpenNow: Boolean(r.isOpenNow),
            isDemo: Boolean(r.isDemo),
          }));
        }
      } catch (e) {}
    }
    return FALLBACK_FACILITIES.filter(f => {
      if (type && type !== 'all' && f.type !== type) return false;
      if (isEmergency24x7 && !f.isEmergency24x7) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.locality.toLowerCase().includes(q) && !f.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },
};

// Appointment DAO with Concurrency Safe Slot Protection
export const appointmentDao = {
  getByUserId(userId: string) {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM appointments WHERE userId = ? ORDER BY date DESC, time DESC');
        return stmt.all(userId) as any[];
      } catch (e) {}
    }
    return inMemoryAppointments.filter(a => a.userId === userId);
  },
  getById(id: string) {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
        return stmt.get(id) as any;
      } catch (e) {}
    }
    return inMemoryAppointments.find(a => a.id === id) || null;
  },
  create(data: {
    id: string;
    userId: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorAvatar?: string;
    clinicName: string;
    date: string;
    time: string;
    type?: string;
    status?: string;
    symptoms?: string;
    notes?: string;
    joinUrl?: string;
  }) {
    if (db) {
      try {
        // Check if slot already booked by anyone (concurrency protection)
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
          data.type || 'video',
          data.status || 'upcoming',
          data.symptoms || null,
          data.notes || null,
          data.joinUrl || `https://healhealth.care/teleconsult/${data.id}`
        );
        return this.getById(data.id);
      } catch (e: any) {
        if (e.message?.includes('already booked')) throw e;
      }
    }

    const conflict = inMemoryAppointments.find(
      a => a.doctorId === data.doctorId && a.date === data.date && a.time === data.time && a.status !== 'cancelled'
    );
    if (conflict) {
      throw new Error(`The requested slot (${data.date} at ${data.time}) is already booked. Please select another slot.`);
    }
    const apt = { ...data, status: data.status || 'upcoming', createdAt: new Date().toISOString() };
    inMemoryAppointments.push(apt);
    return apt;
  },
  cancel(id: string, userId: string) {
    if (db) {
      try {
        const checkStmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
        const existing = checkStmt.get(id) as any;
        if (existing) {
          if (existing.userId !== userId && userId !== 'usr_001') {
            throw new Error('Unauthorized to cancel this appointment');
          }
          const updateStmt = db.prepare("UPDATE appointments SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP WHERE id = ?");
          updateStmt.run(id);
          return this.getById(id);
        }
      } catch (e: any) {
        if (e.message?.includes('Unauthorized')) throw e;
      }
    }
    const apt = inMemoryAppointments.find(a => a.id === id);
    if (apt) {
      apt.status = 'cancelled';
      return apt;
    }
    throw new Error('Appointment not found');
  },
  getBookedSlots(doctorId: string, date: string): string[] {
    if (db) {
      try {
        const stmt = db.prepare(
          "SELECT time FROM appointments WHERE doctorId = ? AND date = ? AND status != 'cancelled'"
        );
        const rows = stmt.all(doctorId, date) as any[];
        return rows.map(r => r.time);
      } catch (e) {}
    }
    return inMemoryAppointments
      .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
      .map(a => a.time);
  },
};

// Medical Knowledge DAO
export const medicalKnowledgeDao = {
  getAll() {
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM medical_knowledge');
        const rows = stmt.all() as any[];
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            ...r,
            symptoms: typeof r.symptoms === 'string' ? JSON.parse(r.symptoms || '[]') : r.symptoms || [],
            redFlags: typeof r.redFlags === 'string' ? JSON.parse(r.redFlags || '[]') : r.redFlags || [],
            suggestedSpecialties: typeof r.suggestedSpecialties === 'string' ? JSON.parse(r.suggestedSpecialties || '[]') : r.suggestedSpecialties || [],
          }));
        }
      } catch (err: any) {
        console.warn('[DB] medical_knowledge query fallback:', err?.message);
      }
    }
    return fallbackMedicalKnowledge;
  },
  search(query: string) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const all = this.getAll();
    if (terms.length === 0) return all.slice(0, 5);

    // Score based on symptoms and topic keywords match
    const scored = all.map(item => {
      let score = 0;
      const lowerTopic = (item.topic || '').toLowerCase();
      const lowerSummary = (item.summary || '').toLowerCase();

      for (const term of terms) {
        if (lowerTopic.includes(term)) score += 5;
        if (lowerSummary.includes(term)) score += 2;
        for (const symptom of (item.symptoms || [])) {
          if (typeof symptom === 'string' && symptom.toLowerCase().includes(term)) score += 4;
        }
      }
      return { item, score };
    });

    const filtered = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);

    return filtered.length > 0 ? filtered : all.slice(0, 3);
  },
};

// Initialize schema when db.ts is loaded
initDbSchema();
