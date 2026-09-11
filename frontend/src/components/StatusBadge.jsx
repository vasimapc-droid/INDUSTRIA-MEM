export default function StatusBadge({ status }) {
  const map = {
    OPEN: 'bg-amber-100 text-amber-700',
    INVESTIGATING: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-slate-100 text-slate-700',
    AI_GENERATED: 'bg-slate-100 text-slate-700',
    PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
    EXPERT_VERIFIED: 'bg-emerald-100 text-emerald-700',
    CORRECTED: 'bg-blue-100 text-blue-700',
    REJECTED: 'bg-red-100 text-red-700',
    OPERATIONAL: 'bg-emerald-100 text-emerald-700',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    DOWN: 'bg-red-100 text-red-700'
  };
  return <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + (map[status] || 'bg-slate-100 text-slate-700')}>{(status || '').replace(/_/g,' ')}</span>;
}
