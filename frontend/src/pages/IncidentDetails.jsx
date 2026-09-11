import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

export default function IncidentDetails() {
  const { id } = useParams();
  const [inc, setInc] = useState(null);

  useEffect(() => { api.get('/incidents/' + id).then(r => setInc(r.data)); }, [id]);

  if (!inc) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{inc.title}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {inc.machine?.name} - {new Date(inc.incidentDate).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <PriorityBadge priority={inc.priority} />
            <StatusBadge status={inc.status} />
            <StatusBadge status={inc.verificationStatus} />
          </div>
        </div>
      </div>

      {[
        ['Description', inc.description],
        ['Symptoms', inc.symptoms],
        ['Troubleshooting Performed', inc.troubleshootingPerformed],
        ['Root Cause', inc.rootCause],
        ['Solution', inc.solution],
        ['Additional Notes', inc.additionalNotes]
      ].map(([k, v]) => v ? (
        <div key={k} className="card p-5">
          <p className="text-xs uppercase text-slate-400 tracking-wide">{k}</p>
          <p className="text-slate-800 whitespace-pre-line mt-1">{v}</p>
        </div>
      ) : null)}

      {inc.photoUrls && (
        <div className="card p-5">
          <p className="text-xs uppercase text-slate-400 tracking-wide mb-2">Photos</p>
          <div className="flex gap-3 flex-wrap">
            {inc.photoUrls.split(',').filter(Boolean).map((u,i) => (
              <img key={i} src={'http://localhost:8080' + u} alt="" className="h-32 rounded-lg border" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
