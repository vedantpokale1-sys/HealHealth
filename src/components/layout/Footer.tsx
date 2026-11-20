import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ivory border-t border-hairline text-ink-soft text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
                <Activity className="w-5 h-5 text-brand-400" strokeWidth={2.2} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-ink">
                HEAL<span className="text-brand-600">HEALTH</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              A healthcare navigation platform for finding the right doctor, understanding your
              medical reports, and managing your family's health — in English, हिंदी and मराठी.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 bg-white border border-hairline px-3 py-1.5 rounded-full">
                <Lock className="w-3.5 h-3.5 text-brand-600" /> Privacy-first
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-hairline px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Non-diagnostic guidance
              </span>
            </div>
          </div>

          {/* Platform */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-ink mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/doctors" className="hover:text-brand-700 transition">Find Doctors</Link></li>
              <li><Link to="/locations" className="hover:text-brand-700 transition">Hospitals & Clinics</Link></li>
              <li><Link to="/appointments" className="hover:text-brand-700 transition">Appointments</Link></li>
              <li><Link to="/reports/analyzer" className="hover:text-brand-700 transition">Report Analyzer</Link></li>
            </ul>
          </div>

          {/* Patient hub */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-ink mb-4">Patient Hub</h4>
            <ul className="space-y-2.5">
              <li><Link to="/dashboard" className="hover:text-brand-700 transition">Dashboard</Link></li>
              <li><Link to="/health-records" className="hover:text-brand-700 transition">Health Records</Link></li>
              <li><Link to="/medications" className="hover:text-brand-700 transition">Medications</Link></li>
              <li><Link to="/family-health" className="hover:text-brand-700 transition">Family Health</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-ink mb-4">Trust & Help</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="hover:text-brand-700 transition">Help Center & FAQ</Link></li>
              <li><Link to="/settings" className="hover:text-brand-700 transition">Privacy & Settings</Link></li>
              <li><a href="tel:112" className="text-rose-700 hover:text-rose-800 font-semibold">Emergency: 112 / 911</a></li>
              <li><Link to="/ai-navigator" className="hover:text-brand-700 transition">AI Healthcare Navigator</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-7 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="leading-relaxed text-center md:text-left max-w-2xl">
            <strong className="text-ink">Medical disclaimer:</strong> HEALHEALTH provides educational
            health information and navigation support. It is not a substitute for professional
            clinical evaluation, diagnosis, or treatment.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <span>&copy; {new Date().getFullYear()} HEALHEALTH</span>
            <span>English · हिंदी · मराठी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
