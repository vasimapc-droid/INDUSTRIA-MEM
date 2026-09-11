import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Factory, QrCode } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function MachineDetails() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [tab, setTab] = useState('incidents');

  useEffect(() => {
    api.get('/machines/' + id).then(r => setMachine(r.data));
    api.get('/incidents/by-machine/' + id).then(r => setIncidents(r.data));
    api.get('/knowledge/verified').then(r => setKnowledge(r.data.filter(k => k.machine?.id === Number(id))));
  }, [id]);

  if (!machine) return <div className="text-slate-500">Loading...</div>;

  const qrTarget = window.location.origin + '/machines/' + machine.id;

  return (
    <div className="space-y-5">
      <div className="card p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-brand-50 text-brand-700"><Factory size={28} /></div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{machine.name}</h2>
              <p className="text-sm text-slate-500">{machine.machineCode} - {machine.machineType}</p>
            </div>
            <div className="ml-auto"><StatusBadge status={machine.status} /></div>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              ['Department', machine.department?.name],
              ['Production Line', machine.productionLine],
              ['Manufacturer', machine.manufacturer],
              ['Model', machine.model],
              ['Serial', machine.serialNumber],
              ['Installed', machine.installationDate],
              ['Location', machine.location]
            ].map(([k,v]) => (
              <div key={k}>
                <p className="text-xs text-slate-400">{k}</p>
                <p className="text-slate-700">{v || '-'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-l lg:pl-6 flex flex-col items-center">
          <QrCode className="text-slate-400 mb-2" size={18} />
          <QRCodeSVG value={qrTarget} size={140} />
          <p className="text-xs text-slate-500 mt-2">Scan for machine profile</p>
        </div>
      </div>

      <div className="card">
        <div className="flex border-b">
          {['incidents','knowledge','history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition ' +
                (tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'incidents' && (
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Priority</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Reported</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(i => (
                  <tr key={i.id} className="border-t">
                    <td className="py-2"><Link to={'/incidents/' + i.id} className="text-brand-600 hover:underline">{i.title}</Link></td>
                    <td className="py-2"><PriorityBadge priority={i.priority} /></td>
                    <td className="py-2"><StatusBadge status={i.status} /></td>
                    <td className="py-2 text-slate-500">{new Date(i.incidentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!incidents.length && <tr><td colSpan={4} className="py-6 text-center text-slate-500">No incidents reported yet</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'knowledge' && (
            <div className="grid md:grid-cols-2 gap-4">
              {knowledge.map(k => (
                <Link key={k.id} to={'/knowledge/' + k.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                  <h4 className="font-semibold text-slate-800">{k.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Root Cause: {k.rootCause}</p>
                  <p className="text-xs text-slate-500 mt-1">Solution: {k.solution}</p>
                  <div className="mt-2"><StatusBadge status={k.status} /></div>
                </Link>
              ))}
              {!knowledge.length && <div className="text-slate-500">No verified knowledge yet</div>}
            </div>
          )}

          {tab === 'history' && (
            <div className="text-sm text-slate-600">
              <p>Installation: {machine.installationDate || '-'}</p>
              <p className="mt-2">Total incidents: {incidents.length}</p>
              <p>Last incident: {incidents[0] ? new Date(incidents[0].incidentDate).toLocaleDateString() : '-'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
