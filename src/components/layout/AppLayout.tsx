import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { EmergencyBanner } from '../healthcare/EmergencyBanner';
import { Menu, X, LayoutDashboard, Bot, Search, Calendar, FolderHeart } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <EmergencyBanner />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <AppSidebar />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-64 bg-[#0B1220] z-10 h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <span className="font-bold text-white text-sm">HEALHEALTH Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center">
            {/* Mobile hamburger toggle */}
            <div className="lg:hidden p-3 bg-white border-b border-slate-200">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <AppHeader />
            </div>
          </div>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1600px] mx-auto min-w-0">
            <Outlet />
          </main>

          {/* Mobile Bottom Quick Navigation bar */}
          <div className="lg:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around text-xs">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? 'text-teal-600 font-bold' : 'text-slate-500'}`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/ai-navigator"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? 'text-teal-600 font-bold' : 'text-slate-500'}`
              }
            >
              <Bot className="w-5 h-5" />
              <span>AI Pilot</span>
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? 'text-teal-600 font-bold' : 'text-slate-500'}`
              }
            >
              <Search className="w-5 h-5" />
              <span>Doctors</span>
            </NavLink>
            <NavLink
              to="/appointments"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? 'text-teal-600 font-bold' : 'text-slate-500'}`
              }
            >
              <Calendar className="w-5 h-5" />
              <span>Visits</span>
            </NavLink>
            <NavLink
              to="/health-records"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? 'text-teal-600 font-bold' : 'text-slate-500'}`
              }
            >
              <FolderHeart className="w-5 h-5" />
              <span>Records</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
