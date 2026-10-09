import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Search,
  MapPin,
  Calendar,
  FileText,
  FolderHeart,
  Pill,
  Users,
  Activity,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const AppSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, appointments } = useApp();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const upcomingAptCount = appointments.filter(a => a.status === 'upcoming').length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Navigator', path: '/ai-navigator', icon: Bot, badge: 'AI' },
    { label: 'Find Doctors', path: '/doctors', icon: Search },
    { label: 'Healthcare Map', path: '/locations', icon: MapPin, badge: 'Live' },
    { label: 'Appointments', path: '/appointments', icon: Calendar, badge: upcomingAptCount > 0 ? `${upcomingAptCount}` : undefined },
    { label: 'Report Analyzer', path: '/reports/analyzer', icon: FileText, badge: 'AI' },
    { label: 'Health Records', path: '/health-records', icon: FolderHeart },
    { label: 'Medications', path: '/medications', icon: Pill },
    { label: 'Family Health', path: '/family-health', icon: Users },
    { label: '3D Body Explorer', path: '/body-explorer', icon: Activity, badge: '3D' },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? `${unreadCount}` : undefined },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Help & Safety', path: '/help', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`sticky top-0 h-screen flex flex-col bg-[#0B1220] border-r border-slate-800 text-slate-300 transition-all duration-300 z-30 select-none shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-500/20">
            <Activity className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none">
                HEAL<span className="text-teal-400">HEALTH</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                Clinical SaaS Suite
              </span>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden lg:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-colors group-hover:text-teal-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badge === 'AI' || item.badge === '3D'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-teal-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* AI Assistant Quick Pill Card (Expanded mode only) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-slate-900 to-[#101B2D] border border-teal-500/20 text-xs">
          <div className="flex items-center gap-2 text-teal-300 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Symptom Pilot</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
            Need urgent guidance on test findings or specialist matching?
          </p>
          <NavLink
            to="/ai-navigator"
            className="block text-center py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition"
          >
            Start Consult
          </NavLink>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between gap-2">
          <NavLink
            to="/settings"
            className="flex items-center gap-2.5 overflow-hidden flex-1 group"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0] : 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-teal-400">
                  {user?.name || 'Aarav Sharma'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'patient@healhealth.app'}</p>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
