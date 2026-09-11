import { useEffect, useState } from 'react';

function CountUp({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const numeric = Number(value);
    if (isNaN(numeric) || value === '-' || value == null) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const startVal = 0;
    const endVal = numeric;
    let raf;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className="count-anim">{display}</span>;
}

export default function StatCard({ label, value, icon: Icon, tone = 'brand', trend }) {
  const tones = {
    brand:  'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    green:  'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    amber:  'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
    red:    'bg-gradient-to-br from-red-500 to-rose-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
    slate:  'bg-gradient-to-br from-slate-500 to-slate-700 text-white'
  };

  return (
    <div className="card card-hover p-5 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          <CountUp value={value} />
        </p>
        {trend && (
          <p className={'text-xs mt-1 ' + (trend.positive ? 'text-emerald-600' : 'text-red-600')}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </p>
        )}
      </div>
      {Icon && (
        <div className={'p-3 rounded-xl shadow-md ' + tones[tone]}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}