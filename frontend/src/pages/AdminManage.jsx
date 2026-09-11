import { useState } from 'react';
import { Users, Building2, ScrollText, Factory, Send } from 'lucide-react';
import AdminUsers from './AdminUsers';
import AdminDepartments from './AdminDepartments';
import AdminAudit from './AdminAudit';
import AdminMachines from './AdminMachines';
import AdminBroadcast from './AdminBroadcast';

export default function AdminManage() {
  const [tab, setTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'machines', label: 'Machines', icon: Factory },
    { id: 'broadcast', label: 'Broadcast', icon: Send },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-800">Administration</h2>
        <p className="text-sm text-slate-500">Manage users, departments, machines and audit trail</p>
      </div>

      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap ' +
                  (tab === t.id
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700')}>
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {tab === 'users' && <AdminUsers />}
        {tab === 'departments' && <AdminDepartments />}
        {tab === 'machines' && <AdminMachines />}
        {tab === 'broadcast' && <AdminBroadcast />}
        {tab === 'audit' && <AdminAudit />}
      </div>
    </div>
  );
}