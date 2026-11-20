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
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

export const AppSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, appointments } = useApp();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const upcomingAptCount = appointments.filter((a) => a.status === 'upcoming').length;

  const sections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'Care',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Find Doctors', path: '/doctors', icon: Search },
        { label: 'Healthcare Map', path: '/locations', icon: MapPin },
        {
          label: 'Appointments',
          path: '/appointments',
          icon: Calendar,
          badge: upcomingAptCount > 0 ? `${upcomingAptCount}` : undefined,
        },
      ],
    },
    {
      title: 'Health Tools',
      items: [
        { label: 'AI Navigator', path: '/ai-navigator', icon: Bot, badge: 'AI' },
        { label: 'Report Analyzer', path: '/reports/analyzer', icon: FileText, badge: 'AI' },
        { label: 'Body Explorer', path: '/body-explorer', icon: Activity },
        { label: 'Medications', path: '/medications', icon: Pill },
      ],
    },
    {
      title: 'Records & Account',
      items: [
        { label: 'Health Records', path: '/health-records', icon: FolderHeart },
        { label: 'Family Health', path: '/family-health', icon: Users },
        {
          label: 'Notifications',
          path: '/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? `${unreadCount}` : undefined,
        },
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Help & Safety', path: '/help', icon: HelpCircle },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`sticky top-0 h-screen flex flex-col bg-white text-ink-soft transition-all duration-300 z-30 select-none shrink-0 border-r border-hairline ${
        isCollapsed ? 'w-[76px]' : 'w-[256px]'
      }`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-hairline shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center shrink-0">
            <Stethoscope className="w-4.5 h-4.5 text-brand-400" strokeWidth={2.2} />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-ink text-[15px] tracking-tight leading-none">
              HEAL<span className="text-brand-600">HEALTH</span>
            </span>
          )}
        </NavLink>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 transition hidden lg:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav sections */}
      <div className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                        isActive
                          ? 'bg-brand-50 text-brand-800 font-semibold'
                          : 'text-ink-soft hover:text-ink hover:bg-slate-50'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                              item.badge === 'AI'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-brand-600 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute left-3 top-1.5 w-1.5 h-1.5 rounded-full bg-brand-600" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AI entry point — one restrained card */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-ivory border border-hairline text-xs">
          <div className="flex items-center gap-2 text-ink font-semibold mb-1">
            <Bot className="w-3.5 h-3.5 text-brand-600" />
            <span>AI Healthcare Navigator</span>
          </div>
          <p className="text-[11px] text-ink-soft mb-2.5 leading-relaxed">
            Not sure which specialist to see? Describe your symptoms and get guidance.
          </p>
          <NavLink
            to="/ai-navigator"
            className="block text-center py-2 bg-ink hover:bg-deep-2 text-white rounded-lg font-semibold transition"
          >
            Ask the Navigator
          </NavLink>
        </div>
      )}

      {/* User footer */}
      <div className="p-3 border-t border-hairline">
        <div className="flex items-center justify-between gap-2">
          <NavLink to="/settings" className="flex items-center gap-2.5 overflow-hidden flex-1 group">
            <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0] : 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-ink truncate group-hover:text-brand-700">
                  {user?.name || 'Guest User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'patient@healhealth.app'}</p>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
