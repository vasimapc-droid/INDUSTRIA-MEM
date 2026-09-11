import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {message && <p className="text-sm text-slate-500 mt-1 max-w-md">{message}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary mt-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}