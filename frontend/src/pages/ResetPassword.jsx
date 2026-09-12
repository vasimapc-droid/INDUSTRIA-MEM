import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../api/client';
import notify from '../utils/notify';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get('token') || '');
  const [pwd, setPwd] = useState({ newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Reset token is missing'); return; }
    if (pwd.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (pwd.newPassword !== pwd.confirm) { setError('Passwords do not match'); return; }

    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: pwd.newPassword });
      setDone(true);
      notify.success('Password reset successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="orb orb-blue animate-drift" style={{ width: 300, height: 300, top: '20%', right: '10%' }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold">IM</div>
            <div>
              <h1 className="text-2xl font-bold">INDUSTRIA-MEM</h1>
              <p className="text-xs text-slate-400">Knowledge Continuity Platform</p>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-3xl font-semibold leading-snug">
            Set a new password.<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get back to work.
            </span>
          </p>
        </div>
        <p className="relative z-10 text-slate-500 text-xs">© 2025 Industria-MEM</p>
      </div>

      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md card p-8">
          <Link to="/login" className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1 mb-4">
            <ArrowLeft size={14} /> Back to login
          </Link>

          {!done ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><ShieldCheck size={20} /></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reset Password</h2>
                  <p className="text-sm text-slate-500">Choose a new password</p>
                </div>
              </div>

              {error && <div className="mt-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg">{error}</div>}

              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <label className="label">Reset Token</label>
                  <input className="input font-mono text-xs" value={token}
                    onChange={e => setToken(e.target.value)} placeholder="Paste your reset token" />
                  <p className="text-xs text-slate-500 mt-1">Auto-filled from the reset link.</p>
                </div>
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input className="input pl-9" type="password" value={pwd.newPassword}
                      onChange={e => setPwd({ ...pwd, newPassword: e.target.value })}
                      placeholder="Min 6 chars" required />
                  </div>
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input className="input pl-9" type="password" value={pwd.confirm}
                      onChange={e => setPwd({ ...pwd, confirm: e.target.value })}
                      placeholder="Repeat password" required />
                  </div>
                </div>
                <button disabled={busy} className="btn-primary w-full">
                  {busy ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-6">
              <CheckCircle size={48} className="text-emerald-500 mb-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Password Reset!</h2>
              <p className="text-sm text-slate-500 mt-2">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}