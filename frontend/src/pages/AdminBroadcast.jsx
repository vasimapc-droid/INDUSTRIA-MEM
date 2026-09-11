import { useState } from 'react';
import { Send, Users, CheckCircle } from 'lucide-react';
import api from '../api/client';

export default function AdminBroadcast() {
  const [form, setForm] = useState({ title: '', message: '', audience: 'ALL' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/admin/notifications/broadcast', form);
      setResult(data);
      setForm({ title: '', message: '', audience: 'ALL' });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Users size={20} /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Send Notification</h2>
          <p className="text-sm text-slate-500">Broadcast a message to users in the plant</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

      {result && (
        <div className="card p-5 border-l-4 border-emerald-500 bg-emerald-50/50">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-emerald-800">Notification sent</p>
              <p className="text-sm text-emerald-700 mt-1">
                Delivered to <strong>{result.sent}</strong> user(s) in the <strong>{result.audience}</strong> audience.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="card p-6 space-y-4">
        <div>
          <label className="label">Audience</label>
          <select className="input" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
            <option value="ALL">All active users</option>
            <option value="TECHNICIANS">All technicians</option>
            <option value="EXPERTS">All experts</option>
            <option value="ADMINS">All admins</option>
          </select>
        </div>
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Shift meeting" maxLength={120} />
        </div>
        <div>
          <label className="label">Message *</label>
          <textarea className="input" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Write your message here..." maxLength={1000} />
          <p className="text-xs text-slate-500 mt-1">{form.message.length}/1000 characters</p>
        </div>
        <button className="btn-primary flex items-center gap-2" disabled={busy}>
          <Send size={16} />{busy ? 'Sending...' : 'Send Notification'}
        </button>
      </form>

      <div className="card p-5 bg-slate-50/50">
        <h3 className="text-sm font-medium text-slate-800 mb-2">How this works</h3>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li>The notification appears instantly in each recipient's bell menu</li>
          <li>Every broadcast is recorded in the Audit Logs</li>
          <li>Recipients see the message on their Notifications page</li>
        </ul>
      </div>
    </div>
  );
}