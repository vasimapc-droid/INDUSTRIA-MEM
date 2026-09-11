import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Trash2, Sparkles, Upload } from 'lucide-react';
import { AI_BASE } from '../api/client';
import api from '../api/client';
import notify from '../utils/notify';

export default function VoiceCapture() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [structured, setStructured] = useState(null);
  const [busy, setBusy] = useState(false);
  const [machines, setMachines] = useState([]);
  const [machineId, setMachineId] = useState('');
  const [saving, setSaving] = useState(false);
  const recorder = useRef(null);
  const chunks = useRef([]);

  useEffect(() => { api.get('/machines').then(r => setMachines(r.data)); }, []);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunks.current = [];
    mr.ondataavailable = e => e.data.size && chunks.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach(t => t.stop());
    };
    mr.start();
    recorder.current = mr;
    setRecording(true);
  };

  const stop = () => { recorder.current?.stop(); setRecording(false); };

  const transcribe = async () => {
    if (!audioBlob) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', audioBlob, 'audio.webm');
      const r = await fetch(AI_BASE + '/transcribe', { method: 'POST', body: fd });
      const data = await r.json();
      setTranscript(data.text || '');
    } catch (e) { notify.error('Transcription failed. Ensure AI service is running.'); }
    finally { setBusy(false); }
  };

  const structure = async () => {
    if (!transcript) return;
    setBusy(true);
    try {
      const machine = machines.find(m => m.id === Number(machineId));
      const { data } = await api.post('/ai/structure-knowledge', {
        text: transcript, machineCode: machine?.machineCode, machineName: machine?.name
      });
      setStructured(data.structured || {});
    } finally { setBusy(false); }
  };

  const save = async () => {
    if (!structured || !machineId) { notify.error('Select a machine first.'); return; }
    setSaving(true);
    try {
      await api.post('/knowledge', {
        machine: { id: Number(machineId) },
        title: structured.problem || 'Voice-captured experience',
        problem: structured.problem,
        symptoms: structured.symptoms,
        possibleCause: structured.possibleCause,
        rootCause: structured.rootCause,
        troubleshootingSteps: Array.isArray(structured.troubleshootingSteps)
          ? structured.troubleshootingSteps.join('\n') : structured.troubleshootingSteps,
        solution: structured.solution,
        severity: structured.severity || 'MEDIUM',
        category: 'Mechanical',
        status: 'PENDING_VERIFICATION'
      });
      navigate('/knowledge');
    } catch (e) { notify.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <h2 className="text-xl font-semibold text-slate-800">Voice Experience Capture</h2>
      <p className="text-sm text-slate-500">Record your experience about a problem you solved. The AI will structure it for verification.</p>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Machine (optional but recommended)</label>
          <select className="input" value={machineId} onChange={e => setMachineId(e.target.value)}>
            <option value="">Select machine</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!recording ? (
            <button onClick={start} className="btn-primary flex items-center gap-2"><Mic size={18}/>Start Recording</button>
          ) : (
            <button onClick={stop} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Square size={18}/>Stop Recording</button>
          )}
          {audioUrl && (
            <>
              <audio src={audioUrl} controls className="h-10" />
              <button onClick={() => { setAudioUrl(null); setAudioBlob(null); setTranscript(''); setStructured(null); }}
                className="p-2 rounded-lg hover:bg-slate-100"><Trash2 size={18}/></button>
              <button onClick={transcribe} disabled={busy} className="btn-secondary flex items-center gap-2">
                <Upload size={16}/>{busy ? 'Transcribing...' : 'Transcribe'}
              </button>
            </>
          )}
        </div>

        <div>
          <label className="label">Transcript</label>
          <textarea className="input" rows={4} value={transcript} onChange={e => setTranscript(e.target.value)}
            placeholder="Voice transcript will appear here..." />
        </div>

        <button onClick={structure} disabled={!transcript || busy}
          className="btn-secondary flex items-center gap-2"><Sparkles size={16}/>AI Structure</button>

        {structured && (
          <div className="border-l-4 border-brand-500 pl-4 bg-brand-50/30 p-4 rounded">
            <h3 className="font-semibold text-slate-800">AI Extracted Knowledge</h3>
            <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm">
              {[
                ['Machine', structured.machine],
                ['Problem', structured.problem],
                ['Symptom', structured.symptoms],
                ['Cause', structured.rootCause],
                ['Solution', structured.solution],
                ['Severity', structured.severity]
              ].map(([k, v]) => v ? (
                <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-slate-800">{v}</p></div>
              ) : null)}
            </div>
            {Array.isArray(structured.troubleshootingSteps) && structured.troubleshootingSteps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500">Troubleshooting</p>
                <ul className="list-disc list-inside text-sm text-slate-800">
                  {structured.troubleshootingSteps.map((s,i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            <button onClick={save} disabled={saving} className="btn-primary mt-4">
              {saving ? 'Saving...' : 'Submit for Verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
