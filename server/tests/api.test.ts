import { db } from '../db/db';
import { evaluateSafety } from '../services/safetyService';
import { retrieveMedicalContext } from '../services/retrievalService';
import { generateClinicalGuidance, SUPPORTED_MODELS } from '../services/aiService';
import { appointmentDao, doctorDao, facilityDao } from '../db/db';

async function runTests() {
  console.log('--- STARTING HEALHEALTH BACKEND & BYNARA AI INTEGRATION TESTS ---\n');
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

    const erHospital = facilities.find((f) => f.isEmergency24x7);
    assert(Boolean(erHospital), 'Database has 24/7 Emergency Hospital indexed');
  } catch (err: any) {
    assert(false, `Database test error: ${err.message}`);
  }

  // 2. Test Safety Red Flags Triage
  try {
    const emergencyEval = evaluateSafety(
      'I am feeling severe crushing chest pain radiating to left arm and cold sweat'
    );
    assert(emergencyEval.isEmergency === true, 'Safety Service detects cardiac emergency red flags');
    assert(emergencyEval.emergencyPhone.includes('112'), 'Safety Service supplies emergency dispatch number');

    const strokeEval = evaluateSafety('My mother suddenly has face drooping and cannot speak clearly');
    assert(strokeEval.isEmergency === true, 'Safety Service detects acute stroke emergency (BE FAST)');

    const routineEval = evaluateSafety('I have a mild sore throat and scratchy voice since yesterday');
    assert(routineEval.isEmergency === false, 'Safety Service classifies mild sore throat as non-emergency');
  } catch (err: any) {
    assert(false, `Safety test error: ${err.message}`);
  }

  // 3. Test Grounded Medical Knowledge Retrieval
  try {
    const retrieval = retrieveMedicalContext('sore throat and difficulty swallowing');
    assert(
      retrieval.groundedKnowledge.length > 0,
      `Retrieved ${retrieval.groundedKnowledge.length} grounded medical citations`
    );
    assert(
      retrieval.groundedKnowledge[0].sourceTitle.includes('MedlinePlus'),
      'Retrieved citation originates from MedlinePlus'
    );
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
    db.prepare('DELETE FROM appointments WHERE doctorId = ? AND date = ? AND time = ?').run(
      testDoc.id,
      testDate,
      testTime
    );

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

  // 5. Test Live AI Router Integration with Model: nvidia/nemotron-3.5-super-vl-120b-a12b
  try {
    console.log('\n--- TESTING LIVE AI ROUTER: nvidia/nemotron-3.5-super-vl-120b-a12b ---');
    const retrieval = retrieveMedicalContext('sore throat and mild fever');
    const safety = evaluateSafety('sore throat and mild fever');

    const result = await generateClinicalGuidance({
      userMessage: 'I have had a mild sore throat and fever for 2 days. What should I do?',
      modelId: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
      retrieval,
      safety,
    });

    assert(Boolean(result.text && result.text.length > 50), 'nvidia/nemotron-3.5-super-vl-120b-a12b generated clinical guidance');
    assert(result.citations.length > 0, `Guidance includes ${result.citations.length} grounded citations`);
    assert(result.text.includes('Disclaimer'), 'Guidance includes mandatory educational disclaimer');
    assert(!result.text.includes('<think>'), 'Response cleanly strips any <think> tags');
    console.log(`Model Response Snippet: "${result.text.slice(0, 150)}..."`);
  } catch (err: any) {
    assert(false, `nvidia/nemotron-3.5-super-vl-120b-a12b live test error: ${err.message}`);
  }

  // 6. Test Live AI Router Integration with Default Model
  try {
    console.log('\n--- TESTING LIVE AI ROUTER WITH DEFAULT MODEL ---');
    const retrieval = retrieveMedicalContext('knee pain when climbing stairs');
    const safety = evaluateSafety('knee pain when climbing stairs');

    const result = await generateClinicalGuidance({
      userMessage: 'Sharp knee pain and stiffness when climbing stairs. Which doctor should I visit?',
      retrieval,
      safety,
    });

    assert(Boolean(result.text && result.text.length > 50), 'Default model generated guidance');
    assert(Boolean(result.suggestedSpecialty), `Suggested specialty: ${result.suggestedSpecialty}`);
    console.log(`Model Response Snippet: "${result.text.slice(0, 150)}..."`);
  } catch (err: any) {
    assert(false, `Default model live test error: ${err.message}`);
  }

  // 7. Test Emergency Red Flag Deterministic Override
  try {
    console.log('\n--- TESTING EMERGENCY RED FLAG OVERRIDE ---');
    const emergencyMessage = 'I have crushing chest pain radiating to my left arm with cold sweats';
    const safety = evaluateSafety(emergencyMessage);
    const retrieval = retrieveMedicalContext(emergencyMessage);

    const result = await generateClinicalGuidance({
      userMessage: emergencyMessage,
      modelId: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
      retrieval,
      safety,
    });

    assert(result.isEmergency === true, 'Emergency bypass flagged isEmergency as true');
    assert(result.text.includes('112') || result.text.includes('911'), 'Emergency bypass gives immediate emergency phone number');
    assert(result.suggestedSpecialty === 'Emergency Medicine', 'Emergency bypass routes to Emergency Medicine');
  } catch (err: any) {
    assert(false, `Emergency bypass test error: ${err.message}`);
  }

  console.log(`\n--- TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
