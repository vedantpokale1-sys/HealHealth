import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1220] border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                HEAL<span className="text-teal-400">HEALTH</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              AI-Powered Healthcare Navigation, Doctor Discovery & Smart Appointment System. Bridging symptom understanding with qualified medical specialists.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
                <Lock className="w-3.5 h-3.5 text-teal-400" /> Demo Sandbox Privacy
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Non-Diagnostic Educational AI
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/ai-navigator" className="hover:text-teal-400 transition">AI Symptom Navigator</Link></li>
              <li><Link to="/doctors" className="hover:text-teal-400 transition">Doctor Discovery</Link></li>
              <li><Link to="/reports/analyzer" className="hover:text-teal-400 transition">Report Analyzer</Link></li>
              <li><Link to="/body-explorer" className="hover:text-teal-400 transition">3D Body Explorer</Link></li>
              <li><Link to="/appointments" className="hover:text-teal-400 transition">Appointments</Link></li>
            </ul>
          </div>

          {/* Health Management */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Patient Hub</h4>
            <ul className="space-y-2.5">
              <li><Link to="/dashboard" className="hover:text-teal-400 transition">Main Dashboard</Link></li>
              <li><Link to="/health-records" className="hover:text-teal-400 transition">Health Records</Link></li>
              <li><Link to="/medications" className="hover:text-teal-400 transition">Medication Tracker</Link></li>
              <li><Link to="/family-health" className="hover:text-teal-400 transition">Family Profiles</Link></li>
              <li><Link to="/onboarding" className="hover:text-teal-400 transition">Health Onboarding</Link></li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Trust & Help</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="hover:text-teal-400 transition">Help Center & FAQ</Link></li>
              <li><Link to="/settings" className="hover:text-teal-400 transition">Privacy & Settings</Link></li>
              <li><a href="tel:112" className="text-rose-400 hover:text-rose-300 transition font-medium">Emergency Protocol</a></li>
              <li><span className="text-slate-500">HIPAA Compliant Roadmap</span></li>
              <li><span className="text-slate-500">ISO 27001 Security Target</span></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="leading-relaxed text-center md:text-left max-w-2xl">
            <strong className="text-slate-300">Important Disclaimer:</strong> HEALHEALTH is an AI-assisted healthcare discovery platform. Information provided is for educational and navigation purposes only and must not replace professional clinical evaluation, diagnosis, or treatment.
          </p>
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} HEALHEALTH SaaS.</span>
            <span>English • हिंदी • मराठी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
