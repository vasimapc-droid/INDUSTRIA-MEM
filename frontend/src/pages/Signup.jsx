import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, BadgeCheck, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    fullName: '', employeeId: '', phone: '', departmentId: '', role: 'TECHNICIAN'
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    { id: 1, name: 'Machining' },
    { id: 2, name: 'Welding' },
    { id: 3, name: 'Assembly' },
    { id: 4, name: 'Press Shop' },
    { id: 5, name: 'Conveyor Systems' }
  ];

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.fullName) {
      setError('Email, password, and full name are required'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setBusy(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        employeeId: form.employeeId || null,
        phone: form.phone || null,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        role: form.role
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-navy-900 text-white">
        <div>
          <h1 className="text-3xl font-bold">INDUSTRIA-MEM</h1>
          <p className="text-slate-400 mt-2">AI-Powered Industrial Experience Intelligence</p>
        </div>
        <div>
          <p className="text-2xl font-semibold leading-snug">
            Join the platform.<br />Preserve your experience.
          </p>
          <p className="text-slate-400 mt-6 text-sm">
            Create an account to report incidents, capture knowledge, and reuse
            the practical expertise of your team.
          </p>
        </div>
        <p className="text-slate-500 text-xs">2025 Industria-MEM - Automotive Manufacturing</p>
      </div>

      <div className="flex items-center justify-center p-8 bg-slate-50">
        <form onSubmit={submit} className="w-full max-w-md card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-700">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
              <p className="text-sm text-slate-500">Join the knowledge continuity platform</p>
            </div>
          </div>

          {error && <div className="mt-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg">{error}</div>}

          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="input pl-9" value={form.fullName}
                  onChange={e => setField('fullName', e.target.value)}
                  placeholder="e.g. Ramesh Kumar" required />
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="input pl-9" type="email" value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="you@company.com" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="input pl-9" type="password" value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="Min 6 chars" required />
                </div>
              </div>
              <div>
                <label className="label">Confirm *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="input pl-9" type="password" value={form.confirmPassword}
                    onChange={e => setField('confirmPassword', e.target.value)}
                    placeholder="Repeat password" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Employee ID</label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="input pl-9" value={form.employeeId}
                    onChange={e => setField('employeeId', e.target.value)}
                    placeholder="EMP-1001" />
                </div>
              </div>
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="input pl-9" value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.departmentId}
                  onChange={e => setField('departmentId', e.target.value)}>
                  <option value="">Select...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role}
                  onChange={e => setField('role', e.target.value)}>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>
          </div>

          <button disabled={busy} className="btn-primary w-full mt-6">
            {busy ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-sm text-slate-500 text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>

          <p className="text-xs text-slate-400 text-center mt-4">
            Admin role can only be assigned by an existing administrator.
          </p>
        </form>
      </div>
    </div>
  );
}