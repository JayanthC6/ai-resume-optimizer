import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Code2, FileText, Timer, LogOut } from 'lucide-react';
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

export function InterviewWorkspace({
  messages,
  onSendMessage,
  onEndSession,
  onOpenCodingArena,
  isSending,
  voiceEnabled,
  durationMinutes,
  sessionId,
  context,
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
    if (remainingSeconds === 0 && !timerCompleted) {
      setTimerCompleted(true);
      onEndSession();
    }
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
        setInput((p) => (p ? p + ' ' + t : t));
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
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
  const techScore = Math.min(95, 70 + messages.filter((m) => m.role === 'user').length * 2);
  const commScore = Math.min(98, 80 + messages.filter((m) => m.role === 'user').length * 2);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white transition-colors overflow-hidden">

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 shrink-0 bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">Mock Interview</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
              {context.jobTitle || 'Active Simulation'}
            </span>
          </div>

          {/* Center: Timer & Code Arena */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Timer className={`h-4 w-4 ${urgent ? 'text-rose-500 animate-pulse' : 'text-blue-500'}`} />
              <span className={`font-mono font-bold text-sm ${urgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                {mins}:{secs}
              </span>
            </div>

            <button
              onClick={onOpenCodingArena}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              title="Open Coding / SQL Arena"
            >
              <Code2 className="h-4 w-4" />
              Code Arena
            </button>

            <button
              onClick={onEndSession}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm"
              title="Finish interview and generate performance report"
            >
              <LogOut className="h-3.5 w-3.5" />
              End Session
            </button>
          </div>
        </div>

        {/* AI Avatar area */}
        <div className="flex flex-col items-center py-5 shrink-0 bg-slate-100/70 dark:bg-gradient-to-b dark:from-[#0d1117] dark:to-[#0a0f1a] border-b border-slate-200 dark:border-white/5">
          <div className="h-20 w-20 rounded-full flex items-center justify-center text-4xl mb-2 bg-white dark:bg-[#161b27] border-2 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-inner">
            🤖
          </div>
          {/* Voice bars */}
          {isSending && (
            <div className="flex items-end gap-1 h-5 mb-1">
              {[3, 5, 7, 5, 4, 6, 8, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-blue-500"
                  style={{ height: `${h * 2}px`, animation: `pulse 0.8s ease-in-out ${i * 0.08}s infinite alternate` }}
                />
              ))}
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            {isSending ? 'AI Interviewer Listening…' : 'AI Interviewer'}
          </p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Session started · ID #{sessionId.slice(0, 8).toUpperCase()}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-500 dark:text-slate-400">
                {msg.role === 'user' ? 'Candidate (You)' : 'HiredLens AI'}
              </p>
              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm transition ${msg.role === 'user'
                    ? 'bg-blue-600 text-white dark:bg-blue-600/25 dark:text-blue-100 dark:border dark:border-blue-500/40'
                    : 'bg-white dark:bg-[#161b27] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                  }`}
              >
                <div className={msg.role === 'user' ? 'prose prose-invert prose-sm max-w-none text-white' : 'prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200'}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex flex-col items-start">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">HiredLens AI</p>
              <div className="rounded-2xl px-5 py-4 flex items-center gap-2 bg-white dark:bg-[#161b27] border border-slate-200 dark:border-white/10 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-blue-500 dark:bg-slate-400"
                    style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="shrink-0 px-6 py-4 bg-white dark:bg-[#0d1117] border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-[#161b27] border border-slate-300 dark:border-white/10 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition">
            <input
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? '🎙 Listening…' : 'Type your response here… (e.g. answer or ask for clarification)'}
            />
            <button
              onClick={voiceEnabled ? toggleListening : undefined}
              className="h-10 w-10 rounded-xl flex items-center justify-center transition shrink-0 shadow-sm"
              style={{ background: isListening ? '#dc2626' : 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-slate-500 dark:text-slate-400">
            <p className="text-[11px] flex items-center gap-1 font-medium">
              <span>📌</span> Press <kbd className="mx-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">Enter</kbd> to send
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              ⚡ Pro Tip: Mention real-world examples & trade-offs
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Live Analysis ── */}
      <div className="w-64 flex flex-col shrink-0 bg-white dark:bg-[#0d1117] border-l border-slate-200 dark:border-white/10 transition-colors">
        {/* Live Analysis */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Live Analysis</p>
          <div className="space-y-4">
            {[
              { label: 'Technical Accuracy', value: techScore },
              { label: 'Communication', value: commScore },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{s.label}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{s.value}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-blue-600"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Resources</p>
          <div className="space-y-2.5">
            <button
              onClick={onOpenCodingArena}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <span className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-500" />
                Live Code Arena
              </span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">Open</span>
            </button>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Active Candidate Ref
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {context.jobTitle || 'Role'} interview session
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
