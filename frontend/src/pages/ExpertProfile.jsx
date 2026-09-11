import { useEffect, useState } from 'react';
import { Award, Save, CheckCircle } from 'lucide-react';
import api from '../api/client';

export default function ExpertProfile() {
  const [profile, setProfile] = useState({
    yearsExperience: 0,
    specialties: '',
    skills: '',
    certifications: '',
    bio: '',
    available: true,
    contributionCount: 0
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/expert-profile/me').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.put('/expert-profile/me', profile);
      setProfile(data);
      flash('Profile saved');
    } catch (e) {
      flash(e.response?.data?.error || 'Save failed', 'err');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Award size={20} /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Expert Profile</h2>
          <p className="text-sm text-slate-500">Your expertise, skills and availability</p>
        </div>
      </div>

      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm flex items-center gap-2 ' +
          (msg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {msg.type !== 'err' && <CheckCircle size={14} />}
          {msg.text}
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Years of Experience</label>
            <input type="number" min="0" className="input" value={profile.yearsExperience || 0}
              onChange={e => setProfile({ ...profile, yearsExperience: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Availability</label>
            <select className="input" value={String(profile.available)}
              onChange={e => setProfile({ ...profile, available: e.target.value === 'true' })}>
              <option value="true">Available for requests</option>
              <option value="false">Not available</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Specialties</label>
          <input className="input" value={profile.specialties || ''}
            onChange={e => setProfile({ ...profile, specialties: e.target.value })}
            placeholder="e.g. CNC / Machining, Robotics" />
        </div>

        <div>
          <label className="label">Skills</label>
          <textarea className="input" rows={2} value={profile.skills || ''}
            onChange={e => setProfile({ ...profile, skills: e.target.value })}
            placeholder="e.g. Spindle, Tooling, Vibration analysis" />
        </div>

        <div>
          <label className="label">Certifications</label>
          <textarea className="input" rows={2} value={profile.certifications || ''}
            onChange={e => setProfile({ ...profile, certifications: e.target.value })}
            placeholder="e.g. FANUC Certified, Siemens Level 2" />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={4} value={profile.bio || ''}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Describe your background and areas of expertise" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-slate-500">
            Knowledge entries verified: <strong className="text-slate-800">{profile.contributionCount || 0}</strong>
          </div>
          <button onClick={save} disabled={busy} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {busy ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}