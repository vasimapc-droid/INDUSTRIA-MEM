export default function PriorityBadge({ priority }) {
  const map = {
    LOW: 'bg-slate-100 text-slate-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-red-100 text-red-700'
  };
  return <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + (map[priority] || map.MEDIUM)}>{priority}</span>;
}
