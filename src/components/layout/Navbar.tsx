import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Find Doctors', href: '/doctors' },
    { label: 'Specialties', href: '/#specialties' },
    { label: 'Locations', href: '/locations' },
    { label: 'Health Library', href: '/help' },
    { label: 'AI Navigator', href: '/ai-navigator' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
            <Activity className="w-5 h-5 text-brand-400" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            HEAL<span className="text-brand-600">HEALTH</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink-soft">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="hover:text-brand-700 transition-colors duration-150 py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                👤 {user?.name || 'Vedant Pokale'}
              </span>
              <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                My Dashboard
              </Button>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1.5 hover:bg-rose-50 rounded-lg transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold text-ink-soft hover:text-ink px-3 py-2 rounded-lg transition">
                Sign In
              </Link>
              <Button variant="teal" size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-ink hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-hairline px-6 py-5 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink-soft hover:text-brand-700 py-1.5 text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-hairline flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full"
              >
                My Dashboard
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-ink text-sm font-semibold hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
