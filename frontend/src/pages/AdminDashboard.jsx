import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, Users, ShieldCheck, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 fade-seq">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plant Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Plant-wide metrics, activity and knowledge health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Machines" value={data.totalMachines ?? '-'} icon={Factory} tone="brand" />
        <StatCard label="Total Users" value={data.totalUsers ?? '-'} icon={Users} tone="green" />
        <StatCard label="Pending Verification" value={data.pendingVerification ?? '-'} icon={ShieldCheck} tone="amber" />
        <StatCard label="Active Incidents" value={data.activeIncidents ?? '-'} icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/admin" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition">
          <p className="text-sm font-medium text-slate-800">Administration</p>
          <p className="text-xs text-slate-500 mt-1">Users Ã‚Â· Departments</p>
        </Link>
        <Link to="/reports" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition">
          <p className="text-sm font-medium text-slate-800">Reports</p>
          <p className="text-xs text-slate-500 mt-1">Analytics & charts</p>
        </Link>
        <Link to="/pending-verification" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition">
          <p className="text-sm font-medium text-slate-800">Verification</p>
          <p className="text-xs text-slate-500 mt-1">{data.pendingVerification ?? 0} pending</p>
        </Link>
        <Link to="/incidents" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition">
          <p className="text-sm font-medium text-slate-800">Incidents</p>
          <p className="text-xs text-slate-500 mt-1">{data.activeIncidents ?? 0} active</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">Recent Incidents</h3>
            <Link to="/incidents" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Machine</th>
                  <th className="text-left px-4 py-3">Priority</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.recentIncidents || []).map(i => (
                  <tr key={i.id} className="border-t hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={'/incidents/' + i.id} className="text-brand-600 hover:underline">{i.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{i.machine?.name || '-'}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={i.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
                {!(data.recentIncidents || []).length && (
                  <tr><td colSpan={4} className="text-center text-slate-500 py-8">No incidents yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">Recurring Problems</h3>
            <span className="text-xs text-slate-500">Root causes appearing 2+ times</span>
          </div>
          <div className="divide-y">
            {(data.recurringProblems || []).map((p, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-sm text-slate-800">{p.rootCause}</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">{p.count}Ãƒâ€”</span>
              </div>
            ))}
            {!(data.recurringProblems || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No recurring problems detected yet.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">Knowledge Gaps</h3>
            <span className="text-xs text-slate-500">Machines with no verified knowledge</span>
          </div>
          <div className="divide-y">
            {(data.knowledgeGaps || []).map((g, i) => (
              <Link key={i} to={'/machines/' + g.id} className="block p-4 hover:bg-slate-50/60 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{g.name}</p>
                  <p className="text-xs text-slate-500">{g.code}</p>
                </div>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Needs knowledge</span>
              </Link>
            ))}
            {!(data.knowledgeGaps || []).length && (
              <div className="p-8 text-center text-emerald-600 text-sm">
                All machines have verified knowledge.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">Recent Activity (Audit)</h3>
            <Link to="/admin" className="text-sm text-brand-600 hover:underline">Full log</Link>
          </div>
          <div className="divide-y">
            {(data.recentAudit || []).map(a => (
              <div key={a.id} className="p-4 flex items-start gap-3">
                <TrendingUp size={14} className="text-brand-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{a.action}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{a.details}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.userEmail || '(system)'} Ã‚Â· {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
            {!(data.recentAudit || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No activity yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}