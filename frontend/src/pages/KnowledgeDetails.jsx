import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ThumbsUp, Bookmark, BookmarkCheck } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';

export default function KnowledgeDetails() {
  const { id } = useParams();
  const [k, setK] = useState(null);
  const [markedHelpful, setMarkedHelpful] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [rating, setRating] = useState({ average: null, count: 0, myRating: null });
  const [msg, setMsg] = useState(null);

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  };

  useEffect(() => {
    api.get('/knowledge/' + id).then(r => setK(r.data));
    api.get('/bookmarks/' + id + '/status').then(r => setBookmarked(r.data.bookmarked)).catch(() => {});
    api.get('/ratings/' + id).then(r => setRating(r.data)).catch(() => {});
  }, [id]);

  const helpful = async () => {
    const { data } = await api.post('/knowledge/' + id + '/helpful');
    setK(data); setMarkedHelpful(true);
  };

  const toggleBookmark = async () => {
    try {
      const { data } = await api.post('/bookmarks/' + id + '/toggle');
      setBookmarked(data.bookmarked);
      flash(data.bookmarked ? 'Bookmarked' : 'Bookmark removed');
    } catch {
      flash('Bookmark failed', 'err');
    }
  };

  const submitRating = async (value) => {
    try {
      const { data } = await api.post('/ratings/' + id, { rating: value });
      setRating(data);
      flash('Thanks for rating');
    } catch {
      flash('Rating failed', 'err');
    }
  };

  if (!k) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm ' + (msg.type === 'err' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {msg.text}
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{k.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{k.machine?.name} · {k.category}</p>
          </div>
          <StatusBadge status={k.status} />
        </div>
        {k.status === 'EXPERT_VERIFIED' && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
            <ShieldCheck size={16} />
            Verified by {k.verifiedBy?.fullName} · {k.verifiedAt ? new Date(k.verifiedAt).toLocaleDateString() : ''}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <button onClick={helpful} disabled={markedHelpful}
            className="btn-secondary flex items-center gap-2">
            <ThumbsUp size={16}/>{markedHelpful ? 'Marked helpful' : 'Helpful'} ({k.helpfulCount || 0})
          </button>
          <button onClick={toggleBookmark}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ' +
              (bookmarked
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')}>
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Rate this solution</p>
              <StarRating value={rating.myRating} onChange={submitRating} />
            </div>
            {rating.count > 0 && (
              <div className="text-xs text-slate-600">
                {rating.average}/5<br/>({rating.count} rating{rating.count === 1 ? '' : 's'})
              </div>
            )}
          </div>
        </div>
      </div>

      {[
        ['Problem', k.problem],
        ['Symptoms', k.symptoms],
        ['Possible Cause', k.possibleCause],
        ['Root Cause', k.rootCause],
        ['Troubleshooting Steps', k.troubleshootingSteps],
        ['Solution', k.solution],
        ['Safety Notes', k.safetyNotes],
        ['Expert Comment', k.expertComment]
      ].map(([label, v]) => v ? (
        <div key={label} className="card p-5">
          <p className="text-xs uppercase text-slate-400 tracking-wide">{label}</p>
          <p className="text-slate-800 whitespace-pre-line mt-1">{v}</p>
        </div>
      ) : null)}
    </div>
  );
}