import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Globe,
  User,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Language } from '../types';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfile, setLanguage, language } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'en');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'B+');
  const [dob, setDob] = useState(user?.dob || '1992-06-14');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'Pooja Sharma');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '+91 98201 44522');
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || ['Penicillin', 'Peanuts']);
  const [newAllergy, setNewAllergy] = useState('');
  const [conditions, setConditions] = useState<string[]>(user?.chronicConditions || ['Mild Asthma']);
  const [newCondition, setNewCondition] = useState('');
  const [consentAi, setConsentAi] = useState(true);
  const [consentRecords, setConsentRecords] = useState(true);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Finalize and save
      updateProfile({
        bloodGroup,
        dob,
        gender,
        preferredLanguage: selectedLang,
        emergencyContact: {
          name: emergencyName,
          relationship: 'Spouse',
          phone: emergencyPhone,
        },
        allergies,
        chronicConditions: conditions,
      });
      setLanguage(selectedLang);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback gracefully
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter((a) => a !== item));
  };

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (item: string) => {
    setConditions(conditions.filter((c) => c !== item));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">HEALHEALTH</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Personalize Your Health Care Hub</h2>
          <p className="text-xs text-slate-500 mt-1">Configure your clinical preferences in four swift steps.</p>

          {/* Stepper progress */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    s < step
                      ? 'bg-teal-600 text-white'
                      : s === step
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 4 && <div className={`w-8 h-1 mx-1 rounded ${s < step ? 'bg-teal-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {/* STEP 1: Language */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-600" />
                  Select Preferred Consultation Language
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  AI insights and doctor consultations will prioritize your native preference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'en' as Language, title: 'English', sub: 'Global Standard', native: 'English' },
                  { id: 'hi' as Language, title: 'Hindi', sub: 'हिंदी', native: 'भारतीय भाषा' },
                  { id: 'mr' as Language, title: 'Marathi', sub: 'मराठी', native: 'महाराष्ट्र भाषा' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedLang(item.id);
                      setLanguage(item.id);
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition text-center ${
                      selectedLang === item.id
                        ? 'border-teal-600 bg-teal-50/50 text-teal-900'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="text-base font-bold text-slate-900">{item.title}</div>
                    <div className="text-sm font-semibold text-teal-700 mt-0.5">{item.sub}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.native}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Core Profile */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Basic Health Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Essential parameters utilized during clinical booking triage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Spouse / Sibling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Allergies & Conditions */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-teal-600" />
                  Allergies & Ongoing Conditions
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Alerts doctors to potential adverse reactions and pre-existing medical risks.
                </p>
              </div>

              {/* Allergies list */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Known Allergies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allergies.map((all) => (
                    <span
                      key={all}
                      className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      <span>{all}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(all)}
                        className="hover:text-rose-900 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add an allergy (e.g. Aspirin, Latex)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <Button variant="secondary" size="sm" type="button" onClick={addAllergy}>Add</Button>
                </div>
              </div>

              {/* Conditions list */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chronic Health Conditions</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => removeCondition(c)}
                        className="hover:text-amber-900 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition (e.g. Hypertension, Migraine)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  />
                  <Button variant="secondary" size="sm" type="button" onClick={addCondition}>Add</Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Consent & Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  Consent & Verification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confirm your privacy permissions before entering your healthcare hub.
                </p>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAi}
                    onChange={(e) => setConsentAi(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-700">
                    <strong>AI Clinical Assistant Consent:</strong> I permit HEALHEALTH AI to parse uploaded report values and summarize findings for my educational awareness.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={consentRecords}
                    onChange={(e) => setConsentRecords(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-700">
                    <strong>Health Records Storage:</strong> I understand that demo records reside within my current browser workspace session until connected to the production cloud.
                  </span>
                </label>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>All profile requirements are configured. Ready to enter your dashboard!</span>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Skip Setup for now
              </button>
            )}

            <Button
              variant="teal"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {step === totalSteps ? 'Complete & Launch Hub' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
