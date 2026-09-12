import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Key } from 'lucide-react';
import api from '../api/client';
import notify from '../utils/notify';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.devToken) {
        setDevToken(data.devToken);
        notify.success('Reset token generated (dev mode)');
      } else {
        notify.success('Check your email for reset instructions');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="orb orb-blue animate-drift" style={{ width: 300, height: 300, top: '10%', left: '5%' }} />
          <div className="orb orb-purple animate-drift-slow" style={{ width: 340, height: 340, bottom: '10%', right: '5%' }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold glow-blue">IM</div>
            <div>
              <h1 className="text-2xl font-bold">INDUSTRIA-MEM</h1>
              <p className="text-xs text-slate-400">Knowledge Continuity Platform</p>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-3xl font-semibold leading-snug">
            Password trouble?<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              We've got you.
            </span>
          </p>
          <p className="text-slate-400 text-sm mt-6 max-w-md">
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>
        <p className="relative z-10 text-slate-500 text-xs">© 2025 Industria-MEM</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md card p-8">
          <Link to="/login" className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1 mb-4">
            <ArrowLeft size={14} /> Back to login
          </Link>

          {!sent ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Key size={20} /></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Forgot Password</h2>
                  <p className="text-sm text-slate-500">Enter your email to reset</p>
                </div>
              </div>

              {error && <div className="mt-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg">{error}</div>}

              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input className="input pl-9" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com" required />
                  </div>
                </div>
                <button disabled={busy} className="btn-primary w-full">
                  {busy ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-4">
                <CheckCircle size={40} className="text-emerald-500 mb-3" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check your inbox</h2>
                <p className="text-sm text-slate-500 mt-2">
                  If an account exists for <strong>{email}</strong>, you'll receive reset instructions shortly.
                </p>
              </div>

              {devToken && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">🔧 Development Mode</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                    In production this token would be emailed. For now, click below to reset directly:
                  </p>
                  <button
                    onClick={() => navigate(`/reset-password?token=${devToken}`)}
                    className="btn-primary w-full text-sm">
                    Continue to reset password
                  </button>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-slate-500">
                Didn't receive an email?{' '}
                <button onClick={() => { setSent(false); setDevToken(''); }} className="text-brand-600 hover:underline font-medium">
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}