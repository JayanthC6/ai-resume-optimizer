import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Send, 
  XOctagon, 
  FileText, 
  Layout, 
  Code2, 
  AlertCircle,
  Timer,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import type { InterviewMessage, CodingPracticeQuestion, CodingPracticeSet, CodingEvaluation } from '@repo/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  messages: InterviewMessage[];
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  isSending: boolean;
  voiceEnabled: boolean;
  context: { jobTitle: string; resumeFilename: string; jobDescription: string };
  language: string;
  durationMinutes: number;
  sessionId: string;
  onGenerateCodingQuestions: () => Promise<CodingPracticeSet>;
  onEvaluateCode: (question: string, code: string) => Promise<CodingEvaluation>;
}

export function InterviewWorkspace({
  messages,
  onSendMessage,
  onEndSession,
  isSending,
  voiceEnabled,
  context,
  language,
  durationMinutes,
  sessionId,
  onGenerateCodingQuestions,
  onEvaluateCode,
}: Props) {
  const [input, setInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isListening, setIsListening] = useState(false);
  const [codingQuestions, setCodingQuestions] = useState<CodingPracticeQuestion[]>([]);
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
  const [codeDraft, setCodeDraft] = useState('');
  const [codingLoading, setCodingLoading] = useState(false);
  const [codingEvaluation, setCodingEvaluation] = useState<CodingEvaluation | null>(null);
  const [codingError, setCodingError] = useState<string | null>(null);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Voice Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
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
    onSendMessage(input);
    setInput('');
  };

  const handleGenerateCoding = async () => {
    setCodingLoading(true);
    setCodingEvaluation(null);
    setCodingError(null);
    try {
      const result = await onGenerateCodingQuestions();
      setCodingQuestions(result.questions || []);
      setSelectedQuestionIdx(0);
    } catch {
      setCodingError('Could not generate coding questions right now. Please try again.');
    } finally {
      setCodingLoading(false);
    }
  };

  const handleEvaluateCode = async () => {
    const question = codingQuestions[selectedQuestionIdx];
    if (!question || !codeDraft.trim()) return;
    setCodingLoading(true);
    setCodingError(null);
    try {
      const result = await onEvaluateCode(question.prompt, codeDraft);
      setCodingEvaluation(result);
    } catch {
      setCodingError('Could not evaluate your code right now. Please try again.');
    } finally {
      setCodingLoading(false);
    }
  };

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[600px] gap-4 animate-in fade-in duration-500">
      {/* Left Pane: Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col bg-slate-950 border-slate-800 shadow-2xl overflow-hidden rounded-2xl relative">
          <CardHeader className="py-4 border-b border-slate-800/60 bg-slate-900/40 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <CardTitle className="text-sm font-medium text-slate-300">Live Interview Session</CardTitle>
              <div className="ml-2 inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-[11px] text-cyan-300">
                <Timer className="h-3 w-3" /> {minutes}:{seconds}
              </div>
              <div className="hidden xl:block text-[10px] text-slate-500">ID: {sessionId.slice(0, 8)}</div>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEndSession}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            >
              <XOctagon className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </CardHeader>

          <ScrollArea className="flex-grow p-4 sm:p-6" ref={scrollRef}>
            <div className="space-y-6 pr-2">
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id || idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
                  }`}>
                    {msg.role === 'assistant' && (
                        <div className="text-[10px] uppercase font-black text-cyan-400 tracking-widest mb-1">Interviewer</div>
                    )}
                    <div className="text-sm leading-relaxed prose prose-invert prose-p:my-0 prose-code:text-cyan-300 prose-code:bg-slate-900/50 prose-code:px-1 prose-code:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                   <div className="bg-slate-800/50 rounded-2xl rounded-tl-none px-5 py-4 border border-slate-700/30 flex gap-1.5">
                      <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" />
                   </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 shrink-0">
            <div className="flex gap-2 items-center">
              {voiceEnabled && (
                <Button 
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={`shrink-0 rounded-full h-11 w-11 transition-all ${isListening ? 'animate-pulse' : 'border-slate-700 bg-slate-800/50'}`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              )}
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type your response here..."}
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500 h-11"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                size="icon"
                className="shrink-0 bg-cyan-600 hover:bg-cyan-500 rounded-full h-11 w-11 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Press Enter to send. Use the scratchpad for rough notes.
            </p>
          </div>
        </Card>
      </div>

      {/* Right Pane: Context & Scratchpad */}
      <div className="w-full lg:w-[380px] flex flex-col gap-4 shrink-0 overflow-hidden">
        {/* Context Board */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl flex flex-col rounded-2xl overflow-hidden shrink-0">
          <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-800/20">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
               <Layout className="h-3 w-3 text-cyan-500" />
               Session Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
             <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <span className="text-slate-500 block">Target Role</span>
                  <p className="font-bold text-slate-100 text-sm truncate max-w-[200px]">{context.jobTitle}</p>
               </div>
               <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-cyan-400">
                  {language}
               </div>
             </div>
             <div className="space-y-1">
                <span className="text-slate-500 block">Active Resume</span>
                <p className="font-medium text-slate-200 flex items-center gap-2 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="truncate">{context.resumeFilename}</span>
                </p>
             </div>
          </CardContent>
        </Card>

        {/* Scratchpad */}
        <Card className="flex-1 bg-slate-900 border-slate-800 shadow-xl flex flex-col rounded-2xl overflow-hidden min-h-[250px]">
          <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-800/20 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-cyan-500" />
              <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                 Scratchpad
              </CardTitle>
            </div>
            <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 opacity-50" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 opacity-50" />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative group">
            <textarea 
              className="w-full h-full bg-slate-950 p-4 text-slate-300 text-sm font-mono focus:outline-none resize-none placeholder:text-slate-700 transition-colors focus:bg-slate-950"
              spellCheck="false"
              placeholder={`// Write your ${language} logic or notes here...\n// (Not evaluated by the AI)`}
            />
            <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Code2 className="h-20 w-20 text-slate-400" />
            </div>
          </CardContent>
          <div className="p-2 bg-slate-950 border-t border-slate-800/50 flex items-center justify-center gap-1.5 shrink-0">
             <AlertCircle className="h-3 w-3 text-slate-600" />
             <span className="text-[9px] text-slate-600 font-medium">Auto-syncs with your local browser session.</span>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-800/20">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-cyan-500" /> Coding Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button
              type="button"
              size="sm"
              onClick={handleGenerateCoding}
              disabled={codingLoading}
              className="w-full bg-cyan-700 hover:bg-cyan-600"
            >
              {codingLoading ? 'Generating...' : 'Generate JD-based Coding Questions'}
            </Button>

            {codingQuestions.length > 0 && (
              <>
                <div className="space-y-2">
                  {codingQuestions.map((q, idx) => (
                    <button
                      key={`${q.title}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedQuestionIdx(idx);
                        setCodingEvaluation(null);
                      }}
                      className={`w-full text-left rounded-md border px-2 py-2 text-xs ${
                        selectedQuestionIdx === idx
                          ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{q.title}</div>
                      <div className="text-[10px] uppercase text-slate-400">{q.difficulty}</div>
                    </button>
                  ))}
                </div>

                <div className="rounded-md border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">
                  {codingQuestions[selectedQuestionIdx]?.prompt}
                </div>

                <textarea
                  value={codeDraft}
                  onChange={(e) => setCodeDraft(e.target.value)}
                  className="w-full min-h-[140px] rounded-md border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  placeholder={`// Solve in ${language}. Submit for AI evaluation.`}
                />

                <Button
                  type="button"
                  size="sm"
                  onClick={handleEvaluateCode}
                  disabled={codingLoading || !codeDraft.trim()}
                  className="w-full bg-emerald-700 hover:bg-emerald-600"
                >
                  {codingLoading ? 'Evaluating...' : 'Submit Code for AI Evaluation'}
                </Button>

                {codingEvaluation && (
                  <div className="rounded-md border border-emerald-700/50 bg-emerald-950/20 p-3 text-xs text-slate-200 space-y-2">
                    <div className="font-semibold flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Score: {codingEvaluation.score}/100
                    </div>
                    <p>{codingEvaluation.feedback}</p>
                  </div>
                )}

                {codingError && (
                  <div className="rounded-md border border-rose-700/50 bg-rose-950/20 p-3 text-xs text-rose-200">
                    {codingError}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
