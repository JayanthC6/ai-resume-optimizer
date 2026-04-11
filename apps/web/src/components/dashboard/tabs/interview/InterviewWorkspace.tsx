import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  Send,
  XOctagon,
  FileText,
  Code2,
  AlertCircle,
  Timer,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
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
  context,
  language,
  durationMinutes,
  sessionId,
}: Props) {
  const [input, setInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isListening, setIsListening] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 && !timerCompleted) {
      setTimerCompleted(true);
      onEndSession();
    }
  }, [remainingSeconds, timerCompleted, onEndSession]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SR = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
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

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  const timerUrgent = remainingSeconds < 300;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm shrink-0">
        {/* Left: Session info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
            <span className="text-sm font-semibold text-slate-200">Live Interview</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-400 max-w-[200px] truncate">{context.jobTitle}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-mono max-w-[160px] truncate">{context.resumeFilename}</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 font-mono text-[11px] text-cyan-400">
            {language}
          </div>
        </div>

        {/* Right: Timer + Code Arena button + End */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-mono font-bold transition-colors ${
            timerUrgent
              ? 'border-rose-500/50 bg-rose-950/30 text-rose-400'
              : 'border-slate-700 bg-slate-800/50 text-cyan-400'
          }`}>
            <Timer className="h-3.5 w-3.5" />
            {minutes}:{secs}
          </div>

          <Button
            onClick={onOpenCodingArena}
            size="sm"
            className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
          >
            <Code2 className="h-4 w-4" />
            Code Arena
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onEndSession}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 gap-1.5 transition-colors"
          >
            <XOctagon className="h-4 w-4" />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </div>
      </div>

      {/* ── Chat Messages ── */}
      <ScrollArea className="flex-1 px-0" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

          {/* Session start info card */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-slate-800 bg-slate-900/60 text-xs text-slate-500">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Session started · ID {sessionId.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${
                  msg.role === 'user' ? 'text-cyan-500 mr-1' : 'text-slate-500 ml-1'
                }`}>
                  {msg.role === 'user' ? 'You' : 'Interviewer'}
                </span>
                <div className={`rounded-2xl px-5 py-3.5 shadow-lg text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-sm'
                }`}>
                  <div className="prose prose-invert prose-sm prose-p:my-0.5 prose-code:text-cyan-300 prose-code:bg-slate-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isSending && (
            <div className="flex gap-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 font-bold">
                AI
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700/50 px-5 py-4 flex items-center gap-1.5">
                <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Input Bar ── */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {voiceEnabled && (
              <Button
                onClick={toggleListening}
                variant={isListening ? 'destructive' : 'outline'}
                size="icon"
                className={`shrink-0 h-11 w-11 rounded-full transition-all shadow-lg ${
                  isListening
                    ? 'animate-pulse shadow-rose-900/40'
                    : 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 hover:border-slate-600'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}

            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isListening ? '🎙 Listening...' : 'Type your response...'}
                className="h-11 pr-4 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 rounded-xl"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-full bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/30 transition-all active:scale-95 disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-center text-[11px] text-slate-600 mt-2.5 flex items-center justify-center gap-1.5">
            <AlertCircle className="h-3 w-3" />
            Press <kbd className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">Enter</kbd> to send · For coding questions, open the <span className="text-cyan-500 font-medium">Code Arena</span>
          </p>
        </div>
      </div>
    </div>
  );
}
