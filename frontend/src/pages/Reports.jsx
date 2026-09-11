import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { Download, Filter } from 'lucide-react';
import api, { API_BASE } from '../api/client';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [summary, setSummary] = useState({});
  const [byMachine, setByMachine] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [experts, setExperts] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [range, setRange] = useState('all');

  const load = () => {
    const params = range !== 'all' ? { range } : {};
    api.get('/analytics/summary', { params }).then(r => setSummary(r.data));
    api.get('/analytics/incidents-by-machine').then(r => setByMachine(r.data));
    api.get('/analytics/incidents-by-priority').then(r => setByPriority(r.data));
    api.get('/analytics/incidents-by-status').then(r => setByStatus(r.data));
    api.get('/analytics/monthly-growth').then(r => setMonthly(r.data));
    api.get('/analytics/expert-contributions').then(r => setExperts(r.data));
    api.get('/analytics/top-recurring').then(r => setRecurring(r.data));
  };

  useEffect(() => { load(); }, [range]);

  const downloadCsv = (type) => {
    const token = localStorage.getItem('im_token');
    fetch(API_BASE + '/analytics/export/' + type, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type + '.csv';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Download failed'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Plant metrics, trends and exports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select value={range} onChange={e => setRange(e.target.value)} className="input max-w-[160px]">
              <option value="all">All time</option>
              <option value="1y">Last 12 months</option>
              <option value="90d">Last 90 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <button onClick={() => downloadCsv('incidents')} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Incidents CSV
          </button>
          <button onClick={() => downloadCsv('knowledge')} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Knowledge CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          ['Total Incidents', summary.totalIncidents, 'brand'],
          ['Total Knowledge', summary.totalKnowledge, 'brand'],
          ['Verified', summary.verifiedKnowledge, 'green'],
          ['Pending', summary.pendingVerification, 'amber'],
          ['Active Incidents', summary.activeIncidents, 'red']
        ].map(([k, v, tone]) => (
          <div key={k} className="card p-5">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{v ?? '-'}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Monthly Knowledge Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Incidents by Machine</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byMachine}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Expert Contributions</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={experts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {!experts.length && <p className="text-sm text-slate-500 text-center mt-2">No expert contributions yet.</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Incidents by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="name" outerRadius={90} label>
                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Incidents by Priority</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byPriority} dataKey="count" nameKey="name" outerRadius={90} label>
                {byPriority.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Top Recurring Problems</h3>
          {recurring.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={recurring} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="name" fontSize={11} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm text-center">
              No recurring problems detected yet.<br />Root causes appearing 2+ times will show here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}