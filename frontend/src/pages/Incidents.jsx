import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../api/client';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function Incidents() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [scope, setScope] = useState('ALL'); // ALL or MINE

  useEffect(() => { api.get('/incidents').then(r => setItems(r.data)); }, []);

  const filtered = items.filter(i => {
    if (filter !== 'ALL' && i.status !== filter) return false;
    if (scope === 'MINE' && i.reportedBy?.id !== user?.userId) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (i.title || '').toLowerCase().includes(s)
        || (i.machine?.name || '').toLowerCase().includes(s);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Incidents</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
            <button onClick={() => setScope('ALL')}
              className={'px-3 py-2 text-sm font-medium ' + (scope === 'ALL' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')}>
              All
            </button>
            <button onClick={() => setScope('MINE')}
              className={'px-3 py-2 text-sm font-medium ' + (scope === 'MINE' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')}>
              Mine
            </button>
          </div>

          <select value={filter} onChange={e => setFilter(e.target.value)} className="input max-w-[160px]">
            <option value="ALL">All statuses</option>
            <option>OPEN</option><option>INVESTIGATING</option>
            <option>RESOLVED</option><option>CLOSED</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500" />
          </div>

          <Link to="/incidents/new" className="btn-primary flex items-center gap-2"><Plus size={16} />Report</Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-3">#</th>
              <th className="text-left px-5 py-3">Title</th>
              <th className="text-left px-5 py-3">Machine</th>
              <th className="text-left px-5 py-3">Priority</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Reported By</th>
              <th className="text-left px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-t hover:bg-slate-50/60">
                <td className="px-5 py-3 text-slate-500">{i.id}</td>
                <td className="px-5 py-3"><Link to={'/incidents/' + i.id} className="text-brand-600 hover:underline">{i.title}</Link></td>
                <td className="px-5 py-3 text-slate-700">{i.machine?.name}</td>
                <td className="px-5 py-3"><PriorityBadge priority={i.priority} /></td>
                <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
                <td className="px-5 py-3 text-slate-600">{i.reportedBy?.fullName}</td>
                <td className="px-5 py-3 text-slate-500">{new Date(i.incidentDate || i.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} className="text-center py-8 text-slate-500">
                {scope === 'MINE' ? "You haven't reported any incidents yet." : 'No incidents match.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}