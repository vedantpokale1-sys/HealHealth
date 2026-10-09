import { db } from '../db/db';
import { evaluateSafety } from '../services/safetyService';
import { retrieveMedicalContext } from '../services/retrievalService';
import { generateClinicalGuidance, SUPPORTED_MODELS } from '../services/nimService';
import { appointmentDao, doctorDao, facilityDao } from '../db/db';

async function runTests() {
  console.log('--- STARTING HEALHEALTH BACKEND & AI INTEGRATION TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Database Connectivity & Seeding
  try {
    const doctors = doctorDao.getAll();
    assert(doctors.length >= 6, `Database contains ${doctors.length} doctors`);

    const facilities = facilityDao.getAll();
    assert(facilities.length >= 6, `Database contains ${facilities.length} healthcare facilities`);

    const erHospital = facilities.find(f => f.isEmergency24x7);
    assert(Boolean(erHospital), 'Database has 24/7 Emergency Hospital indexed');
  } catch (err: any) {
    assert(false, `Database test error: ${err.message}`);
  }

  // 2. Test Safety Red Flags Triage
  try {
    const emergencyEval = evaluateSafety('I am feeling severe crushing chest pain radiating to left arm and cold sweat');
    assert(emergencyEval.isEmergency === true, 'Safety Service detects cardiac emergency red flags');
    assert(emergencyEval.emergencyPhone.includes('112'), 'Safety Service supplies emergency dispatch number');

    const routineEval = evaluateSafety('I have a mild sore throat and scratchy voice since yesterday');
    assert(routineEval.isEmergency === false, 'Safety Service classifies mild sore throat as non-emergency');
  } catch (err: any) {
    assert(false, `Safety test error: ${err.message}`);
  }

  // 3. Test Grounded Medical Knowledge Retrieval
  try {
    const retrieval = retrieveMedicalContext('sore throat and difficulty swallowing');
    assert(retrieval.groundedKnowledge.length > 0, `Retrieved ${retrieval.groundedKnowledge.length} grounded medical citations`);
    assert(retrieval.groundedKnowledge[0].sourceTitle.includes('MedlinePlus'), 'Retrieved citation originates from MedlinePlus');
    assert(retrieval.matchedDoctors.length > 0, `Matched ${retrieval.matchedDoctors.length} doctors for sore throat`);
  } catch (err: any) {
    assert(false, `Retrieval test error: ${err.message}`);
  }

  // 4. Test Concurrency-Safe Appointment Booking & Duplicate Prevention
  try {
    const testDoc = doctorDao.getAll()[0];
    const testDate = '2026-11-20';
    const testTime = '04:30 PM';

    // Clear any prior test appointment for this slot
    db.prepare('DELETE FROM appointments WHERE doctorId = ? AND date = ? AND time = ?').run(testDoc.id, testDate, testTime);

    // Book slot first time
    const apt1 = appointmentDao.create({
      id: `test_apt_${Date.now()}`,
      userId: 'usr_001',
      doctorId: testDoc.id,
      doctorName: testDoc.name,
      doctorSpecialty: testDoc.specialty,
      clinicName: testDoc.clinic,
      date: testDate,
      time: testTime,
      type: 'video',
    });
    assert(Boolean(apt1?.id), 'Successfully booked appointment slot in database');

    // Attempt double booking
    let doubleBookingBlocked = false;
    try {
      appointmentDao.create({
        id: `test_apt_dup_${Date.now()}`,
        userId: 'usr_002',
        doctorId: testDoc.id,
        doctorName: testDoc.name,
        doctorSpecialty: testDoc.specialty,
        clinicName: testDoc.clinic,
        date: testDate,
        time: testTime,
        type: 'video',
      });
    } catch (e: any) {
      if (e.message.includes('already booked')) {
        doubleBookingBlocked = true;
      }
    }
    assert(doubleBookingBlocked, 'Duplicate booking concurrency check successfully prevented double-booking');

    // Clean up test appointment
    db.prepare('DELETE FROM appointments WHERE id = ?').run(apt1.id);
  } catch (err: any) {
    assert(false, `Appointment concurrency test error: ${err.message}`);
  }

  // 5. Test NVIDIA NIM Live Integration with Model 1
  try {
    console.log('\n--- TESTING LIVE NVIDIA NIM INTEGRATION ---');
    const retrieval = retrieveMedicalContext('sore throat and mild fever');
    const safety = evaluateSafety('sore throat and mild fever');

    const result = await generateClinicalGuidance({
      userMessage: 'I have had a mild sore throat for 2 days. What should I do?',
      modelId: SUPPORTED_MODELS[0].id,
      retrieval,
      safety,
    });

    assert(Boolean(result.text && result.text.length > 50), 'NVIDIA NIM generated clinical guidance');
    assert(result.citations.length > 0, `NVIDIA NIM guidance includes ${result.citations.length} grounded citations`);
    assert(result.text.includes('Disclaimer'), 'Guidance includes mandatory educational disclaimer');
    console.log(`Model Response Snippet: "${result.text.slice(0, 120)}..."`);
  } catch (err: any) {
    assert(false, `NVIDIA NIM live test error: ${err.message}`);
  }

  console.log(`\n--- TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
