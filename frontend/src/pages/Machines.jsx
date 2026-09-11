import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, Search } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => { api.get('/machines').then(r => setMachines(r.data)); }, []);

  const filtered = machines.filter(m =>
    !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.machineCode.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Machines</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search machines..."
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
        {filtered.map(m => (
          <Link key={m.id} to={'/machines/' + m.id} className="card card-hover p-5">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-brand-50 text-brand-700"><Factory size={22} /></div>
              <StatusBadge status={m.status} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">{m.name}</h3>
            <p className="text-xs text-slate-500">{m.machineCode} - {m.machineType}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div><span className="text-slate-400">Dept:</span> {m.department?.name || '-'}</div>
              <div><span className="text-slate-400">Line:</span> {m.productionLine || '-'}</div>
              <div><span className="text-slate-400">Mfr:</span> {m.manufacturer || '-'}</div>
              <div><span className="text-slate-400">Model:</span> {m.model || '-'}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
