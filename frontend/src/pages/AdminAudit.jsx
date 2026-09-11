import { useEffect, useState } from 'react';
import { Search, Clock, Download, Filter } from 'lucide-react';
import api, { API_BASE } from '../api/client';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const load = async () => {
    const params = {};
    if (actionFilter) params.action = actionFilter;
    const { data } = await api.get('/admin/audit-logs', { params });
    setLogs(data);
  };

  useEffect(() => { load(); }, [actionFilter]);

  const filtered = logs.filter(l => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (l.action || '').toLowerCase().includes(s)
        || (l.userEmail || '').toLowerCase().includes(s)
        || (l.details || '').toLowerCase().includes(s)
        || (l.entityType || '').toLowerCase().includes(s);
  });

  const downloadCsv = () => {
    const token = localStorage.getItem('im_token');
    fetch(API_BASE + '/admin/audit-logs/export', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.csv';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Download failed'));
  };

  const actionColor = (a) => {
    if (!a) return 'bg-slate-100 text-slate-700';
    if (a.includes('CREATE') || a.includes('ACTIVATED')) return 'bg-emerald-100 text-emerald-700';
    if (a.includes('DELETE') || a.includes('DEACTIVATED') || a.includes('REJECT')) return 'bg-red-100 text-red-700';
    if (a.includes('UPDATE') || a.includes('CORRECT')) return 'bg-amber-100 text-amber-700';
    if (a.includes('LOGIN')) return 'bg-blue-100 text-blue-700';
    if (a.includes('APPROVE')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Audit Logs</h2>
          <p className="text-sm text-slate-500">Who did what and when (last 100 events)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Filter size={16} className="text-slate-500" />
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input max-w-[200px]">
              <option value="">All actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search action, user, details"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 min-w-[240px]" />
          </div>
          <button onClick={downloadCsv} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm table-stagger">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Entity</th>
              <th className="text-left px-4 py-3">Details</th>
              <th className="text-left px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.userEmail || '(system)'}</td>
                <td className="px-4 py-3">
                  <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + actionColor(l.action)}>{l.action}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {l.entityType || '-'}{l.entityId ? ' #' + l.entityId : ''}
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{l.details || '-'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{l.ipAddress || '-'}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="text-center text-slate-500 py-8">
                No audit events match. Perform actions (login, create incident, approve knowledge) to generate entries.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}