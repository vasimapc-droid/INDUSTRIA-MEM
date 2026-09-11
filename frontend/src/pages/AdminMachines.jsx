import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X, Save, Search } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function AdminMachines() {
  const [machines, setMachines] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [creating, setCreating] = useState(false);
  const [newMachine, setNewMachine] = useState({
    machineCode: '', name: '', machineType: '', status: 'OPERATIONAL',
    manufacturer: '', model: '', serialNumber: '', location: '', productionLine: '',
    departmentId: ''
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const { data } = await api.get('/admin/machines');
    setMachines(data);
  };

  useEffect(() => {
    load();
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const filtered = machines.filter(m => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (m.machineCode || '').toLowerCase().includes(s)
        || (m.name || '').toLowerCase().includes(s)
        || (m.machineType || '').toLowerCase().includes(s);
  });

  const startEdit = (m) => {
    setEditing(m.id);
    setDraft({
      machineCode: m.machineCode || '',
      name: m.name || '',
      machineType: m.machineType || '',
      status: m.status || 'OPERATIONAL',
      manufacturer: m.manufacturer || '',
      model: m.model || '',
      serialNumber: m.serialNumber || '',
      location: m.location || '',
      productionLine: m.productionLine || '',
      departmentId: m.department?.id || 0
    });
  };

  const saveEdit = async (id) => {
    setBusy(true);
    try {
      const payload = { ...draft };
      if (payload.departmentId) {
        payload.department = { id: payload.departmentId };
      } else {
        payload.department = null;
      }
      delete payload.departmentId;
      await api.put('/admin/machines/' + id, payload);
      setEditing(null);
      await load();
      flash('Machine updated');
    } catch (e) {
      flash(e.response?.data?.error || 'Update failed', 'err');
    } finally { setBusy(false); }
  };

  const createMachine = async () => {
    if (!newMachine.machineCode.trim() || !newMachine.name.trim()) {
      flash('Machine code and name are required', 'err');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...newMachine };
      if (payload.departmentId) payload.department = { id: payload.departmentId };
      delete payload.departmentId;
      await api.post('/admin/machines', payload);
      setCreating(false);
      setNewMachine({
        machineCode: '', name: '', machineType: '', status: 'OPERATIONAL',
        manufacturer: '', model: '', serialNumber: '', location: '', productionLine: '',
        departmentId: ''
      });
      await load();
      flash('Machine created');
    } catch (e) {
      flash(e.response?.data?.error || 'Create failed', 'err');
    } finally { setBusy(false); }
  };

  const deleteMachine = async (m) => {
    if (!confirm('Delete machine "' + m.name + '"? This cannot be undone.')) return;
    try {
      await api.delete('/admin/machines/' + m.id);
      await load();
      flash('Machine deleted');
    } catch (e) {
      flash(e.response?.data?.error || 'Delete failed', 'err');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Machine Management</h2>
          <p className="text-sm text-slate-500">Add, edit, and remove machines</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search machines"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500" />
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Machine
          </button>
        </div>
      </div>

      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm ' + (msg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {msg.text}
        </div>
      )}

      {creating && (
        <div className="card p-5 border-l-4 border-brand-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">New Machine</h3>
            <button onClick={() => setCreating(false)} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Machine Code *</label>
              <input className="input" value={newMachine.machineCode} onChange={e => setNewMachine({ ...newMachine, machineCode: e.target.value })} placeholder="e.g. CNC-C-20" /></div>
            <div><label className="label">Name *</label>
              <input className="input" value={newMachine.name} onChange={e => setNewMachine({ ...newMachine, name: e.target.value })} /></div>
            <div><label className="label">Type</label>
              <input className="input" value={newMachine.machineType} onChange={e => setNewMachine({ ...newMachine, machineType: e.target.value })} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={newMachine.status} onChange={e => setNewMachine({ ...newMachine, status: e.target.value })}>
                <option>OPERATIONAL</option><option>MAINTENANCE</option><option>DOWN</option>
              </select></div>
            <div><label className="label">Manufacturer</label>
              <input className="input" value={newMachine.manufacturer} onChange={e => setNewMachine({ ...newMachine, manufacturer: e.target.value })} /></div>
            <div><label className="label">Model</label>
              <input className="input" value={newMachine.model} onChange={e => setNewMachine({ ...newMachine, model: e.target.value })} /></div>
            <div><label className="label">Serial Number</label>
              <input className="input" value={newMachine.serialNumber} onChange={e => setNewMachine({ ...newMachine, serialNumber: e.target.value })} /></div>
            <div><label className="label">Production Line</label>
              <input className="input" value={newMachine.productionLine} onChange={e => setNewMachine({ ...newMachine, productionLine: e.target.value })} /></div>
            <div><label className="label">Location</label>
              <input className="input" value={newMachine.location} onChange={e => setNewMachine({ ...newMachine, location: e.target.value })} /></div>
            <div><label className="label">Department</label>
              <select className="input" value={newMachine.departmentId} onChange={e => setNewMachine({ ...newMachine, departmentId: e.target.value })}>
                <option value="">None</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createMachine} disabled={busy} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {busy ? 'Creating...' : 'Create Machine'}
            </button>
            <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Line</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t">
                {editing === m.id ? (
                  <>
                    <td className="px-4 py-2"><input className="input" value={draft.machineCode} onChange={e => setDraft({ ...draft, machineCode: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className="input" value={draft.machineType} onChange={e => setDraft({ ...draft, machineType: e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <select className="input" value={draft.departmentId} onChange={e => setDraft({ ...draft, departmentId: Number(e.target.value) })}>
                        <option value={0}>None</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2"><input className="input" value={draft.productionLine} onChange={e => setDraft({ ...draft, productionLine: e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <select className="input" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
                        <option>OPERATIONAL</option><option>MAINTENANCE</option><option>DOWN</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => saveEdit(m.id)} disabled={busy} className="text-emerald-600 hover:underline text-xs font-medium mr-2">Save</button>
                      <button onClick={() => setEditing(null)} className="text-slate-500 hover:underline text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.machineCode}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                    <td className="px-4 py-3 text-slate-600">{m.machineType || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{m.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{m.productionLine || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-slate-500">
                        <button title="Edit" onClick={() => startEdit(m)} className="hover:text-brand-600"><Edit3 size={16} /></button>
                        <button title="Delete" onClick={() => deleteMachine(m)} className="hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} className="text-center text-slate-500 py-8">No machines match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}