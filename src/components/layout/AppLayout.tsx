import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { EmergencyBanner } from '../healthcare/EmergencyBanner';
import { Menu, X, LayoutDashboard, Bot, Search, Calendar, FolderHeart } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const mobileTabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/ai-navigator', icon: Bot, label: 'AI Pilot' },
    { to: '/doctors', icon: Search, label: 'Doctors' },
    { to: '/appointments', icon: Calendar, label: 'Visits' },
    { to: '/health-records', icon: FolderHeart, label: 'Records' },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <EmergencyBanner />

      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <AppSidebar />
        </div>

        {/* Mobile drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-ink/50 backdrop-blur-[2px]"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-[270px] bg-white z-10 h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-hairline">
                <span className="font-bold text-ink text-sm">HEALHEALTH Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-ink rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setMobileNavOpen(false)}>
                <AppSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center">
            <div className="lg:hidden p-3 bg-white border-b border-hairline">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="p-2 rounded-lg text-ink-soft hover:bg-slate-100"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <AppHeader />
            </div>
          </div>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1600px] mx-auto min-w-0">
            <Outlet />
          </main>

          {/* Mobile bottom tabs */}
          <div className="lg:hidden sticky bottom-0 z-20 bg-white border-t border-hairline py-2 px-4 flex items-center justify-around text-xs">
            {mobileTabs.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-xl px-2 py-1 transition ${
                    isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
