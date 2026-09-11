import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-semibold text-slate-800">Profile</h2>
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold">
            {(user?.fullName || '').split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{user?.fullName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
