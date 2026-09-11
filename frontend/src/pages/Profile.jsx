import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, BadgeCheck, Camera, Lock, Save, Award } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', phone: '', employeeId: '', profileImage: '' });
  const [stats, setStats] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdBusy, setPwdBusy] = useState(false);
  const fileRef = useRef(null);

  const roleLabel = { TECHNICIAN: 'Technician', EXPERT: 'Senior Engineer', ADMIN: 'Plant Manager' }[user?.role] || user?.role;

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const pwdFlash = (text, type = 'ok') => {
    setPwdMsg({ text, type });
    setTimeout(() => setPwdMsg(null), 4000);
  };

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setProfile({
        fullName: r.data.fullName || '',
        phone: r.data.phone || '',
        employeeId: r.data.employeeId || '',
        profileImage: r.data.profileImage || ''
      });
    }).catch(() => {});

    if (user?.role === 'TECHNICIAN') {
      api.get('/dashboard/technician').then(r => setStats({
        'My Open Incidents': r.data.myOpenIncidents || 0,
        'Reports (30d)': r.data.myRecentReports || 0,
        'Pending Requests': r.data.myPendingRequests || 0,
        'Verified Knowledge': r.data.verifiedKnowledgeCount || 0
      })).catch(() => {});
    } else if (user?.role === 'EXPERT') {
      api.get('/dashboard/expert').then(r => setStats({
        'Pending Verification': r.data.pendingVerification || 0,
        'Open Expert Requests': r.data.openRequests || 0,
        'My Verifications': r.data.myVerifications || 0,
        'Total Verified': r.data.totalIVerified || 0
      })).catch(() => {});
    } else {
      api.get('/dashboard/admin').then(r => setStats({
        'Total Users': r.data.totalUsers || 0,
        'Total Machines': r.data.totalMachines || 0,
        'Pending Verification': r.data.pendingVerification || 0,
        'Active Incidents': r.data.activeIncidents || 0
      })).catch(() => {});
    }
  }, [user?.role]);

  const save = async () => {
    setBusy(true);
    try {
      await api.put('/auth/me', profile);
      flash('Profile updated');
    } catch (e) {
      flash(e.response?.data?.error || 'Update failed', 'err');
    } finally { setBusy(false); }
  };

  const uploadAvatar = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/auth/me/avatar', fd);
      setProfile(p => ({ ...p, profileImage: data.url }));
      flash('Photo updated');
    } catch (e) {
      flash(e.response?.data?.error || 'Upload failed', 'err');
    }
  };

  const changePassword = async () => {
    setPwdMsg(null);
    if (!pwd.currentPassword || !pwd.newPassword) {
      pwdFlash('All fields required', 'err'); return;
    }
    if (pwd.newPassword.length < 6) {
      pwdFlash('New password must be at least 6 characters', 'err'); return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      pwdFlash('Passwords do not match', 'err'); return;
    }
    setPwdBusy(true);
    try {
      await api.post('/auth/me/change-password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword
      });
      pwdFlash('Password changed');
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      pwdFlash(e.response?.data?.error || 'Failed', 'err');
    } finally { setPwdBusy(false); }
  };

  const initials = (profile.fullName || user?.fullName || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl space-y-5">
      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm ' + (msg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="relative">
            {profile.profileImage ? (
              <img src={'http://localhost:8080' + profile.profileImage} alt=""
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-brand-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                {initials}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 border shadow hover:bg-slate-50"
              title="Change photo">
              <Camera size={16} className="text-slate-700" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={e => e.target.files[0] && uploadAvatar(e.target.files[0])} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-800">{profile.fullName || user?.fullName}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">{roleLabel}</span>
              {profile.employeeId && (
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <BadgeCheck size={14} /> {profile.employeeId}
                </span>
              )}
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Mail size={14} /> {user?.email}</div>
              {profile.phone && <div className="flex items-center gap-2"><Phone size={14} /> {profile.phone}</div>}
            </div>
          </div>

          {user?.role === 'EXPERT' && (
            <Link to="/expert-profile" className="btn-secondary flex items-center gap-2">
              <Award size={16} /> Expert Profile
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([label, value]) => (
            <div key={label} className="card p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <UserIcon size={18} /> Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profile.fullName}
              onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label">Employee ID</label>
            <input className="input" value={profile.employeeId}
              onChange={e => setProfile({ ...profile, employeeId: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input bg-slate-50" value={user?.email} readOnly />
          </div>
        </div>
        <button onClick={save} disabled={busy} className="btn-primary flex items-center gap-2">
          <Save size={16} /> {busy ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Password */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>
        {pwdMsg && (
          <div className={'px-4 py-2 rounded-lg text-sm ' + (pwdMsg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
            {pwdMsg.text}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwd.currentPassword}
              onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwd.newPassword}
              onChange={e => setPwd({ ...pwd, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwd.confirmPassword}
              onChange={e => setPwd({ ...pwd, confirmPassword: e.target.value })} />
          </div>
        </div>
        <button onClick={changePassword} disabled={pwdBusy} className="btn-primary flex items-center gap-2">
          <Lock size={16} /> {pwdBusy ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}