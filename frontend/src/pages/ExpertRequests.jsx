import { useEffect, useState } from 'react';
import { Inbox, Send, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import api from '../api/client';

export default function ExpertRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const { data } = await api.get('/expert-requests/inbox');
    setRequests(data);
  };

  useEffect(() => { load(); }, []);

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const respond = async () => {
    if (!response.trim()) { flash('Response cannot be empty', 'err'); return; }
    setBusy(true);
    try {
      await api.post('/expert-requests/' + selected.id + '/respond', { response });
      flash('Response sent');
      setResponse('');
      setSelected(null);
      await load();
    } catch (e) {
      flash(e.response?.data?.error || 'Failed to send', 'err');
    } finally { setBusy(false); }
  };

  const statusBadge = (s) => ({
    OPEN: 'bg-amber-100 text-amber-700',
    ANSWERED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-slate-100 text-slate-700'
  }[s] || 'bg-slate-100 text-slate-700');

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Inbox size={20} /></div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Expert Requests</h2>
            <p className="text-sm text-slate-500">Questions sent to you by technicians</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm ' + (msg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {msg.text}
        </div>
      )}

      {!selected && !requests.length && (
        <div className="card p-8 text-center text-slate-500">No requests yet.</div>
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
                    From {r.requester?.fullName} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{r.question}</p>
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
          <button onClick={() => { setSelected(null); setResponse(''); }} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft size={14} /> Back to inbox
          </button>

          <div className="card p-6 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{selected.subject}</h3>
                <p className="text-sm text-slate-500">
                  From {selected.requester?.fullName} · {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + statusBadge(selected.status)}>
                {selected.status}
              </span>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs uppercase text-slate-400 tracking-wide mb-2">Question</p>
              <p className="text-slate-800 whitespace-pre-line">{selected.question}</p>
            </div>

            {selected.status === 'OPEN' && (
              <div className="border-t pt-4 space-y-3">
                <label className="label">Your Response</label>
                <textarea className="input" rows={5} value={response} onChange={e => setResponse(e.target.value)}
                  placeholder="Answer the question clearly. Include torque specs, steps, references if applicable." />
                <button onClick={respond} disabled={busy} className="btn-primary flex items-center gap-2">
                  <Send size={16} />{busy ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            )}

            {selected.response && (
              <div className="border-t pt-4">
                <p className="text-xs uppercase text-slate-400 tracking-wide mb-2 flex items-center gap-1">
                  <CheckCircle size={14} className="text-emerald-600" /> Your Response
                </p>
                <p className="text-slate-800 whitespace-pre-line">{selected.response}</p>
                {selected.respondedAt && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Clock size={12} /> {new Date(selected.respondedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}