import { useEffect, useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import api from '../api/client';

export default function AskExpert() {
  const [experts, setExperts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ expertId: '', machineId: '', subject: '', question: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/experts').then(r => setExperts(r.data));
    api.get('/machines').then(r => setMachines(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.expertId) { setError('Please select an expert.'); return; }
    if (!form.subject.trim() || !form.question.trim()) { setError('Subject and question are required.'); return; }

    setBusy(true);
    try {
      const { data } = await api.post('/expert-requests', {
        expertId: Number(form.expertId),
        machineId: form.machineId ? Number(form.machineId) : null,
        subject: form.subject,
        question: form.question
      });
      setSent(data);
      setForm({ expertId: '', machineId: '', subject: '', question: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally { setBusy(false); }
  };

  if (sent) {
    return (
      <div className="max-w-2xl space-y-5">
        <h2 className="text-xl font-semibold text-slate-900">Ask an Expert</h2>
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-3">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <p className="text-emerald-700 font-medium text-lg">Request sent to the expert</p>
          <p className="text-slate-500 text-sm mt-2">
            Subject: <strong>{sent.subject}</strong>
          </p>
          <p className="text-slate-500 text-sm">
            You will be notified when they respond.
          </p>
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={() => setSent(null)} className="btn-primary">Ask Another</button>
            <a href="/my-requests" className="btn-secondary">View My Requests</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-semibold text-slate-900">Ask an Expert</h2>
      <p className="text-sm text-slate-500">Send a question to a senior engineer. You'll be notified when they respond.</p>

      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <form onSubmit={submit} className="card p-6 space-y-4">
        <div>
          <label className="label">Expert *</label>
          <select className="input" value={form.expertId} onChange={e => setForm({ ...form, expertId: e.target.value })}>
            <option value="">Select an expert</option>
            {experts.map(e => <option key={e.id} value={e.id}>{e.fullName} â€” {e.department}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Machine (optional)</label>
          <select className="input" value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })}>
            <option value="">None</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subject *</label>
          <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. CNC C-12 vibration after realignment" />
        </div>
        <div>
          <label className="label">Question *</label>
          <textarea className="input" rows={5} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="Describe what you've tried, what you observed, and what you need help with." />
        </div>
        <button className="btn-primary flex items-center gap-2" disabled={busy}>
          <Send size={16} />{busy ? 'Sending...' : 'Send Request'}
        </button>
      </form>
    </div>
  );
}