import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Code2, Paperclip, FileText, Briefcase, Timer, X } from 'lucide-react';
import type { InterviewMessage } from '@repo/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  messages: InterviewMessage[];
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  onOpenCodingArena: () => void;
  isSending: boolean;
  voiceEnabled: boolean;
  context: { jobTitle: string; resumeFilename: string; jobDescription: string };
  language: string;
  durationMinutes: number;
  sessionId: string;
}

const BORDER = 'rgba(255,255,255,0.07)';

export function InterviewWorkspace({
  messages, onSendMessage, onEndSession, onOpenCodingArena,
  isSending, voiceEnabled, context, language, durationMinutes, sessionId,
}: Props) {
  const [input, setInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isListening, setIsListening] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const id = setInterval(() => setRemainingSeconds((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 && !timerCompleted) { setTimerCompleted(true); onEndSession(); }
  }, [remainingSeconds, timerCompleted, onEndSession]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SR = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        const t = e.results[0][0].transcript;
        setInput((p) => p ? p + ' ' + t : t);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); }
    else { setIsListening(true); recognitionRef.current?.start(); }
  };

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  const urgent = remainingSeconds < 300;

  /* Live analysis scores derived from message count */
  const techScore = Math.min(95, 70 + messages.filter(m => m.role === 'user').length * 2);
  const commScore = Math.min(98, 80 + messages.filter(m => m.role === 'user').length * 2);

  return (
    <div className="flex h-[calc(100vh-56px)]" style={{ background: '#0a0f1a' }}>

      {/* ── LEFT SIDEBAR (narrow) ── */}
      <div className="w-48 flex flex-col shrink-0" style={{ background: '#0d1117', borderRight: `1px solid ${BORDER}` }}>
        {/* Logo */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-white leading-tight">HiredLens</p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Current Session</p>
        </div>

        {/* Nav items */}
        <nav className="px-2 space-y-0.5">
          {[
            { label: 'Overview', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, active: false },
            { label: 'Mock Interview', icon: <Mic className="h-4 w-4" />, active: true },
            { label: 'Notes', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 6h16M4 10h16M4 14h10"/></svg>, active: false },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all"
              style={{
                background: item.active ? '#2563eb' : 'transparent',
                color: item.active ? 'white' : '#64748b',
              }}
            >
              <span style={{ color: item.active ? 'white' : '#475569' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom: timer + code arena */}
        <div className="mt-auto px-3 pb-5 space-y-2" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '12px', marginTop: '8px' }}>
          <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1">Elapsed Time</p>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-400" />
              <span className={`font-mono font-bold text-sm ${urgent ? 'text-rose-400' : 'text-white'}`}>{mins}:{secs}</span>
            </div>
          </div>
          <button
            onClick={onOpenCodingArena}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: '#1e2a3a', border: `1px solid ${BORDER}` }}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code Arena
          </button>
        </div>
      </div>

      {/* ── CENTER: AI avatar + chat ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ background: '#0d1117', borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Mock Interview</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600 uppercase tracking-widest">Interview Intelligence</span>
          </div>
          <button
            onClick={onEndSession}
            className="flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: '#dc2626' }}
          >
            End Session
          </button>
        </div>

        {/* AI Avatar area */}
        <div className="flex flex-col items-center py-6 shrink-0" style={{ background: 'linear-gradient(180deg,#0d1117,#0a0f1a)' }}>
          <div className="h-24 w-24 rounded-full flex items-center justify-center text-5xl mb-3" style={{ background: '#161b27', border: '2px solid rgba(255,255,255,0.08)' }}>
            🤖
          </div>
          {/* Voice bars */}
          {isSending && (
            <div className="flex items-end gap-1 h-6 mb-1">
              {[3, 5, 7, 5, 4, 6, 8, 5, 3].map((h, i) => (
                <div key={i} className="w-1 rounded-full bg-blue-400" style={{ height: `${h * 2}px`, animation: `pulse 0.8s ease-in-out ${i * 0.08}s infinite alternate` }} />
              ))}
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
            {isSending ? 'AI Interviewer Listening' : 'AI Interviewer'}
          </p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-slate-600" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Session started · ID {sessionId.slice(0, 8).toUpperCase()}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: msg.role === 'user' ? '#64748b' : '#475569' }}>
                {msg.role === 'user' ? 'Candidate (You)' : 'HiredLens AI'}
              </p>
              <div
                className="max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'rgba(37,99,235,0.12)' : '#161b27',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(37,99,235,0.25)' : BORDER}`,
                  color: '#cbd5e1',
                }}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex flex-col items-start">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">HiredLens AI</p>
              <div className="rounded-2xl px-5 py-4 flex items-center gap-2" style={{ background: '#161b27', border: `1px solid ${BORDER}` }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-slate-500" style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 px-6 py-4" style={{ background: '#0d1117', borderTop: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: '#161b27', border: `1px solid ${BORDER}` }}>
            <input
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isListening ? '🎙 Listening…' : 'Type your response here…'}
            />
            <button className="text-slate-600 hover:text-slate-400 transition">
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              onClick={voiceEnabled ? toggleListening : undefined}
              className="h-10 w-10 rounded-xl flex items-center justify-center transition"
              style={{ background: isListening ? '#dc2626' : 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}
            >
              {isListening ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-slate-700 flex items-center gap-1">
              <span>📌</span> Press <kbd className="mx-1 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: '#1e2a3a', border: `1px solid ${BORDER}`, color: '#94a3b8' }}>Shift + Enter</kbd> to send
            </p>
            <p className="text-[10px] text-slate-700">
              ⚡ Pro Tip: Mention scalability trade-offs
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Live Analysis ── */}
      <div className="w-56 flex flex-col shrink-0" style={{ background: '#0d1117', borderLeft: `1px solid ${BORDER}` }}>
        {/* Live Analysis */}
        <div className="p-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Live Analysis</p>
          <div className="space-y-4">
            {[
              { label: 'Technical Accuracy', value: techScore },
              { label: 'Communication', value: commScore },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="font-bold" style={{ color: s.value >= 85 ? '#60a5fa' : '#f97316' }}>{s.value}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.value}%`, background: s.value >= 85 ? '#2563eb' : '#f97316' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Resources</p>
          <div className="space-y-2.5">
            {[
              { label: 'Whiteboard', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 21h10"/></svg> },
              { label: 'Resume Ref', icon: <FileText className="h-4 w-4" /> },
            ].map((r) => (
              <button
                key={r.label}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}
              >
                <span>{r.label}</span>
                <span style={{ color: '#475569' }}>{r.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
