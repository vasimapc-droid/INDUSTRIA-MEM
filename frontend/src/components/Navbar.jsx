import { Bell, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-slate-800 font-semibold">Welcome back, {user?.fullName}</h2>
        <p className="text-xs text-slate-500">{roleLabel[user?.role] || user?.role}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell size={20} className="text-slate-600" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
