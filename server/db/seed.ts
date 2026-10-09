import { db, initDbSchema } from './db';
import fs from 'fs';
import path from 'path';

export function seedDatabase() {
  initDbSchema();

  // 1. Seed Demo User
  const checkUser = db.prepare('SELECT id FROM users WHERE id = ?').get('usr_001');
  if (!checkUser) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password, name, phone, bloodGroup, dob, gender, preferredLanguage, emergencyContactName, emergencyContactPhone, emergencyContactRelation, allergies, chronicConditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(
      'usr_001',
      'aarav.sharma@example.com',
      'demo1234', // Demo password
      'Aarav Sharma',
      '+91 98201 44521',
      'B+',
      '1992-06-14',
      'Male',
      'en',
      'Pooja Sharma',
      '+91 98201 44522',
      'Spouse',
      JSON.stringify(['Penicillin', 'Peanuts']),
      JSON.stringify(['Mild Asthma', 'Seasonal Rhinitis'])
    );
    console.log('✔ Seeded demo user: Aarav Sharma (usr_001)');
  }

  // 2. Seed Doctors
  const countDocs = db.prepare('SELECT COUNT(*) as count FROM doctors').get() as any;
  if (countDocs.count === 0) {
    const insertDoctor = db.prepare(`
      INSERT INTO doctors (id, name, specialty, qualifications, experienceYears, languages, clinic, location, rating, reviewCount, consultationFee, consultationTypes, nextAvailable, about, availableSlots, avatarUrl, isDemo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const doctors = [
      {
        id: 'doc_1',
        name: 'Dr. Priya Kulkarni',
        specialty: 'Cardiologist',
        qualifications: 'MD, DM (Cardiology), FACC',
        experienceYears: 14,
        languages: ['English', 'Hindi', 'Marathi'],
        clinic: 'Apex Heart & Vascular Institute',
        location: 'Bandra West, Mumbai',
        rating: 4.9,
        reviewCount: 342,
        consultationFee: 1200,
        consultationTypes: ['video', 'in-person'],
        nextAvailable: 'Tomorrow, 10:30 AM',
        about: 'Dr. Priya Kulkarni is a senior cardiologist specializing in preventive cardiology, echocardiography, coronary disease management, and cardiac rehabilitation.',
        availableSlots: ['09:30 AM', '10:30 AM', '11:15 AM', '02:00 PM', '04:30 PM', '06:00 PM'],
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        isDemo: 1,
      },
      {
        id: 'doc_2',
        name: 'Dr. Rahul Mehta',
        specialty: 'Neurologist',
        qualifications: 'MBBS, MD (Medicine), DM (Neurology)',
        experienceYears: 11,
        languages: ['English', 'Hindi', 'Gujarati'],
        clinic: 'NeuroCare Center for Brain Health',
        location: 'Lower Parel, Mumbai',
        rating: 4.8,
        reviewCount: 218,
        consultationFee: 1500,
        consultationTypes: ['video', 'in-person'],
        nextAvailable: 'Today, 03:00 PM',
        about: 'Specialist in migraine management, neuromuscular disorders, sleep neurology, and post-stroke rehabilitation with 11+ years of clinical excellence.',
        availableSlots: ['03:00 PM', '03:45 PM', '05:00 PM', '06:30 PM'],
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        isDemo: 1,
      },
      {
        id: 'doc_3',
        name: 'Dr. Ananya Deshmukh',
        specialty: 'Endocrinologist',
        qualifications: 'MBBS, MD, DNB (Endocrinology)',
        experienceYears: 9,
        languages: ['English', 'Hindi', 'Marathi'],
        clinic: 'Metabolic & Hormone Wellness Clinic',
        location: 'Andheri East, Mumbai',
        rating: 4.95,
        reviewCount: 189,
        consultationFee: 1000,
        consultationTypes: ['video', 'in-person'],
        nextAvailable: 'Thursday, 11:00 AM',
        about: 'Expertise in type 1 & 2 diabetes management, thyroid dysfunctions, gestational diabetes, and metabolic syndrome optimization.',
        availableSlots: ['11:00 AM', '12:15 PM', '02:30 PM', '04:00 PM'],
        avatarUrl: 'https://images.unsplash.com/photo-1594824813681-ef06b9b3e157?auto=format&fit=crop&q=80&w=400',
        isDemo: 1,
      },
      {
        id: 'doc_4',
        name: 'Dr. Vikramaditya Sen',
        specialty: 'Orthopedic Surgeon',
        qualifications: 'MS (Ortho), MCh, Fellowship in Joint Replacement',
        experienceYears: 18,
        languages: ['English', 'Hindi', 'Bengali'],
        clinic: 'Fortis Bone & Joint Center',
        location: 'Mulund West, Mumbai',
        rating: 4.7,
        reviewCount: 412,
        consultationFee: 1400,
        consultationTypes: ['in-person'],
        nextAvailable: 'Friday, 02:00 PM',
        about: 'Renowned orthopedic surgeon specializing in robotic joint replacements, sports injuries, ligament reconstruction, and spine posture therapies.',
        availableSlots: ['02:00 PM', '03:00 PM', '04:15 PM', '05:30 PM'],
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
        isDemo: 1,
      },
      {
        id: 'doc_5',
        name: 'Dr. Sunita Rao',
        specialty: 'Pulmonologist',
        qualifications: 'MD (Chest Medicine), FCCP (USA)',
        experienceYears: 13,
        languages: ['English', 'Hindi', 'Telugu'],
        clinic: 'Breathe Easy Respiratory Clinic',
        location: 'Powai, Mumbai',
        rating: 4.85,
        reviewCount: 276,
        consultationFee: 1100,
        consultationTypes: ['video', 'in-person'],
        nextAvailable: 'Tomorrow, 04:00 PM',
        about: 'Dedicated to allergic asthma, chronic cough, COPD, post-viral respiratory recovery, and sleep apnea diagnostic testing.',
        availableSlots: ['10:00 AM', '11:30 AM', '04:00 PM', '05:15 PM'],
        avatarUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400',
        isDemo: 1,
      },
      {
        id: 'doc_6',
        name: 'Dr. Farhan Qureshi',
        specialty: 'General Physician',
        qualifications: 'MBBS, MD (Family Medicine)',
        experienceYears: 8,
        languages: ['English', 'Hindi', 'Urdu'],
        clinic: 'CareFirst Family Health Practice',
        location: 'Dadar West, Mumbai',
        rating: 4.75,
        reviewCount: 310,
        consultationFee: 700,
        consultationTypes: ['video', 'in-person'],
        nextAvailable: 'Today, 05:30 PM',
        about: 'Primary care clinician focused on holistic wellness, preventative health check-ups, acute infections, and continuous family health management.',
        availableSlots: ['05:30 PM', '06:15 PM', '07:00 PM', '07:45 PM'],
        avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
        isDemo: 1,
      },
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
    console.log(`✔ Seeded ${doctors.length} verified doctors`);
  }

  // 3. Seed Healthcare Facilities
  const countFac = db.prepare('SELECT COUNT(*) as count FROM healthcare_facilities').get() as any;
  if (countFac.count === 0) {
    const insertFac = db.prepare(`
      INSERT INTO healthcare_facilities (id, name, type, address, locality, city, pinCode, latitude, longitude, specialties, phone, website, openingHours, rating, reviewCount, isEmergency24x7, isOpenNow, insuranceAccepted, doctorId, doctorName, doctorSpecialty, doctorAvatar, imageUrl, description, bedsCount, emergencyPhone, consultationFee, isDemo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const facilities = [
      {
        id: 'fac_1',
        name: 'Apex Heart & Vascular Institute',
        type: 'clinic',
        address: 'Suite 402, Platinum Health Tower, Turner Road',
        locality: 'Bandra West',
        city: 'Mumbai',
        pinCode: '400050',
        latitude: 19.0596,
        longitude: 72.8295,
        specialties: ['Cardiology', 'Vascular Medicine', 'Preventive Health', 'Echocardiography'],
        phone: '+91 22 2640 8891',
        website: 'https://apexheartmumbai.example.org',
        openingHours: 'Mon - Sat: 08:30 AM - 08:00 PM',
        rating: 4.9,
        reviewCount: 342,
        isEmergency24x7: 0,
        isOpenNow: 1,
        insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'],
        doctorId: 'doc_1',
        doctorName: 'Dr. Priya Kulkarni',
        doctorSpecialty: 'Cardiologist',
        doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
        description: 'Premier outpatient cardiology center equipped with advanced high-resolution Doppler echocardiography, cardiac stress telemetry, and preventive lifestyle guidance.',
        consultationFee: 1200,
        isDemo: 1,
      },
      {
        id: 'fac_2',
        name: 'Metro General Super-Speciality Hospital',
        type: 'hospital',
        address: 'Plot 18, S.V. Road, Near Linking Road Junction',
        locality: 'Bandra West',
        city: 'Mumbai',
        pinCode: '400050',
        latitude: 19.0544,
        longitude: 72.8402,
        specialties: ['Emergency Medicine', 'Cardiology', 'Trauma Surgery', 'Neurology', 'Critical Care', 'Internal Medicine'],
        phone: '+91 22 6120 5000',
        emergencyPhone: '+91 22 6120 5999',
        website: 'https://metrogeneral.example.org',
        openingHours: '24 Hours / 7 Days Open',
        rating: 4.8,
        reviewCount: 1280,
        isEmergency24x7: 1,
        isOpenNow: 1,
        insuranceAccepted: ['All Major Insurances', 'Cashless TPA', 'Ayushman Bharat', 'Star Health', 'HDFC ERGO'],
        bedsCount: 520,
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
        description: 'NABH-accredited tertiary care multi-speciality hospital featuring a Level 1 Trauma Center, 24/7 dedicated catheterization lab, and 120 critical care beds.',
        isDemo: 1,
      },
      {
        id: 'fac_3',
        name: 'NeuroCare Center for Brain Health',
        type: 'clinic',
        address: '8th Floor, Senapati Bapat Marg, One World Center',
        locality: 'Lower Parel',
        city: 'Mumbai',
        pinCode: '400013',
        latitude: 18.9986,
        longitude: 72.8311,
        specialties: ['Neurology', 'Neuro-Rehab', 'Sleep Medicine', 'Headache Management'],
        phone: '+91 22 4988 2210',
        website: 'https://neurocarebrain.example.org',
        openingHours: 'Mon - Fri: 09:00 AM - 07:00 PM',
        rating: 4.8,
        reviewCount: 218,
        isEmergency24x7: 0,
        isOpenNow: 1,
        insuranceAccepted: ['HDFC ERGO', 'ICICI Lombard', 'Max Bupa (Niva Bupa)', 'Care Health'],
        doctorId: 'doc_2',
        doctorName: 'Dr. Rahul Mehta',
        doctorSpecialty: 'Neurologist',
        doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
        description: 'Comprehensive neurological assessment hub providing state-of-the-art EEG, nerve conduction studies, vertigo testing, and neuromuscular therapy.',
        consultationFee: 1500,
        isDemo: 1,
      },
      {
        id: 'fac_4',
        name: 'Metabolic & Hormone Wellness Clinic',
        type: 'clinic',
        address: '304, Solitaire Business Park, Chakala',
        locality: 'Andheri East',
        city: 'Mumbai',
        pinCode: '400093',
        latitude: 19.1136,
        longitude: 72.8697,
        specialties: ['Endocrinology', 'Diabetes Care', 'Thyroid Disorders', 'Metabolic Health'],
        phone: '+91 22 2822 4110',
        website: 'https://metabolichormone.example.org',
        openingHours: 'Mon - Sat: 09:00 AM - 06:30 PM',
        rating: 4.95,
        reviewCount: 189,
        isEmergency24x7: 0,
        isOpenNow: 1,
        insuranceAccepted: ['Star Health', 'Care Health', 'Bajaj Allianz'],
        doctorId: 'doc_3',
        doctorName: 'Dr. Ananya Deshmukh',
        doctorSpecialty: 'Endocrinologist',
        doctorAvatar: 'https://images.unsplash.com/photo-1594824813681-ef06b9b3e157?auto=format&fit=crop&q=80&w=400',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
        description: 'Specialized hormone and diabetic lifestyle clinic with in-house continuous glucose monitoring (CGM) analytics and personalized dietetics.',
        consultationFee: 1000,
        isDemo: 1,
      },
      {
        id: 'fac_5',
        name: 'Fortis Bone & Joint Center',
        type: 'hospital',
        address: 'Lal Bahadur Shastri Marg, Nahur Junction',
        locality: 'Mulund West',
        city: 'Mumbai',
        pinCode: '400080',
        latitude: 19.1726,
        longitude: 72.9565,
        specialties: ['Orthopedic Surgery', 'Joint Replacement', 'Sports Medicine', 'Spine Care', 'Emergency Trauma'],
        phone: '+91 22 6799 4444',
        emergencyPhone: '+91 22 6799 4100',
        website: 'https://fortismulund.example.org',
        openingHours: '24 Hours / 7 Days Open',
        rating: 4.7,
        reviewCount: 890,
        isEmergency24x7: 1,
        isOpenNow: 1,
        insuranceAccepted: ['All Major Insurances', 'Cashless TPA', 'Tata AIG', 'Reliance General'],
        doctorId: 'doc_4',
        doctorName: 'Dr. Vikramaditya Sen',
        doctorSpecialty: 'Orthopedic Surgeon',
        doctorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
        bedsCount: 315,
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
        description: 'Pioneering orthopedic and joint replacement hospital offering robotic knee and hip surgeries, arthroscopy, and round-the-clock polytrauma response.',
        consultationFee: 1400,
        isDemo: 1,
      },
      {
        id: 'fac_6',
        name: 'City Apollo Multispeciality Hospital',
        type: 'hospital',
        address: 'New Link Road, Near Infiniti Mall',
        locality: 'Andheri West',
        city: 'Mumbai',
        pinCode: '400053',
        latitude: 19.1363,
        longitude: 72.8277,
        specialties: ['Cardiology', 'Oncology', 'Organ Transplant', 'Gastroenterology', '24x7 Emergency'],
        phone: '+91 22 6690 1000',
        emergencyPhone: '+91 22 6690 1999',
        website: 'https://cityapollo.example.org',
        openingHours: '24 Hours / 7 Days Open',
        rating: 4.88,
        reviewCount: 1650,
        isEmergency24x7: 1,
        isOpenNow: 1,
        insuranceAccepted: ['All Major Insurances', 'Cashless TPA', 'Star Health', 'HDFC ERGO'],
        bedsCount: 420,
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
        description: 'Comprehensive medical center with an internationally renowned organ transplant unit, oncology wing, and dedicated round-the-clock emergency ICU team.',
        isDemo: 1,
      },
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
    console.log(`✔ Seeded ${facilities.length} healthcare facilities`);
  }

  // 4. Seed Medical Knowledge
  const countMed = db.prepare('SELECT COUNT(*) as count FROM medical_knowledge').get() as any;
  if (countMed.count === 0) {
    const medJsonPath = path.resolve(process.cwd(), 'server/data/medicalKnowledge.json');
    if (fs.existsSync(medJsonPath)) {
      const records = JSON.parse(fs.readFileSync(medJsonPath, 'utf8'));
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
      console.log(`✔ Seeded ${records.length} grounded medical reference records`);
    }
  }

  // 5. Seed a Sample Upcoming Appointment for Demo User
  const countApt = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as any;
  if (countApt.count === 0) {
    const insertApt = db.prepare(`
      INSERT INTO appointments (id, userId, doctorId, doctorName, doctorSpecialty, doctorAvatar, clinicName, date, time, type, status, symptoms, notes, joinUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertApt.run(
      'apt_101',
      'usr_001',
      'doc_1',
      'Dr. Priya Kulkarni',
      'Cardiologist',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      'Apex Heart & Vascular Institute',
      '2026-10-15',
      '10:30 AM',
      'video',
      'upcoming',
      'Periodic cardiac checkup, mild exertion breathlessness review',
      'Patient requested teleconsultation before lipid panel follow-up',
      'https://healhealth.care/teleconsult/apt_101'
    );
    console.log('✔ Seeded sample upcoming appointment (apt_101)');
  }
}

// Auto seed if executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
  console.log('🎉 Database seeding complete!');
}
