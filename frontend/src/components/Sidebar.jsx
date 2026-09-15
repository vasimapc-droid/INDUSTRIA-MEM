import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Factory, AlertTriangle, BookOpen, Bot, Users,
  Bell, BarChart3, User, Settings, Mic, ShieldCheck, Settings2,
  Inbox, MessageSquare, Bookmark, Award, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();

  const mainItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/machines', label: 'Machines', icon: Factory },
    { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/ask-ai', label: 'Ask AI', icon: Bot },
    { to: '/notifications', label: 'Notifications', icon: Bell }
  ];

  const roleItems = {
    TECHNICIAN: [
      { to: '/voice-capture', label: 'Voice Capture', icon: Mic },
      { to: '/ask-expert', label: 'Ask an Expert', icon: Users },
      { to: '/my-requests', label: 'My Requests', icon: MessageSquare },
      { to: '/my-bookmarks', label: 'My Bookmarks', icon: Bookmark },
      { to: '/expert-finder', label: 'Find Expert', icon: Users }
    ],
    EXPERT: [
      { to: '/expert-requests', label: 'Expert Requests', icon: Inbox },
      { to: '/pending-verification', label: 'Verification', icon: ShieldCheck },
      { to: '/voice-capture', label: 'Voice Capture', icon: Mic },
      { to: '/my-bookmarks', label: 'My Bookmarks', icon: Bookmark },
      { to: '/expert-profile', label: 'Expert Profile', icon: Award }
    ],
    ADMIN: [
      { to: '/admin', label: 'Administration', icon: Settings2 },
      { to: '/expert-requests', label: 'Expert Requests', icon: Inbox },
      { to: '/pending-verification', label: 'Verification', icon: ShieldCheck },
      { to: '/reports', label: 'Reports', icon: BarChart3 }
    ]
  };

  const tailItems = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const roleLabel = {
    TECHNICIAN: 'Technician',
    EXPERT: 'Senior Engineer',
    ADMIN: 'Plant Manager'
  }[user?.role] || user?.role;

  const initials = (user?.fullName || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const renderSection = (label, items) => (
    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">{label}</p>
      <div className="space-y-0.5">
        {items.map(({ to, label: itemLabel, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate}
            className={({ isActive }) =>
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition relative ' +
              (isActive
                ? 'bg-brand-600 text-white font-medium shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white')}>
            <Icon size={18} className="flex-shrink-0" />
            <span className="truncate">{itemLabel}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="w-72 lg:w-64 h-full bg-navy-900 text-white flex flex-col">
      <div className="px-5 py-4 lg:py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow">IM</div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">INDUSTRIA-MEM</h1>
            <p className="text-[10px] text-slate-400">Knowledge Continuity</p>
          </div>
        </div>
        <button onClick={onNavigate} className="lg:hidden p-1 rounded hover:bg-white/10" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {renderSection('Main', mainItems)}
        {renderSection('Tools', roleItems[user?.role] || [])}
        {renderSection('Account', tailItems)}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user?.fullName || 'Guest'}</p>
            <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}