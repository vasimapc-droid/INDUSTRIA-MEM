import { useEffect, useState } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import api from '../api/client';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const { data } = await api.get('/expert-requests/mine');
    setRequests(data);
  };

  useEffect(() => { load(); }, []);

  const statusBadge = (s) => ({
    OPEN: 'bg-amber-100 text-amber-700',
    ANSWERED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-slate-100 text-slate-700'
  }[s] || 'bg-slate-100 text-slate-700');

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><MessageSquare size={20} /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">My Expert Requests</h2>
          <p className="text-sm text-slate-500">Questions you've asked senior engineers</p>
        </div>
      </div>

      {!selected && !requests.length && (
        <div className="card p-8 text-center text-slate-500">No requests yet. Use "Ask an Expert" to send one.</div>
      )}

      {!selected && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className="card p-4 w-full text-left hover:border-brand-500 transition">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{r.subject}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    To {r.expert?.fullName} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + statusBadge(r.status)}>
                  {r.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="card p-6 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{selected.subject}</h3>
                <p className="text-sm text-slate-500">
                  To {selected.expert?.fullName} · {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + statusBadge(selected.status)}>
                {selected.status}
              </span>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs uppercase text-slate-400 tracking-wide mb-2">Your Question</p>
              <p className="text-slate-800 whitespace-pre-line">{selected.question}</p>
            </div>

            {selected.response ? (
              <div className="border-t pt-4 bg-emerald-50/50 -mx-6 px-6 py-4">
                <p className="text-xs uppercase text-emerald-700 tracking-wide mb-2">Expert Response</p>
                <p className="text-slate-800 whitespace-pre-line">{selected.response}</p>
                {selected.respondedAt && (
                  <p className="text-xs text-slate-500 mt-2">{new Date(selected.respondedAt).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <div className="border-t pt-4 text-sm text-slate-500 italic">
                Waiting for expert response...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}