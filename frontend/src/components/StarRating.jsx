import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, readOnly = false, size = 24 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map(n => {
        const filled = value != null && n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(n)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition'}
            aria-label={'Rate ' + n}>
            <Star
              size={size}
              className={filled ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
            />
          </button>
        );
      })}
    </div>
  );
}