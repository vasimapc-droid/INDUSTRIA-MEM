import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FilePlus, Search, Mic, MessageSquare, BookOpen, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

export default function TechnicianDashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get('/dashboard/technician').then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Technician Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your incidents, requests and knowledge at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="My Open Incidents" value={data.myOpenIncidents ?? '-'} icon={AlertTriangle} tone="amber" />
        <StatCard label="Reported (30d)" value={data.myRecentReports ?? '-'} icon={FilePlus} tone="brand" />
        <StatCard label="Pending Requests" value={data.myPendingRequests ?? '-'} icon={Clock} tone="red" />
        <StatCard label="Verified Knowledge" value={data.verifiedKnowledgeCount ?? '-'} icon={BookOpen} tone="green" />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/incidents/new" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <FilePlus className="text-brand-600" size={20} /><span className="text-sm font-medium">Report Incident</span>
          </Link>
          <Link to="/voice-capture" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <Mic className="text-brand-600" size={20} /><span className="text-sm font-medium">Record Experience</span>
          </Link>
          <Link to="/knowledge" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <Search className="text-brand-600" size={20} /><span className="text-sm font-medium">Search Knowledge</span>
          </Link>
          <Link to="/ask-expert" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <MessageSquare className="text-brand-600" size={20} /><span className="text-sm font-medium">Ask Expert</span>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">My Recent Incidents</h3>
            <Link to="/incidents" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {(data.myRecentIncidents || []).map(i => (
              <Link key={i.id} to={'/incidents/' + i.id} className="block p-4 hover:bg-slate-50/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{i.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{i.machine?.name} · {new Date(i.incidentDate || i.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <PriorityBadge priority={i.priority} />
                    <StatusBadge status={i.status} />
                  </div>
                </div>
              </Link>
            ))}
            {!(data.myRecentIncidents || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No incidents yet. <Link to="/incidents/new" className="text-brand-600 hover:underline">Report one</Link>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">My Recent Expert Requests</h3>
            <Link to="/my-requests" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {(data.myRecentRequests || []).map(r => (
              <Link key={r.id} to="/my-requests" className="block p-4 hover:bg-slate-50/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{r.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">To {r.expert?.fullName} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
            {!(data.myRecentRequests || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No requests yet. <Link to="/ask-expert" className="text-brand-600 hover:underline">Ask an expert</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}