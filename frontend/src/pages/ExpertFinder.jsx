import { useEffect, useState } from 'react';
import { Search, Award, Send } from 'lucide-react';
import api from '../api/client';

export default function ExpertFinder() {
  const [q, setQ] = useState('');
  const [experts, setExperts] = useState([]);

  const find = async () => {
    const { data } = await api.get('/experts/find', { params: { skill: q } });
    setExperts(data);
  };

  useEffect(() => { find(); }, []);

  return (
    <div className="space-y-5 max-w-3xl">
      <h2 className="text-xl font-semibold text-slate-800">Find an Expert</h2>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input className="input pl-9" value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Try CNC vibration, welding, assembly..."/>
        </div>
        <button onClick={find} className="btn-primary">Search</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {experts.map(e => (
          <div key={e.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Award size={20}/></div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{e.matchScore}% match</span>
            </div>
            <h3 className="mt-3 font-semibold text-slate-800">{e.fullName}</h3>
            <p className="text-xs text-slate-500">{e.department} - {e.email}</p>
            <button className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"><Send size={14}/>Ask Expert</button>
          </div>
        ))}
        {!experts.length && <div className="col-span-full text-slate-500 text-center py-8">No experts matched.</div>}
      </div>
    </div>
  );
}
