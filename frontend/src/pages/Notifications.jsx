import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../api/client';

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = () => api.get('/notifications').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.patch('/notifications/' + id + '/read');
    load();
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
      {!items.length && <div className="card p-8 text-center text-slate-500">No notifications yet.</div>}
      {items.map(n => (
        <div key={n.id} className={'card p-4 flex items-start gap-3 ' + (!n.isRead ? 'border-l-4 border-brand-500' : '')}>
          <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Bell size={16}/></div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">{n.title}</p>
            <p className="text-sm text-slate-600">{n.message}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
          {!n.isRead && <button onClick={() => markRead(n.id)} className="text-xs text-brand-600 hover:underline">Mark read</button>}
        </div>
      ))}
    </div>
  );
}
