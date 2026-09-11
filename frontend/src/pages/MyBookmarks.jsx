import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookOpen } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function MyBookmarks() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/bookmarks').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50 text-amber-700"><Bookmark size={20} /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My Bookmarks</h2>
          <p className="text-sm text-slate-500">Knowledge entries you've saved for quick access</p>
        </div>
      </div>

      {!items.length && (
        <div className="card p-8 text-center text-slate-500">
          No bookmarks yet. Browse the <Link to="/knowledge" className="text-brand-600 hover:underline">Knowledge Base</Link> and click the Bookmark button.
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(k => (
          <Link key={k.id} to={'/knowledge/' + k.id} className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><BookOpen size={18} /></div>
              <StatusBadge status={k.status} />
            </div>
            <h3 className="font-semibold text-slate-800 mt-3">{k.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{k.machine?.name}</p>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{k.problem}</p>
            <div className="mt-3 pt-3 border-t text-xs text-slate-500 flex justify-between">
              <span>Helpful: {k.helpfulCount || 0}</span>
              <span>{k.verifiedBy?.fullName ? ('By ' + k.verifiedBy.fullName) : 'Unverified'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}