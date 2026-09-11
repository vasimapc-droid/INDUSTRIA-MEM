import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, AlertTriangle, ShieldCheck, Clock, Mic, FilePlus, Search, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    api.get('/analytics/summary').then(r => setStats(r.data)).catch(() => {});
    api.get('/incidents').then(r => setIncidents(r.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Machines" value={stats.totalMachines ?? '-'} icon={Factory} tone="brand" />
        <StatCard label="Active Incidents" value={stats.activeIncidents ?? '-'} icon={AlertTriangle} tone="amber" />
        <StatCard label="Verified Knowledge" value={stats.verifiedKnowledge ?? '-'} icon={ShieldCheck} tone="green" />
        <StatCard label="Pending Verification" value={stats.pendingVerification ?? '-'} icon={Clock} tone="red" />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/voice-capture" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <Mic className="text-brand-600" size={20} /><span className="text-sm font-medium">Record Experience</span>
          </Link>
          <Link to="/incidents/new" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <FilePlus className="text-brand-600" size={20} /><span className="text-sm font-medium">Report Incident</span>
          </Link>
          <Link to="/knowledge" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <Search className="text-brand-600" size={20} /><span className="text-sm font-medium">Search Knowledge</span>
          </Link>
          <Link to="/ask-expert" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <Users className="text-brand-600" size={20} /><span className="text-sm font-medium">Ask Expert</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="p-5 flex items-center justify-between border-b">
          <h3 className="font-semibold text-slate-800">Recent Incidents</h3>
          <Link to="/incidents" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3">Machine</th>
                <th className="text-left px-5 py-3">Problem</th>
                <th className="text-left px-5 py-3">Priority</th>
                <th className="text-left px-5 py-3">Reported By</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i.id} className="border-t hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-700">{i.machine?.name}</td>
                  <td className="px-5 py-3 text-slate-800">{i.title}</td>
                  <td className="px-5 py-3"><PriorityBadge priority={i.priority} /></td>
                  <td className="px-5 py-3 text-slate-600">{i.reportedBy?.fullName}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(i.incidentDate || i.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-5 py-3"><Link to={'/incidents/' + i.id} className="text-brand-600 hover:underline">View</Link></td>
                </tr>
              ))}
              {!incidents.length && (
                <tr><td colSpan={7} className="text-center text-slate-500 py-8">No incidents yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
