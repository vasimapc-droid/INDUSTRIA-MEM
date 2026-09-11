import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Upload } from 'lucide-react';
import api from '../api/client';

export default function CreateIncident() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({
    machineId: '', title: '', description: '', symptoms: '',
    priority: 'MEDIUM', troubleshootingPerformed: '', rootCause: '',
    solution: '', additionalNotes: ''
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/machines').then(r => setMachines(r.data)); }, []);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const uploadPhoto = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/files/upload/image', fd);
    setPhotos(p => [...p, data.url]);
  };


  const uploadVideo = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/files/upload/video', fd);
    setVideos(v => [...v, data.url]);
  };
  const runAI = async () => {
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const machine = machines.find(m => m.id === Number(form.machineId));
      const text = form.title + '. ' + form.description + '. Symptoms: ' + form.symptoms + '. Troubleshooting: ' + form.troubleshootingPerformed + '. Solution: ' + form.solution + '.';
      const { data } = await api.post('/ai/structure-knowledge', {
        text, machineCode: machine?.machineCode, machineName: machine?.name
      });
      setAiSuggestion(data.structured || {});
    } catch (e) {
      setError('AI structuring failed. You can still submit manually.');
    } finally { setAiLoading(false); }
  };

  const applyAI = () => {
    if (!aiSuggestion) return;
    setField('symptoms', aiSuggestion.symptoms || form.symptoms);
    setField('rootCause', aiSuggestion.rootCause || form.rootCause);
    setField('solution', aiSuggestion.solution || form.solution);
    setField('troubleshootingPerformed',
      Array.isArray(aiSuggestion.troubleshootingSteps)
        ? aiSuggestion.troubleshootingSteps.join('\n')
        : (aiSuggestion.troubleshootingSteps || form.troubleshootingPerformed));
    if (aiSuggestion.severity) setField('priority', aiSuggestion.severity);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.machineId || !form.title) { setError('Machine and title are required.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        symptoms: form.symptoms,
        priority: form.priority,
        troubleshootingPerformed: form.troubleshootingPerformed,
        rootCause: form.rootCause,
        solution: form.solution,
        additionalNotes: form.additionalNotes,
        machine: { id: Number(form.machineId) },
        photoUrls: photos.join(','),
        status: 'OPEN',
        aiGenerated: !!aiSuggestion,
        verificationStatus: aiSuggestion ? 'PENDING_VERIFICATION' : 'AI_GENERATED'
      };
      const { data: incident } = await api.post('/incidents', payload);

      if (aiSuggestion || form.solution) {
        await api.post('/knowledge', {
          incidentId: incident.id,
          machine: { id: Number(form.machineId) },
          title: form.title,
          problem: form.description || form.title,
          symptoms: aiSuggestion?.symptoms || form.symptoms,
          possibleCause: aiSuggestion?.possibleCause,
          rootCause: aiSuggestion?.rootCause || form.rootCause,
          troubleshootingSteps: Array.isArray(aiSuggestion?.troubleshootingSteps)
            ? aiSuggestion.troubleshootingSteps.join('\n') : form.troubleshootingPerformed,
          solution: aiSuggestion?.solution || form.solution,
          severity: form.priority,
          category: 'Mechanical',
          status: 'PENDING_VERIFICATION'
        });
      }
      navigate('/incidents/' + incident.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create incident');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Report New Incident</h2>
        <button type="button" onClick={runAI} disabled={aiLoading} className="btn-secondary flex items-center gap-2">
          <Sparkles size={16} />{aiLoading ? 'Analyzing...' : 'AI Structure'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <div className="card p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Machine *</label>
            <select className="input" value={form.machineId} onChange={e => setField('machineId', e.target.value)} required>
              <option value="">Select machine</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.machineCode})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e => setField('priority', e.target.value)}>
              <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Problem Title *</label>
          <input className="input" value={form.title} onChange={e => setField('title', e.target.value)}
            placeholder="e.g. CNC C-12 vibrating at high speed" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => setField('description', e.target.value)} />
        </div>
        <div>
          <label className="label">Symptoms</label>
          <textarea className="input" rows={2} value={form.symptoms} onChange={e => setField('symptoms', e.target.value)} />
        </div>
        <div>
          <label className="label">Troubleshooting Performed</label>
          <textarea className="input" rows={3} value={form.troubleshootingPerformed}
            onChange={e => setField('troubleshootingPerformed', e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Root Cause</label>
            <textarea className="input" rows={2} value={form.rootCause} onChange={e => setField('rootCause', e.target.value)} />
          </div>
          <div>
            <label className="label">Solution</label>
            <textarea className="input" rows={2} value={form.solution} onChange={e => setField('solution', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Additional Notes</label>
          <textarea className="input" rows={2} value={form.additionalNotes} onChange={e => setField('additionalNotes', e.target.value)} />
        </div>

                <div>
          <label className="label">Photos / Videos</label>
          <div className="flex flex-wrap gap-3">
            {photos.map((url, idx) => (
              <div key={'p'+idx} className="relative">
                <img src={'http://localhost:8080' + url} alt="" className="h-24 w-24 object-cover rounded-lg border" />
                <button type="button" onClick={() => setPhotos(photos.filter((_,i)=>i!==idx))}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 border shadow"><X size={14}/></button>
              </div>
            ))}
            {videos.map((url, idx) => (
              <div key={'v'+idx} className="relative">
                <video src={'http://localhost:8080' + url} className="h-24 w-24 object-cover rounded-lg border bg-black" />
                <button type="button" onClick={() => setVideos(videos.filter((_,i)=>i!==idx))}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 border shadow"><X size={14}/></button>
              </div>
            ))}
            <label className="h-24 w-24 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer text-slate-400 hover:border-brand-500">
              <input type="file" accept="image/*,video/*" hidden onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                if (f.type.startsWith('video/')) uploadVideo(f);
                else uploadPhoto(f);
              }} />
              <div className="flex flex-col items-center">
                <Upload size={18} />
                <span className="text-xs mt-1">Upload</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      {aiSuggestion && (
        <div className="card p-5 border-l-4 border-brand-500">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Sparkles size={16} className="text-brand-600"/>AI Extracted Knowledge</h3>
          <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm">
            {[
              ['Machine', aiSuggestion.machine],
              ['Problem', aiSuggestion.problem],
              ['Symptom', aiSuggestion.symptoms],
              ['Possible Cause', aiSuggestion.possibleCause],
              ['Root Cause', aiSuggestion.rootCause],
              ['Solution', aiSuggestion.solution],
              ['Severity', aiSuggestion.severity]
            ].map(([k, v]) => v ? (
              <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-slate-800">{v}</p></div>
            ) : null)}
            {Array.isArray(aiSuggestion.troubleshootingSteps) && aiSuggestion.troubleshootingSteps.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500">Troubleshooting Steps</p>
                <ul className="list-disc list-inside text-slate-800">
                  {aiSuggestion.troubleshootingSteps.map((s,i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
          <button type="button" onClick={applyAI} className="btn-secondary mt-4">Apply to form</button>
        </div>
      )}

      <div className="flex gap-3">
        <button disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit Incident'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
