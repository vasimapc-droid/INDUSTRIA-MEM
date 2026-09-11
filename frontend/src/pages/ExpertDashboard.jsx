import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Inbox, BookOpen, Award, CheckCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

export default function ExpertDashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get('/dashboard/expert').then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 fade-seq">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Expert Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Verification queue, expert requests and your contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard label="Pending Verification" value={data.pendingVerification ?? '-'} icon={ShieldCheck} tone="amber" />
        <StatCard label="Open Expert Requests" value={data.openRequests ?? '-'} icon={Inbox} tone="red" />
        <StatCard label="Knowledge I Verified" value={data.myVerifications ?? '-'} icon={Award} tone="green" />
        <StatCard label="Verified Knowledge (Total)" value={data.totalIVerified ?? '-'} icon={BookOpen} tone="brand" />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/pending-verification" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <ShieldCheck className="text-brand-600" size={20} /><span className="text-sm font-medium">Verify Knowledge</span>
          </Link>
          <Link to="/expert-requests" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <Inbox className="text-brand-600" size={20} /><span className="text-sm font-medium">Expert Inbox</span>
          </Link>
          <Link to="/knowledge" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <BookOpen className="text-brand-600" size={20} /><span className="text-sm font-medium">Knowledge Base</span>
          </Link>
          <Link to="/voice-capture" className="p-4 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex items-center gap-3">
            <CheckCircle className="text-brand-600" size={20} /><span className="text-sm font-medium">Add Experience</span>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">Pending Verification</h3>
            <Link to="/pending-verification" className="text-sm text-brand-600 hover:underline">Open queue</Link>
          </div>
          <div className="divide-y">
            {(data.recentPending || []).map(k => (
              <Link key={k.id} to="/pending-verification" className="block p-4 hover:bg-slate-50/60">
                <p className="font-medium text-slate-800 text-sm">{k.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {k.machine?.name} Ã‚Â· by {k.submittedBy?.fullName} Ã‚Â· {new Date(k.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
            {!(data.recentPending || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">Nothing to verify right now.</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">Recent Expert Requests</h3>
            <Link to="/expert-requests" className="text-sm text-brand-600 hover:underline">Open inbox</Link>
          </div>
          <div className="divide-y">
            {(data.recentRequests || []).map(r => (
              <Link key={r.id} to="/expert-requests" className="block p-4 hover:bg-slate-50/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{r.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">From {r.requester?.fullName} Ã‚Â· {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
            {!(data.recentRequests || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">No requests yet.</div>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="p-5 flex items-center justify-between border-b">
            <h3 className="font-semibold text-slate-800">My Recent Verifications</h3>
            <Link to="/knowledge" className="text-sm text-brand-600 hover:underline">View knowledge base</Link>
          </div>
          <div className="divide-y">
            {(data.myRecentVerifications || []).map(k => (
              <Link key={k.id} to={'/knowledge/' + k.id} className="block p-4 hover:bg-slate-50/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{k.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{k.machine?.name} Ã‚Â· {new Date(k.verifiedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Verified
                  </span>
                </div>
              </Link>
            ))}
            {!(data.myRecentVerifications || []).length && (
              <div className="p-8 text-center text-slate-500 text-sm">You haven't verified any knowledge yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}