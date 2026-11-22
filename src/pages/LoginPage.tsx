import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [password, setPassword] = useState('HealSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawTarget =
    (location.state as any)?.redirectTo ||
    (location.state as any)?.from?.pathname ||
    '/dashboard';
  const targetSearch = (location.state as any)?.from?.search || '';
  const redirectTarget = `${rawTarget}${targetSearch}`;

  const destinationLabel =
    rawTarget.includes('/booking')
      ? 'Doctor Appointment Booking'
      : rawTarget.includes('/doctors')
      ? 'Specialist & Doctor Directory'
      : rawTarget.includes('/locations')
      ? 'Hospitals & Clinics Near Me'
      : rawTarget.includes('/reports')
      ? 'AI Report Analyzer'
      : rawTarget.includes('/ai-navigator')
      ? 'AI Healthcare Navigator'
      : rawTarget !== '/dashboard' && rawTarget !== '/'
      ? rawTarget
      : null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!email.trim()) errs.email = 'Email is required';
    if (!password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(async () => {
      await login(email, password);
      setIsLoading(false);
      navigate(redirectTarget, { replace: true });
    }, 400);
  };

  const handleQuickDemo = () => {
    quickDemoLogin();
    navigate(redirectTarget, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            HEAL<span className="text-brand-600">HEALTH</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">Sign in to your patient portal</h2>
        <p className="mt-1.5 text-xs text-slate-600">
          Access your clinical dashboard, upcoming visits, and AI records.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-8">
          {destinationLabel && (
            <div className="mb-5 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Login required to proceed</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Sign in or use 1-Click Demo to access <strong>{destinationLabel}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Quick Demo Access Pill */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 rounded-xl flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-600 fill-teal-600" /> Demo Sandbox Mode
              </p>
              <p className="text-[11px] text-teal-700 mt-0.5">Pre-populated with test medical telemetry</p>
            </div>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              1-Click Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>

            {resetSent && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                Password recovery link dispatched to {email || 'your email'} (Demo simulated).
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <span className="text-xs text-slate-600">Remember this device for 30 days</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              state={{ redirectTo: redirectTarget }}
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
