export default function Settings() {
  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Language</label>
          <select className="input"><option>English</option></select>
        </div>
        <div>
          <label className="label">Theme</label>
          <select className="input"><option>Industrial Light</option></select>
        </div>
        <div className="flex items-center gap-2">
          <input id="notif" type="checkbox" defaultChecked/>
          <label htmlFor="notif" className="text-sm text-slate-700">Email notifications</label>
        </div>
      </div>
    </div>
  );
}
