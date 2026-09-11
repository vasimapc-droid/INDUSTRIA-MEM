export default function StatCard({ label, value, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700'
  };
  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      {Icon && (
        <div className={'p-3 rounded-lg ' + tones[tone]}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
