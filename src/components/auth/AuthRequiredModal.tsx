import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, UserPlus, Zap, X, Stethoscope } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  actionTitle?: string;
  actionDescription?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  actionTitle = 'Sign in to access HEALHEALTH',
  actionDescription = 'Please sign in or create an account to view doctor profiles, book consultations, and access clinic locations.',
}) => {
  const navigate = useNavigate();
  const { quickDemoLogin } = useAuth();

  if (!isOpen) return null;

  const handleQuickDemo = () => {
    quickDemoLogin();
    onClose();
    navigate(targetUrl);
  };

  const handleSignIn = () => {
    onClose();
    navigate('/login', { state: { redirectTo: targetUrl } });
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signup', { state: { redirectTo: targetUrl } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-hairline p-6 sm:p-7 z-10 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink tracking-tight">
            {actionTitle}
          </h3>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed max-w-xs mx-auto">
            {actionDescription}
          </p>
        </div>

        {/* 1-Click Sandbox Fast Access */}
        <div className="p-3.5 bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-600 fill-teal-600" /> Instant Demo Sign-In
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          <p className="text-[11px] text-teal-800 leading-snug">
            Instantly loads patient portal (Aarav Sharma) with telemetry and proceeds to your requested action.
          </p>
          <Button
            type="button"
            variant="teal"
            size="sm"
            onClick={handleQuickDemo}
            className="w-full text-xs font-bold"
          >
            1-Click Sign In & Continue &rarr;
          </Button>
        </div>

        {/* Traditional Auth Options */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleSignIn}
            className="w-full text-xs font-semibold"
            leftIcon={<LogIn className="w-4 h-4 text-brand-600" />}
          >
            Sign In with Email & Password
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleSignUp}
            className="w-full text-xs text-ink-soft hover:text-ink font-semibold"
            leftIcon={<UserPlus className="w-4 h-4 text-slate-500" />}
          >
            Create New Patient Account
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-hairline flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Encrypted patient confidentiality & HIPAA guidelines</span>
        </div>
      </div>
    </div>
  );
};
