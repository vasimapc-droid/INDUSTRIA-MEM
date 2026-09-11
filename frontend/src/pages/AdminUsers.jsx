import { useEffect, useState } from 'react';
import { Search, Plus, Edit3, UserX, UserCheck, Trash2, X, Save } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [q, setQ] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '', password: '', fullName: '', employeeId: '', phone: '',
    departmentId: '', roleName: 'TECHNICIAN'
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  useEffect(() => {
    load();
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
    api.get('/admin/roles').then(r => setRoles(r.data)).catch(() => {});
  }, []);

  const filtered = users.filter(u => {
    if (filterRole !== 'ALL' && u.roleName !== filterRole) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (u.email || '').toLowerCase().includes(s)
        || (u.fullName || '').toLowerCase().includes(s)
        || (u.employeeId || '').toLowerCase().includes(s);
  });

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const startEdit = (u) => {
    setEditing(u.id);
    setDraft({
      fullName: u.fullName || '',
      employeeId: u.employeeId || '',
      phone: u.phone || '',
      departmentId: u.departmentId || 0,
      roleName: u.roleName || 'TECHNICIAN',
      active: u.active,
      newPassword: ''
    });
  };

  const saveEdit = async (id) => {
    setBusy(true);
    try {
      await api.put('/admin/users/' + id, draft);
      setEditing(null);
      await load();
      flash('User updated');
    } catch (e) {
      flash(e.response?.data?.error || 'Update failed', 'err');
    } finally { setBusy(false); }
  };

  const toggleActive = async (u) => {
    if (!confirm((u.active ? 'Deactivate' : 'Activate') + ' ' + u.email + '?')) return;
    try {
      await api.patch('/admin/users/' + u.id + '/toggle-active');
      await load();
      flash('User ' + (u.active ? 'deactivated' : 'activated'));
    } catch (e) { flash(e.response?.data?.error || 'Failed', 'err'); }
  };

  const deleteUser = async (u) => {
    if (!confirm('Delete ' + u.email + '? This cannot be undone.')) return;
    try {
      await api.delete('/admin/users/' + u.id);
      await load();
      flash('User deleted');
    } catch (e) { flash(e.response?.data?.error || 'Delete failed', 'err'); }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      flash('Email, password, and name are required', 'err');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...newUser, departmentId: newUser.departmentId ? Number(newUser.departmentId) : null };
      await api.post('/admin/users', payload);
      setCreating(false);
      setNewUser({ email: '', password: '', fullName: '', employeeId: '', phone: '', departmentId: '', roleName: 'TECHNICIAN' });
      await load();
      flash('User created');
    } catch (e) {
      flash(e.response?.data?.error || 'Create failed', 'err');
    } finally { setBusy(false); }
  };

  const roleColor = (r) => ({
    ADMIN: 'bg-red-100 text-red-700',
    EXPERT: 'bg-purple-100 text-purple-700',
    TECHNICIAN: 'bg-blue-100 text-blue-700'
  }[r] || 'bg-slate-100 text-slate-700');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">Add, edit roles, activate/deactivate users</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="input max-w-[160px]">
            <option value="ALL">All roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, ID"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500" />
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add User
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
            <h3 className="font-semibold text-slate-800">New User</h3>
            <button onClick={() => setCreating(false)} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Email *</label>
              <input className="input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} /></div>
            <div><label className="label">Password *</label>
              <input className="input" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} /></div>
            <div><label className="label">Full Name *</label>
              <input className="input" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} /></div>
            <div><label className="label">Employee ID</label>
              <input className="input" value={newUser.employeeId} onChange={e => setNewUser({ ...newUser, employeeId: e.target.value })} /></div>
            <div><label className="label">Phone</label>
              <input className="input" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} /></div>
            <div><label className="label">Department</label>
              <select className="input" value={newUser.departmentId} onChange={e => setNewUser({ ...newUser, departmentId: e.target.value })}>
                <option value="">None</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
            <div><label className="label">Role</label>
              <select className="input" value={newUser.roleName} onChange={e => setNewUser({ ...newUser, roleName: e.target.value })}>
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createUser} disabled={busy} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {busy ? 'Creating...' : 'Create User'}
            </button>
            <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Emp ID</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={'border-t ' + (!u.active ? 'opacity-60' : '')}>
                {editing === u.id ? (
                  <>
                    <td className="px-4 py-2"><input className="input" value={draft.fullName} onChange={e => setDraft({ ...draft, fullName: e.target.value })} /></td>
                    <td className="px-4 py-2 text-slate-500">{u.email}</td>
                    <td className="px-4 py-2"><input className="input" value={draft.employeeId} onChange={e => setDraft({ ...draft, employeeId: e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <select className="input" value={draft.departmentId} onChange={e => setDraft({ ...draft, departmentId: Number(e.target.value) })}>
                        <option value={0}>None</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className="input" value={draft.roleName} onChange={e => setDraft({ ...draft, roleName: e.target.value })}>
                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Active
                      </label>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => saveEdit(u.id)} disabled={busy} className="text-emerald-600 hover:underline text-xs font-medium mr-2">Save</button>
                      <button onClick={() => setEditing(null)} className="text-slate-500 hover:underline text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-slate-800">{u.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{u.employeeId || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{u.departmentName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + roleColor(u.roleName)}>{u.roleName}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.active ? <span className="text-emerald-600 text-xs font-medium">Active</span>
                        : <span className="text-slate-400 text-xs font-medium">Inactive</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-slate-500">
                        <button title="Edit" onClick={() => startEdit(u)} className="hover:text-brand-600"><Edit3 size={16} /></button>
                        <button title={u.active ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(u)} className="hover:text-amber-600">
                          {u.active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button title="Delete" onClick={() => deleteUser(u)} disabled={u.id === me?.userId}
                          className={'hover:text-red-600 ' + (u.id === me?.userId ? 'opacity-30 cursor-not-allowed' : '')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} className="text-center text-slate-500 py-8">No users match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}