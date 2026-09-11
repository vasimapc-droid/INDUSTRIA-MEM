import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X, Save } from 'lucide-react';
import api from '../api/client';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const { data } = await api.get('/admin/departments');
    setDepartments(data);
  };

  useEffect(() => { load(); }, []);

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const startEdit = (d) => {
    setEditing(d.id);
    setDraft({ name: d.name, description: d.description || '' });
  };

  const saveEdit = async (id) => {
    setBusy(true);
    try {
      await api.put('/admin/departments/' + id, draft);
      setEditing(null);
      await load();
      flash('Department updated');
    } catch (e) { flash(e.response?.data?.error || 'Update failed', 'err'); }
    finally { setBusy(false); }
  };

  const createDept = async () => {
    if (!newDept.name) { flash('Name is required', 'err'); return; }
    setBusy(true);
    try {
      await api.post('/admin/departments', newDept);
      setCreating(false);
      setNewDept({ name: '', description: '' });
      await load();
      flash('Department created');
    } catch (e) { flash(e.response?.data?.error || 'Create failed', 'err'); }
    finally { setBusy(false); }
  };

  const deleteDept = async (d) => {
    if (!confirm('Delete department "' + d.name + '"?')) return;
    try {
      await api.delete('/admin/departments/' + d.id);
      await load();
      flash('Department deleted');
    } catch (e) { flash(e.response?.data?.error || 'Delete failed', 'err'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Departments</h2>
          <p className="text-sm text-slate-500">Organize users and machines by department</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm ' + (msg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {msg.text}
        </div>
      )}

      {creating && (
        <div className="card p-5 border-l-4 border-brand-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">New Department</h3>
            <button onClick={() => setCreating(false)} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Name *</label>
              <input className="input" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} /></div>
            <div><label className="label">Description</label>
              <input className="input" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createDept} disabled={busy} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {busy ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Description</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} className="border-t">
                {editing === d.id ? (
                  <>
                    <td className="px-4 py-2 text-slate-500">{d.id}</td>
                    <td className="px-4 py-2"><input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className="input" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <button onClick={() => saveEdit(d.id)} disabled={busy} className="text-emerald-600 hover:underline text-xs font-medium mr-2">Save</button>
                      <button onClick={() => setEditing(null)} className="text-slate-500 hover:underline text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate-500">{d.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                    <td className="px-4 py-3 text-slate-600">{d.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-slate-500">
                        <button title="Edit" onClick={() => startEdit(d)} className="hover:text-brand-600"><Edit3 size={16} /></button>
                        <button title="Delete" onClick={() => deleteDept(d)} className="hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {!departments.length && <tr><td colSpan={4} className="text-center text-slate-500 py-8">No departments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}