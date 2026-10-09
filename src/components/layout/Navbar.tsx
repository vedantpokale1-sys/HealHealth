import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Globe, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, language, setLanguage } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: '3D Anatomy', href: '/body-explorer' },
    { label: 'Find Doctors', href: '/doctors' },
    { label: 'Healthcare Map', href: '/locations' },
    { label: 'Report AI', href: '/reports/analyzer' },
    { label: 'FAQ', href: '/help' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1220]/90 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition duration-200">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">HEAL<span className="text-teal-400">HEALTH</span></span>
              <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded">AI SaaS</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Intelligent Healthcare Navigation</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.href}
              className="hover:text-teal-400 transition-colors duration-150 py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions & Language */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
            </select>
          </div>

          {isAuthenticated ? (
            <Button
              variant="teal"
              size="sm"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Dashboard
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition"
              >
                Sign In
              </Link>
              <Button
                variant="teal"
                size="sm"
                onClick={() => navigate('/signup')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0B1220] border-b border-slate-800 px-6 py-5 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-300 hover:text-teal-400 py-1.5 text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400" /> Language
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-teal-500 text-white font-bold' : 'text-slate-400'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-teal-500 text-white font-bold' : 'text-slate-400'}`}
                >
                  HI
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-0.5 rounded ${language === 'mr' ? 'bg-teal-500 text-white font-bold' : 'text-slate-400'}`}
                >
                  MR
                </button>
              </div>
            </div>

            {isAuthenticated ? (
              <Button
                variant="teal"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 shadow"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
