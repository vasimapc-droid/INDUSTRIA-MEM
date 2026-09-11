import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        if (mounted) setUnread(data);
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const roleLabel = { TECHNICIAN: 'Technician', EXPERT: 'Senior Engineer', ADMIN: 'Plant Manager' };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors">
      <div>
        <h2 className="text-slate-800 dark:text-slate-100 font-semibold">Welcome back, {user?.fullName}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel[user?.role] || user?.role}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Toggle theme">
          {theme === 'dark'
            ? <Sun size={20} className="text-amber-400" />
            : <Moon size={20} className="text-slate-600" />}
        </button>

        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell size={20} className="text-slate-600 dark:text-slate-300" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}