import { useEffect, useState } from 'react';
import { Check, X, Edit3 } from 'lucide-react';
import api from '../api/client';

export default function PendingVerification() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = () => api.get('/knowledge/pending').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const approve = async (id, withEdit) => {
    try {
      await api.patch('/knowledge/' + id + '/approve', withEdit ? draft : {});
      setEditing(null); setDraft({}); load();
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const reject = async (id) => {
    const comment = prompt('Reason for rejection?');
    if (comment === null) return;
    await api.patch('/knowledge/' + id + '/reject', { expertComment: comment });
    load();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-slate-900">Pending Verification</h2>
      {!items.length && <div className="card p-8 text-center text-slate-500">No pending items</div>}
      {items.map(k => (
        <div key={k.id} className="card p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">{k.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {k.machine?.name} - submitted by {k.submittedBy?.fullName} - {new Date(k.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(editing===k.id?null:k.id); setDraft({
                rootCause: k.rootCause, solution: k.solution,
                troubleshootingSteps: k.troubleshootingSteps,
                safetyNotes: k.safetyNotes, expertComment: k.expertComment }) }}
                className="btn-secondary flex items-center gap-2"><Edit3 size={14}/>Correct</button>
              <button onClick={() => approve(k.id, editing === k.id)} className="btn-primary flex items-center gap-2"><Check size={14}/>Approve</button>
              <button onClick={() => reject(k.id)} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium flex items-center gap-2"><X size={14}/>Reject</button>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
            {editing === k.id ? (
              <>
                <div><label className="label">Root Cause</label>
                  <textarea className="input" rows={2} value={draft.rootCause || ''} onChange={e=>setDraft({...draft, rootCause:e.target.value})}/></div>
                <div><label className="label">Solution</label>
                  <textarea className="input" rows={2} value={draft.solution || ''} onChange={e=>setDraft({...draft, solution:e.target.value})}/></div>
                <div className="md:col-span-2"><label className="label">Troubleshooting Steps</label>
                  <textarea className="input" rows={3} value={draft.troubleshootingSteps || ''} onChange={e=>setDraft({...draft, troubleshootingSteps:e.target.value})}/></div>
                <div className="md:col-span-2"><label className="label">Safety Notes</label>
                  <textarea className="input" rows={2} value={draft.safetyNotes || ''} onChange={e=>setDraft({...draft, safetyNotes:e.target.value})}/></div>
                <div className="md:col-span-2"><label className="label">Expert Comment</label>
                  <textarea className="input" rows={2} value={draft.expertComment || ''} onChange={e=>setDraft({...draft, expertComment:e.target.value})}/></div>
              </>
            ) : (
              <>
                {[['Problem',k.problem],['Symptoms',k.symptoms],['Root Cause',k.rootCause],
                  ['Solution',k.solution],['Troubleshooting',k.troubleshootingSteps]].map(([l,v])=> v ? (
                    <div key={l}><p className="text-xs text-slate-500">{l}</p><p className="text-slate-800 whitespace-pre-line">{v}</p></div>
                ) : null)}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
