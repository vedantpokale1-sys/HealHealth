import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Search,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Globe,
  Sparkles,
  ChevronRight,
  Heart,
  Stethoscope,
  Lock,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero3DCanvas } from '../components/3d/Hero3DCanvas';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MOCK_DOCTORS, FAQS } from '../data/mockData';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const previewDoctors = MOCK_DOCTORS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION — Dark Cinematic 3D Flagship Experience */}
      <section className="relative bg-[#0B1220] text-white overflow-hidden py-12 md:py-20 lg:py-24 border-b border-slate-800">
        {/* Subtle grid and ambient backdrop glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Trust & Tagline Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-sm shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>Next-Gen Healthcare SaaS Platform</span>
                <span className="w-1 h-1 rounded-full bg-teal-400" />
                <span className="text-slate-300">Multilingual AI</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Your health journey, <span className="bg-gradient-to-r from-teal-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">connected.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Connect intelligent symptom triage, doctor discovery, laboratory report simplification, and smart appointments into one calm, private experience.
              </p>

              {/* Hero Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  variant="teal"
                  size="lg"
                  onClick={() => navigate('/signup')}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto shadow-lg shadow-teal-500/25"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/body-explorer')}
                  leftIcon={<Layers className="w-5 h-5 text-sky-400" />}
                  className="w-full sm:w-auto bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  Launch 3D Body Explorer
                </Button>
              </div>

              {/* Micro-Trust Signals */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400">Educational Safety</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-teal-400">3 Langs</div>
                  <div className="text-xs text-slate-400">EN • हिंदी • मराठी</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-sky-400">Real-time</div>
                  <div className="text-xs text-slate-400">3D Anatomy System</div>
                </div>
              </div>
            </div>

            {/* Right Hero 3D Interactive Canvas */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="w-full max-w-lg lg:max-w-none">
                <Hero3DCanvas />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="teal" className="mb-3">Step-by-Step Architecture</Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How HEALHEALTH Works</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              A structured, clinically oriented pipeline designed to guide you from confusion to confident action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Describe & Explore',
                desc: 'Describe symptoms to the AI Navigator or pinpoint affected areas on the interactive 3D Body Model.',
                icon: Bot,
                color: 'text-teal-600 bg-teal-50',
              },
              {
                step: '02',
                title: 'Understand Reports',
                desc: 'Upload laboratory blood tests or pathology PDFs. The AI explains out-of-range parameters clearly.',
                icon: FileText,
                color: 'text-sky-600 bg-sky-50',
              },
              {
                step: '03',
                title: 'Discover Specialists',
                desc: 'Find verified doctors matched specifically to your clinical requirements, language, and visit preference.',
                icon: Search,
                color: 'text-indigo-600 bg-indigo-50',
              },
              {
                step: '04',
                title: 'Schedule & Track',
                desc: 'Book instant calendar slots, manage medication schedules, and safeguard family health records in one vault.',
                icon: Calendar,
                color: 'text-emerald-600 bg-emerald-50',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-teal-400 hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} shadow-xs`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-300 group-hover:text-teal-500 transition">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / FEATURE SHOWCASE */}
      <section id="features" className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="blue" className="mb-3">Comprehensive Healthcare SaaS</Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Designed for Precision Care & Clarity</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Every feature is built around user agency, privacy, and realistic medical navigation workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverEffect className="p-7 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Healthcare Navigator</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Interactive symptom triage with tailored follow-up queries, safety triage guidance, and automated clinical specialist routing.
                </p>
              </div>
              <Link to="/ai-navigator" className="inline-flex items-center text-xs font-bold text-teal-600 hover:text-teal-700">
                Explore AI Navigator &rarr;
              </Link>
            </Card>

            <Card hoverEffect className="p-7 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Medical Report Analyzer</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Drag and drop lab panels. Receive automated parameter breakdowns, contextual reference ranges, and curated doctor discussion questions.
                </p>
              </div>
              <Link to="/reports/analyzer" className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700">
                Test Report Analyzer &rarr;
              </Link>
            </Card>

            <Card hoverEffect className="p-7 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive 3D Body Explorer</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Real-time WebGL anatomical viewer with multi-layer inspection (Skeletal, Organs, Nervous) and localized clinical education tags.
                </p>
              </div>
              <Link to="/body-explorer" className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700">
                Inspect 3D Anatomical Model &rarr;
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* DOCTOR DISCOVERY PREVIEW */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="teal" className="mb-2">Verified Specialists</Badge>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Top Healthcare Providers</h2>
              <p className="text-sm text-slate-600 mt-1">Book virtual video consultations or in-person clinic appointments.</p>
            </div>
            <Link
              to="/doctors"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700"
            >
              <span>View all doctors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewDoctors.map((doc) => (
              <Card key={doc.id} hoverEffect className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                        <Badge variant="neutral" size="sm">Demo</Badge>
                      </div>
                      <p className="text-xs font-semibold text-teal-600 mt-0.5">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.experienceYears} yrs exp • {doc.languages.join(', ')}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{doc.about}</p>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 mb-4 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Clinic:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]">{doc.clinic}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Next Slot:</span>
                      <span className="font-semibold text-emerald-600">{doc.nextAvailable}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/doctors/${doc.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="teal"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/booking/${doc.id}`)}
                  >
                    Book Slot
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MULTILINGUAL & ACCESSIBILITY SECTION */}
      <section className="py-20 bg-gradient-to-br from-[#0B1220] to-[#101B2D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="teal">Multilingual Healthcare Equity</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Healthcare that speaks your native language.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Medical terminology should never be an obstacle to life-saving care. HEALHEALTH is built natively with support for English, Hindi (हिंदी), and Marathi (मराठी) across symptom triage and report analysis.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span className="text-sm text-slate-200">Native language consultation matching with multilingual doctors</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span className="text-sm text-slate-200">Accessible high-contrast themes and font sizing controls</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span className="text-sm text-slate-200">Clear phonetic audio readout readiness for elder accessibility</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span className="text-xs font-semibold text-teal-400">Sample Symptom Prompt Comparison</span>
                  <span className="text-[11px] text-slate-400">Language Engine</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-teal-400 font-bold block mb-1">English</span>
                    <p className="text-slate-300">"I have had morning chest heaviness and shortness of breath during stairs for 3 days."</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-teal-400 font-bold block mb-1">हिंदी (Hindi)</span>
                    <p className="text-slate-300">"मुझे पिछले ३ दिनों से सीढ़ियाँ चढ़ते समय सीने में भारीपन और सांस फूलने की समस्या हो रही है।"</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-teal-400 font-bold block mb-1">मराठी (Marathi)</span>
                    <p className="text-slate-300">"गेल्या ३ दिवसांपासून जिन्यावरून जाताना छातीत जडपणा आणि श्वास घेण्यास त्रास जाणवत आहे."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY, SAFETY AND TRUST SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="neutral" className="mb-3">Security & Clinical Integrity</Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Built on Privacy & Strict Safety Guardrails</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Medical safety is our non-negotiable priority. We do not compromise on clinical boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Non-Diagnostic Triage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                HEALHEALTH guides users toward licensed medical practitioners without making definitive diagnostic proclamations or drug prescription alterations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Zero-Leakage Architecture</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Frontend interactions do not transmit unverified health records to third-party ad networks. Demo sessions are confined to sandboxed browser storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant Emergency Redirection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-acuity red flag keywords (e.g., acute radiating chest pain, severe asphyxiation) immediately trigger prominent emergency dispatch prompts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="teal" className="mb-2">Answers & Guidance</Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.question}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-slate-900 hover:text-teal-600 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-teal-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience intelligent healthcare navigation?
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
            Explore the AI assistant, browse specialists, analyze clinical reports, and interact with the 3D body viewer today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/signup')}
              rightIcon={<ArrowRight className="w-5 h-5 text-slate-900" />}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
            >
              Create Free Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Explore Demo Sandbox
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
