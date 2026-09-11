import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function KnowledgeBase() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => { api.get('/knowledge/verified').then(r => setItems(r.data)); }, []);

  const smartSearch = async () => {
    if (!q.trim()) return;
    setSearching(true);
    setAiResults(null);
    try {
      const { data } = await api.post('/ai/search', { query: q, topK: 8 });
      setAiResults(data.results || []);
    } catch { setAiResults([]); }
    finally { setSearching(false); }
  };

  const plain = items.filter(k => !q ||
    k.title?.toLowerCase().includes(q.toLowerCase()) ||
    k.problem?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-slate-800">Knowledge Base</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && smartSearch()}
              placeholder="Search knowledge..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 min-w-[280px]" />
          </div>
          <button onClick={smartSearch} disabled={searching} className="btn-primary flex items-center gap-2">
            <Sparkles size={16} />{searching ? 'Searching...' : 'AI Search'}
          </button>
        </div>
      </div>

      {aiResults && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles size={16} className="text-brand-600"/>Similar Incidents
          </h3>
          <div className="mt-3 space-y-3">
            {aiResults.map((r, i) => (
              <Link key={i} to={'/knowledge/' + r.knowledgeId}
                className="block p-4 rounded-lg border hover:border-brand-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{r.machine} - {r.problem}</p>
                    <p className="text-xs text-slate-500 mt-1">Root Cause: {r.rootCause}</p>
                    <p className="text-xs text-slate-500">Solution: {r.solution}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-600 font-semibold">{r.similarity}%</p>
                    <p className="text-xs text-slate-500">similarity</p>
                  </div>
                </div>
              </Link>
            ))}
            {!aiResults.length && <p className="text-slate-500 text-sm">No similar incidents found in company knowledge base.</p>}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plain.map(k => (
          <Link key={k.id} to={'/knowledge/' + k.id} className="card p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><BookOpen size={18} /></div>
              <StatusBadge status={k.status} />
            </div>
            <h3 className="font-semibold text-slate-800 mt-3">{k.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{k.machine?.name}</p>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{k.problem}</p>
            <div className="mt-3 pt-3 border-t text-xs text-slate-500 flex justify-between">
              <span>Helpful: {k.helpfulCount || 0}</span>
              <span>{k.verifiedBy?.fullName ? ('Verified by ' + k.verifiedBy.fullName) : 'Unverified'}</span>
            </div>
          </Link>
        ))}
        {!plain.length && <div className="col-span-full text-center text-slate-500 py-10">No knowledge entries yet.</div>}
      </div>
    </div>
  );
}
