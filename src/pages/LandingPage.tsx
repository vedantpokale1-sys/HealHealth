import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  MapPin,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Languages,
  Lock,
  BookOpenCheck,
  Bot,
  CalendarCheck,
  FileText,
  Layers,
  HeartPulse,
  Droplets,
  Brain,
  Bone,
  Baby,
  Eye,
  Flower2,
  Stethoscope,
  Video,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MOCK_DOCTORS, FAQS } from '../data/mockData';

const SPECIALTIES = [
  { name: 'Cardiology', icon: HeartPulse, desc: 'Heart, blood pressure and circulatory health.' },
  { name: 'Dermatology', icon: Droplets, desc: 'Skin, hair, nails and allergic reactions.' },
  { name: 'Neurology', icon: Brain, desc: 'Headaches, migraines, nerves and sleep issues.' },
  { name: 'Orthopedics', icon: Bone, desc: 'Bones, joints, sports injuries and mobility.' },
  { name: 'Pediatrics', icon: Baby, desc: 'Newborn to teen health and development.' },
  { name: 'Ophthalmology', icon: Eye, desc: 'Vision, eye strain and eye examinations.' },
  { name: 'Gynecology', icon: Flower2, desc: 'Women\u2019s health, pregnancy and wellness.' },
  { name: 'General Medicine', icon: Stethoscope, desc: 'Everyday illness, check-ups and referrals.' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const previewDoctors = MOCK_DOCTORS.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/doctors?query=${encodeURIComponent(searchQuery.trim())}` : '/doctors');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ================= HERO — healthcare first ================= */}
      <section className="bg-ivory border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-extrabold text-ink leading-[1.15] animate-fade-up">
                Better care starts with the right guidance.
              </h1>
              <p className="text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '70ms' }}>
                HEALHEALTH helps you find verified doctors, understand what your lab reports actually
                mean, book appointments in seconds, and keep your family's health organized — with an
                AI navigator available whenever you need a little more clarity.
              </p>

              {/* Doctor & specialty search */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 max-w-2xl animate-fade-up bg-white border border-hairline rounded-xl p-2 shadow-soft"
                style={{ animationDelay: '140ms' }}
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Doctor, specialty, or hospital"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none rounded-lg"
                    aria-label="Search doctors and specialties"
                  />
                </div>
                <div className="hidden sm:block w-px bg-hairline my-1" />
                <Link
                  to="/locations"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-soft hover:text-brand-700 rounded-lg hover:bg-slate-50 transition"
                >
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Near me</span>
                </Link>
                <Button type="submit" variant="teal" className="sm:px-5">
                  Find a Doctor
                </Button>
              </form>

              <p className="text-xs text-slate-500 animate-fade-up" style={{ animationDelay: '200ms' }}>
                Popular:{' '}
                {['Cardiology', 'Pediatrics', 'General Medicine'].map((s, i) => (
                  <React.Fragment key={s}>
                    {i > 0 && ' · '}
                    <Link to={`/doctors?specialty=${encodeURIComponent(s)}`} className="text-brand-700 hover:underline font-medium">
                      {s}
                    </Link>
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Professional healthcare photography */}
            <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: '120ms' }}>
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
                alt="A doctor reviewing information on a tablet in a modern clinic"
                className="w-full h-64 sm:h-80 lg:h-[420px] object-cover rounded-2xl border border-hairline shadow-soft"
                loading="eager"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  Verified clinical directory
                </span>
                <span className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-brand-600" />
                  English · हिंदी · मराठी
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SPECIALTIES DIRECTORY ================= */}
      <section id="specialties" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">Browse by specialty</h2>
            <p className="text-ink-soft mt-2 text-sm sm:text-base">
              Not sure which department you need? Start with the area of the body or the kind of care
              you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
            {SPECIALTIES.map((sp) => {
              const Icon = sp.icon;
              return (
                <Link
                  key={sp.name}
                  to={`/doctors?specialty=${encodeURIComponent(sp.name)}`}
                  className="group flex items-start gap-3.5 py-4 border-t border-hairline hover:bg-ivory/60 rounded-b-lg px-2 -mx-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors flex items-center gap-1">
                      {sp.name}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{sp.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS — editorial numbered flow ================= */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-ivory border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">How HEALHEALTH works</h2>
            <p className="text-ink-soft mt-2 text-sm sm:text-base">
              A simple path from "something feels wrong" to a scheduled appointment.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: 'Describe your concern',
                desc: 'Search doctors directly, or describe symptoms to the AI Navigator in plain language.',
                icon: Search,
              },
              {
                title: 'Understand the information',
                desc: 'Reports and guidance are explained in plain language, with sources like MedlinePlus and NHS attached.',
                icon: BookOpenCheck,
              },
              {
                title: 'Meet the right specialist',
                desc: 'Browse verified profiles with transparent fees, languages, and consultation types.',
                icon: Stethoscope,
              },
              {
                title: 'Book and stay organized',
                desc: 'Reserve a slot, then track prescriptions, records and family health in one place.',
                icon: CalendarCheck,
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="hidden md:block flex-1 h-px bg-hairline" aria-hidden />
                    <Icon className="w-5 h-5 text-brand-600 md:hidden" />
                  </div>
                  <h3 className="text-sm font-bold text-ink mb-1.5">{step.title}</h3>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{step.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ================= DOCTOR PREVIEW ================= */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink">Featured doctors</h2>
              <p className="text-ink-soft mt-2 text-sm max-w-lg">
                Transparent fees, real availability, and the languages they actually consult in.
              </p>
            </div>
            <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 w-fit">
              <span>View all doctors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewDoctors.map((doc) => (
              <Card key={doc.id} hoverEffect className="p-5 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
                    }}
                    className="w-14 h-14 rounded-xl object-cover border border-hairline shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-ink text-sm truncate">{doc.name}</h3>
                      <Badge variant="teal" size="sm">Verified</Badge>
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-ink-soft mt-0.5">
                      {doc.experienceYears} yrs · {doc.languages.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-ivory rounded-lg text-xs space-y-1.5 mb-4 border border-hairline">
                  <div className="flex justify-between text-ink-soft">
                    <span>Consultation fee</span>
                    <span className="font-semibold text-ink">₹{doc.consultationFee}</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>Next available</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <Video className="w-3 h-3" /> {doc.nextAvailable}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-hairline">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/doctors/${doc.id}`)}>
                    View Profile
                  </Button>
                  <Button variant="teal" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/booking/${doc.id}`)}>
                    Book
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AI NAVIGATOR — dedicated section ================= */}
      <section className="py-16 lg:py-20 bg-ivory border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
                alt="A clinician explaining health information to a patient"
                className="w-full h-64 sm:h-80 object-cover rounded-2xl border border-hairline shadow-soft"
                loading="lazy"
              />
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
                  <Bot className="w-5 h-5 text-brand-400" />
                </div>
                <Badge variant="teal">AI Healthcare Navigator</Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-snug">
                When you need help understanding what comes next
              </h2>

              <p className="text-ink-soft text-sm sm:text-base leading-relaxed max-w-2xl">
                The AI Navigator is a cautious health-information assistant — not a diagnosis
                machine. Describe a symptom or upload a lab report, and it explains things in plain
                language, asks relevant follow-up questions, and points you toward the right kind of
                specialist. Every answer cites its sources.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { icon: BookOpenCheck, label: 'Grounded in MedlinePlus & NHS references' },
                  { icon: Languages, label: 'Works in English, हिंदी and मराठी' },
                  { icon: ShieldCheck, label: 'Red-flag symptoms trigger emergency guidance' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <Icon className="w-4.5 h-4.5 text-brand-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-ink-soft leading-relaxed">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button variant="teal" onClick={() => navigate('/ai-navigator')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open the AI Navigator
                </Button>
                <Link to="/reports/analyzer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand-700">
                  <FileText className="w-4 h-4" />
                  Analyze a lab report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MORE TOOLS — records, body explorer ================= */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">Everything else you need, in one place</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Health records & reports',
                desc: 'Keep reports, prescriptions and visit history organized per family member, with flagged values explained simply.',
                to: '/health-records',
                link: 'Open health records',
              },
              {
                icon: Layers,
                title: '3D Body Explorer',
                desc: 'An interactive anatomical model for understanding which organ system does what — and which specialist treats it.',
                to: '/body-explorer',
                link: 'Explore in 3D',
              },
              {
                icon: MapPin,
                title: 'Hospitals & clinics near you',
                desc: 'A live map of nearby hospitals, 24/7 emergency rooms and clinics, with directions and filters.',
                to: '/locations',
                link: 'Open the map',
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.title} className="border-t-2 border-ink pt-5">
                  <Icon className="w-6 h-6 text-brand-700 mb-3" />
                  <h3 className="text-base font-bold text-ink mb-2">{tool.title}</h3>
                  <p className="text-[13px] text-ink-soft leading-relaxed mb-4">{tool.desc}</p>
                  <Link to={tool.to} className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800">
                    {tool.link}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section className="py-14 bg-ivory border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: 'Never a diagnosis',
              desc: 'Guidance points you to licensed clinicians. The platform never claims diagnostic certainty and never alters prescriptions.',
            },
            {
              icon: Lock,
              title: 'Private by design',
              desc: 'API keys stay on the server, demo records stay in your session, and health data is never sold or fed to ad networks.',
            },
            {
              icon: Activity,
              title: 'Emergency red flags',
              desc: 'Stroke signs, cardiac chest pressure or severe breathlessness immediately trigger 112 / 911 guidance, in every language.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white border border-hairline flex items-center justify-center text-brand-700 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink mb-1">{item.title}</h3>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-8 text-center">Frequently asked questions</h2>

          <div className="divide-y divide-hairline border-y border-hairline">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full py-4.5 px-1 text-left flex items-center justify-between gap-4 text-sm font-semibold text-ink hover:text-brand-700 transition"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-90 text-brand-700' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-5 px-1 text-[13px] text-ink-soft leading-relaxed animate-fade-in">{faq.answer}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16 bg-ivory border-t border-hairline">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">Ready when you are</h2>
          <p className="text-ink-soft text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Create a free account to book appointments, keep your family's records organized, and
            get careful, sourced answers to your health questions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button variant="teal" size="lg" onClick={() => navigate('/signup')} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Free Account
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/doctors')}>
              Browse Doctors
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
