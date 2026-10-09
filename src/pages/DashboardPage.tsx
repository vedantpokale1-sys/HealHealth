import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Bot,
  Search,
  Calendar,
  FileText,
  Pill,
  Sparkles,
  ArrowRight,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Heart,
  Phone,
  User,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TelehealthRoomModal } from '../components/healthcare/TelehealthRoomModal';
import { Appointment } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { appointments, reports, medications, toggleMedicationDose } = useApp();
  const navigate = useNavigate();

  const [aiPrompt, setAiPrompt] = useState('');
  const [videoModalApt, setVideoModalApt] = useState<Appointment | null>(null);

  const upcomingAppointments = appointments.filter((a) => a.status === 'upcoming');
  const recentReports = reports.slice(0, 3);
  const activeMedications = medications.filter((m) => m.status === 'active');

  const handleAiPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    navigate(`/ai-navigator?prompt=${encodeURIComponent(aiPrompt)}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Personalized Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Aarav'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              Profile 95% Complete
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time health telemetry, medication schedule, and specialist consultations overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/locations')}
            leftIcon={<Compass className="w-4 h-4 text-teal-600" />}
          >
            Find Near You
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/body-explorer')}
            leftIcon={<Layers className="w-4 h-4 text-sky-600" />}
          >
            3D Anatomy
          </Button>
          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/doctors')}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Find Doctor
          </Button>
        </div>
      </div>

      {/* 2. Cohesive Patient Identity & Emergency Vitals Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-xs text-slate-400">Blood Group:</span>
              <span className="text-xs font-bold text-white">{user?.bloodGroup || 'B+'}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-400">Allergies:</span>
              <span className="text-xs font-bold text-amber-300">
                {user?.allergies?.join(', ') || 'Penicillin, Peanuts'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs text-slate-400">Chronic:</span>
              <span className="text-xs font-bold text-sky-300">
                {user?.chronicConditions?.join(', ') || 'Mild Asthma, Seasonal Rhinitis'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>
                ICE: <strong className="text-white">{user?.emergencyContact?.name || 'Pooja Sharma'}</strong> ({user?.emergencyContact?.phone || '+91 98201 44522'})
              </span>
            </div>

            <Link
              to="/settings"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline shrink-0"
            >
              Edit Vitals &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Refined AI Healthcare Assistant Entry Point */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1220] via-[#101B2D] to-teal-950 p-6 sm:p-7 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>NVIDIA NIM AI Healthcare Navigator</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Have questions about a symptom or clinical finding?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Describe how you are feeling in plain language. HEALHEALTH AI triages urgency, grounds advice in MedlinePlus clinical evidence, and connects you with verified specialists.
          </p>

          <form onSubmit={handleAiPromptSubmit} className="flex gap-2 max-w-xl pt-1">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Sore throat, mild fever, or recent high cholesterol report..."
              className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
            <Button
              type="submit"
              variant="teal"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Consult AI
            </Button>
          </form>
        </div>
      </div>

      {/* 4. Quick Action Hub (4 Clean Aligned Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Find a Specialist', desc: 'Browse verified medical departments', icon: Search, path: '/doctors', color: 'text-teal-600 bg-teal-50' },
          { label: 'Healthcare Map', desc: 'Hospitals & clinics near you', icon: Compass, path: '/locations', color: 'text-blue-600 bg-blue-50' },
          { label: 'Analyze Lab Report', desc: 'Instant AI breakdown of pathology tests', icon: FileText, path: '/reports/analyzer', color: 'text-sky-600 bg-sky-50' },
          { label: '3D Anatomy Explorer', desc: 'Explore interactive human organ layers', icon: Layers, path: '/body-explorer', color: 'text-indigo-600 bg-indigo-50' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.path}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition group-hover:translate-x-0.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-600 transition">{action.label}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 5. Main Balanced Two-Column Health Telemetry Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Appointments & Medications) - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Appointment Widget */}
          <Card className="p-5 sm:p-6 shadow-xs border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
              </div>
              <Link to="/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                View all ({upcomingAppointments.length}) &rarr;
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No upcoming consultations scheduled.{' '}
                <Link to="/doctors" className="text-teal-600 font-bold hover:underline">Book a doctor</Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={apt.doctorAvatar}
                        alt={apt.doctorName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{apt.doctorName}</h4>
                          <Badge variant="teal" size="sm">{apt.type === 'video' ? 'Video Visit' : 'Clinic'}</Badge>
                        </div>
                        <p className="text-xs text-teal-700 font-medium mt-0.5">{apt.doctorSpecialty}</p>
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
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Call</span>
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/appointments')}
                        className="text-xs"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Medication Tracker Summary */}
          <Card className="p-5 sm:p-6 shadow-xs border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Today's Medication Schedule</h3>
              </div>
              <Link to="/medications" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Manage prescriptions &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {activeMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{med.name}</h4>
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
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                        title={slot.taken ? `Taken at ${slot.takenAt || slot.time}` : 'Click to mark dose taken'}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${slot.taken ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{slot.time}</span>
                        {slot.taken && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Recent Medical Reports & Preventive Actions) - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Reports Panel */}
          <Card className="p-5 sm:p-6 shadow-xs border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Analyzed Health Reports</h3>
              </div>
              <Link to="/reports/analyzer" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
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
                    className="block p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                        {rep.title}
                      </h4>
                      <Badge variant={abnormalCount > 0 ? 'high' : 'normal'} size="sm">
                        {abnormalCount > 0 ? `${abnormalCount} flagged` : 'Optimal'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rep.summary}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>{rep.category}</span>
                      <span>Uploaded {rep.uploadDate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Clinical Insights & Prevention Card */}
          <Card className="p-5 sm:p-6 shadow-xs border-slate-200 bg-gradient-to-br from-teal-50/50 to-sky-50/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">AI Preventive Guidance</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Your lipid panel and cardiac telemetry are stable. Review follow-up questions with Dr. Priya Kulkarni during your upcoming consultation.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Medication adherence rate: <strong>100% this week</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Next checkup scheduled in <strong>5 days</strong></span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-teal-100 flex items-center justify-between">
              <Link
                to="/ai-navigator"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>Ask AI Assistant</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to="/appointments"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                View calendar
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Telehealth In-App Consultation Modal */}
      <TelehealthRoomModal
        isOpen={!!videoModalApt}
        onClose={() => setVideoModalApt(null)}
        appointment={videoModalApt}
      />
    </div>
  );
};
