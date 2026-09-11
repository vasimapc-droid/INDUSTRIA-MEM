import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Zap, Users, BookOpen } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingIcons from '../components/FloatingIcons';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('technician@demo.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const quick = (e) => { setEmail(e); setPassword('password123'); };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT: Animated hero */}
      <div className="login-hero-panel hidden lg:flex flex-col justify-between p-12 bg-navy-900 text-white relative overflow-hidden">
        <AnimatedBackground />
        <FloatingIcons />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold shadow-lg glow-blue">
              IM
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">INDUSTRIA-MEM</h1>
              <p className="text-xs text-slate-400">Knowledge Continuity Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 fade-scale-in">
          <p className="text-3xl font-semibold leading-snug relative z-10" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            When an employee leaves,<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              their experience doesn't have to.
            </span>
          </p>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed relative z-10" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            Preserve the practical knowledge of automotive manufacturing experts Ã¢â‚¬â€
            verified, searchable, and reusable across generations of technicians.
          </p>

          {/* Feature chips */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: ShieldCheck, label: 'Expert Verified', color: 'text-emerald-400' },
              { icon: Zap, label: 'AI Structuring', color: 'text-amber-400' },
              { icon: Users, label: 'Role-Based', color: 'text-blue-400' },
              { icon: BookOpen, label: 'Semantic Search', color: 'text-purple-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
                <Icon size={16} className={color} />
                <span className="text-xs text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-xs">Ã‚Â© 2025 Industria-MEM Ã‚Â· Automotive Manufacturing</p>
        </div>
      </div>

      {/* RIGHT: Login form */}
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Subtle background orbs for form side */}
        <div className="orb orb-blue animate-drift"
          style={{ width: 200, height: 200, top: '-50px', right: '-50px', opacity: 0.25 }} />
        <div className="orb orb-purple animate-drift-slow"
          style={{ width: 240, height: 240, bottom: '-80px', left: '-60px', opacity: 0.2 }} />

        <form onSubmit={submit} className="w-full max-w-md card p-8 relative z-10 animate-scale-in">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Access the knowledge continuity platform</p>

          {error && <div className="mt-4 text-sm bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg">{error}</div>}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
            </div>
          </div>

          <button disabled={loading} className="btn-primary w-full mt-6">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Demo accounts (password123)</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => quick('technician@demo.com')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Technician</button>
              <button type="button" onClick={() => quick('expert@demo.com')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Expert</button>
              <button type="button" onClick={() => quick('admin@demo.com')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Admin</button>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
            New to INDUSTRIA-MEM?{' '}
            <Link to="/signup" className="text-brand-600 hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}