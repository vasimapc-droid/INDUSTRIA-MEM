import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import api from '../api/client';

export default function AskAI() {
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    const question = q;
    setQ('');
    setMessages(m => [...m, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/ask', { question });
      setMessages(m => [...m, { role: 'ai', text: data.answer, sources: data.sources || [] }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'AI service is currently unavailable. Please try again later.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Bot size={20}/></div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Ask AI</h2>
          <p className="text-xs text-slate-500">Answers are grounded in your company's verified knowledge only.</p>
        </div>
      </div>

      <div className="flex-1 card p-5 overflow-y-auto space-y-4">
        {!messages.length && (
          <div className="text-slate-500 text-sm">
            Try asking: <span className="italic">"CNC C-12 is vibrating at high speed. Has this happened before?"</span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={'flex ' + (m.role === 'user' ? 'justify-end' : '')}>
            <div className={'max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ' +
              (m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800')}>
              {m.text}
              {m.sources?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-300/40 text-xs">
                  <p className="opacity-70 mb-1">Sources:</p>
                  {m.sources.map((s, j) => (
                    <div key={j}>- {s.machine} - {s.similarity}% similarity</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-slate-500 text-sm">Thinking...</div>}
      </div>

      <form onSubmit={ask} className="mt-3 flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} className="input flex-1" placeholder="Ask about a machine problem..." />
        <button className="btn-primary flex items-center gap-2"><Send size={16}/>Send</button>
      </form>
    </div>
  );
}
