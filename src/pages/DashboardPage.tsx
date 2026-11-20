import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  FileText,
  Pill,
  Sparkles,
  ArrowRight,
  Clock,
  Video,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Phone,
  Compass,
  FolderHeart,
  Stethoscope,
  MapPin,
  Users,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Thermometer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TelehealthRoomModal } from '../components/healthcare/TelehealthRoomModal';
import { Appointment } from '../types';

/**
 * Patient Dashboard — structured per healthcare UX practice:
 * welcome + search first, glanceable summary, details on demand.
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { appointments, reports, medications, familyMembers, doctors, toggleMedicationDose } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [videoModalApt, setVideoModalApt] = useState<Appointment | null>(null);

  const upcomingAppointments = appointments.filter((a) => a.status === 'upcoming');
  const recentReports = reports.slice(0, 3);
  const activeMedications = medications.filter((m) => m.status === 'active');

  const totalDoses = activeMedications.reduce((acc, m) => acc + m.timeSlots.length, 0);
  const takenDoses = activeMedications.reduce(
    (acc, m) => acc + m.timeSlots.filter((s) => s.taken).length,
    0
  );
  const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  const flaggedReports = reports.filter((r) => r.parameters.some((p) => p.status !== 'normal')).length;

  const recommendedDoctors = [...doctors].sort((a, b) => b.rating - a.rating).slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/doctors?query=${encodeURIComponent(searchQuery.trim())}` : '/doctors');
  };

  const specialties = [
    { name: 'Cardiology', icon: HeartPulse, desc: 'Heart & BP' },
    { name: 'Neurology', icon: Brain, desc: 'Brain & Nerves' },
    { name: 'Pediatrics', icon: Baby, desc: 'Child Health' },
    { name: 'Orthopedics', icon: Bone, desc: 'Bones & Joints' },
    { name: 'Casualty', icon: Thermometer, desc: 'Cold, Fever, Dengue' },
  ];

  const stats = [
    {
      label: 'Upcoming visits',
      value: `${upcomingAppointments.length}`,
      hint: upcomingAppointments[0]?.date || 'Nothing booked yet',
      icon: Calendar,
      tint: 'text-brand-700 bg-brand-50 border-brand-100',
      to: '/appointments',
    },
    {
      label: 'Meds taken today',
      value: `${takenDoses}/${totalDoses}`,
      hint: `${adherence}% adherence`,
      icon: Pill,
      tint: 'text-indigo-700 bg-indigo-50 border-indigo-100',
      to: '/medications',
    },
    {
      label: 'Reports flagged',
      value: `${flaggedReports}`,
      hint: flaggedReports > 0 ? 'Worth discussing with a doctor' : 'All within range',
      icon: FileText,
      tint: 'text-sky-700 bg-sky-50 border-sky-100',
      to: '/reports/analyzer',
    },
    {
      label: 'Family members',
      value: `${familyMembers.length}`,
      hint: 'Records and profiles',
      icon: Users,
      tint: 'text-rose-700 bg-rose-50 border-rose-100',
      to: '/family-health',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ============ 1. Welcome + doctor search ============ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-hairline">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors or specialties..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-hairline rounded-lg text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition"
              aria-label="Search doctors"
            />
          </div>
          <Button type="submit" variant="teal" size="md">
            Find
          </Button>
        </form>
      </div>

      {/* ============ 2. Glanceable summary ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.to}
              className="bg-white border border-hairline rounded-xl p-4 sm:p-5 card-lift shadow-soft group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${s.tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-extrabold text-ink font-display leading-none">{s.value}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1.5">{s.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.hint}</p>
            </Link>
          );
        })}
      </div>

      {/* ============ 3. Specialty shortcuts + emergency card ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white border border-hairline rounded-xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Looking for a particular kind of care?</h3>
            <Link to="/doctors" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              All specialties &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {specialties.map((sp) => {
              const Icon = sp.icon;
              return (
                <Link
                  key={sp.name}
                  to={`/doctors?specialty=${encodeURIComponent(sp.name)}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-3 rounded-lg border border-hairline hover:border-brand-300 hover:bg-brand-50/40 transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-ink group-hover:text-brand-800 block truncate">
                      {sp.name}
                    </span>
                    {sp.desc && (
                      <span className="text-[10px] text-slate-500 block truncate">
                        {sp.desc}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-hairline flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Other services:</span>
            <Link to="/locations" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline hover:border-brand-300 hover:bg-brand-50/40 text-ink-soft hover:text-brand-800 font-medium transition">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Hospitals & ERs near me
            </Link>
            <Link to="/reports/analyzer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline hover:border-brand-300 hover:bg-brand-50/40 text-ink-soft hover:text-brand-800 font-medium transition">
              <FileText className="w-3.5 h-3.5 text-brand-600" /> Analyze a lab report
            </Link>
            <Link to="/body-explorer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline hover:border-brand-300 hover:bg-brand-50/40 text-ink-soft hover:text-brand-800 font-medium transition">
              <Compass className="w-3.5 h-3.5 text-brand-600" /> 3D Body Explorer
            </Link>
          </div>
        </div>

        {/* Emergency card — calm, structured */}
        <div className="lg:col-span-4 bg-white border border-hairline rounded-xl p-5 shadow-soft flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-ink">Emergency card</h3>
            <Link to="/settings" className="ml-auto text-[11px] font-semibold text-brand-700 hover:text-brand-800">
              Edit
            </Link>
          </div>

          <div className="space-y-2.5 text-xs flex-1">
            <div className="flex items-center justify-between p-2.5 bg-ivory rounded-lg border border-hairline">
              <span className="text-ink-soft flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Blood group
              </span>
              <span className="font-bold text-ink">{user?.bloodGroup || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-ivory rounded-lg border border-hairline">
              <span className="text-ink-soft">Allergies</span>
              <span className="font-bold text-amber-700 text-right truncate max-w-[130px]">
                {user?.allergies?.join(', ') || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-ivory rounded-lg border border-hairline">
              <span className="text-ink-soft flex items-center gap-1">
                <Phone className="w-3 h-3 text-rose-500" /> ICE contact
              </span>
              <span className="font-bold text-ink text-right">
                {user?.emergencyContact?.name || '—'}
              </span>
            </div>
          </div>

          <a
            href="tel:112"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
          >
            <Phone className="w-3.5 h-3.5" />
            Emergency: Call 112 / 911
          </a>
        </div>
      </div>

      {/* ============ 4. Doctor recommendations ============ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-ink">Top rated doctors</h3>
          <Link to="/doctors" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            View all doctors &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendedDoctors.map((doc) => (
            <Card key={doc.id} hoverEffect className="p-4 flex items-center gap-3.5">
              <img
                src={doc.avatarUrl}
                alt={doc.name}
                className="w-12 h-12 rounded-lg object-cover border border-hairline shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink truncate">{doc.name}</p>
                <p className="text-xs text-brand-700 font-medium truncate">{doc.specialty}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">₹{doc.consultationFee} · {doc.nextAvailable}</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => navigate(`/booking/${doc.id}`)}>
                Book
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* ============ 5. Detail columns ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: appointments + meds */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 sm:p-6 shadow-soft border-hairline">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-ink">Upcoming appointments</h3>
              </div>
              <Link to="/appointments" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                View all ({upcomingAppointments.length}) &rarr;
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 bg-ivory rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                No visits scheduled.{' '}
                <Link to="/doctors" className="text-brand-700 font-bold hover:underline">Book a doctor</Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-lg border border-hairline bg-ivory/60 hover:bg-ivory transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={apt.doctorAvatar}
                        alt={apt.doctorName}
                        className="w-12 h-12 rounded-lg object-cover border border-hairline shrink-0"
                        loading="lazy"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-ink">{apt.doctorName}</h4>
                          <Badge variant="teal" size="sm">{apt.type === 'video' ? 'Video Visit' : 'Clinic'}</Badge>
                        </div>
                        <p className="text-xs text-brand-700 font-medium mt-0.5">{apt.doctorSpecialty}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.date} at {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {apt.type === 'video' && (
                        <button
                          type="button"
                          onClick={() => setVideoModalApt(apt)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Call</span>
                        </button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => navigate('/appointments')} className="text-xs">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Medications with adherence progress */}
          <Card className="p-5 sm:p-6 shadow-soft border-hairline">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-ink">Today's medications</h3>
              </div>
              <Link to="/medications" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                Manage prescriptions &rarr;
              </Link>
            </div>

            {activeMedications.length === 0 ? (
              <div className="text-center py-8 bg-ivory rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                No active prescriptions.{' '}
                <Link to="/medications" className="text-brand-700 font-bold hover:underline">Add a medication</Link>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3.5 bg-ivory border border-hairline rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                      Daily adherence
                    </span>
                    <span className="font-extrabold text-brand-800">{adherence}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${adherence}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {activeMedications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-lg border border-hairline bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-ink">{med.name}</h4>
                          <span className="text-xs font-semibold text-slate-500">{med.dosage}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{med.instructions}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {med.timeSlots.map((slot, sIdx) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => toggleMedicationDose(med.id, sIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                              slot.taken
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                            title={slot.taken ? `Taken at ${slot.takenAt || slot.time}` : 'Mark dose taken'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${slot.taken ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span>{slot.time}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right: reports + AI entry + guidance */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 sm:p-6 shadow-soft border-hairline">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-ink">Recent reports</h3>
              </div>
              <Link to="/reports/analyzer" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                Upload new &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {recentReports.map((rep) => {
                const abnormalCount = rep.parameters.filter((p) => p.status !== 'normal').length;
                return (
                  <Link
                    key={rep.id}
                    to="/reports/analyzer"
                    className="block p-3.5 rounded-lg border border-hairline hover:border-sky-300 hover:bg-sky-50/30 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-ink group-hover:text-sky-800 transition">{rep.title}</h4>
                      <Badge variant={abnormalCount > 0 ? 'high' : 'normal'} size="sm">
                        {abnormalCount > 0 ? `${abnormalCount} flagged` : 'Optimal'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rep.summary}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-hairline">
                      <span>{rep.category}</span>
                      <span>Uploaded {rep.uploadDate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* AI Navigator entry — calm, distinct */}
          <div className="bg-white border border-hairline rounded-xl p-5 shadow-soft">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-ink">AI Healthcare Navigator</h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  Describe a symptom in plain language and get careful, source-backed guidance plus
                  specialist suggestions.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" className="w-full mt-4" onClick={() => navigate('/ai-navigator')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open AI Navigator
            </Button>
            <p className="text-[10px] text-slate-400 mt-2.5 text-center">
              Educational guidance only — not a diagnosis.
            </p>
          </div>

          <Card className="p-5 sm:p-6 shadow-soft border-hairline">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-ink">Preventive guidance</h3>
            </div>

            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Your reports look stable overall. Review flagged values with your doctor at your next
              consultation, and keep up with routine check-ups.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Medication adherence: <strong>{adherence}% today</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{upcomingAppointments.length > 0 ? 'Next visit scheduled — see appointments' : 'No visit scheduled yet'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <FolderHeart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{reports.length} reports in your records</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-hairline flex items-center justify-between">
              <Link to="/health-records" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1">
                <span>Open health records</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/appointments" className="text-xs font-semibold text-slate-500 hover:text-ink">
                View calendar
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <TelehealthRoomModal isOpen={!!videoModalApt} onClose={() => setVideoModalApt(null)} appointment={videoModalApt} />
    </div>
  );
};
