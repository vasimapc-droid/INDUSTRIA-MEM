import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      <div className="hidden lg:flex flex-col justify-between p-12 bg-navy-900 text-white">
        <div>
          <h1 className="text-3xl font-bold">INDUSTRIA-MEM</h1>
          <p className="text-slate-400 mt-2">AI-Powered Industrial Experience Intelligence</p>
        </div>
        <div>
          <p className="text-2xl font-semibold leading-snug">
            When an employee leaves,<br/> their experience doesn't have to leave with them.
          </p>
          <p className="text-slate-400 mt-6 text-sm">
            Preserving the practical knowledge of automotive manufacturing experts -
            verified, searchable, and reusable across generations of technicians.
          </p>
        </div>
        <p className="text-slate-500 text-xs">2025 Industria-MEM - Automotive Manufacturing</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md card p-8">
          <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1">Access the knowledge continuity platform</p>

          {error && <div className="mt-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg">{error}</div>}

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

          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-slate-500 mb-2">Demo accounts (password123)</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => quick('technician@demo.com')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Technician</button>
              <button type="button" onClick={() => quick('expert@demo.com')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Expert</button>
              <button type="button" onClick={() => quick('admin@demo.com')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Admin</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
