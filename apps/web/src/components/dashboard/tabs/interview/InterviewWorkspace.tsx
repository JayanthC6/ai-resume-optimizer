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
  AlertCircle 
} from 'lucide-react';
import type { InterviewMessage } from '@repo/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  messages: InterviewMessage[];
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  isSending: boolean;
  voiceEnabled: boolean;
  context: { jobTitle: string; resumeFilename: string; jobDescription: string };
  language: string;
}

export function InterviewWorkspace({
  messages,
  onSendMessage,
  onEndSession,
  isSending,
  voiceEnabled,
  context,
  language,
}: Props) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[600px] gap-4 animate-in fade-in duration-500">
      {/* Left Pane: Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col bg-slate-950 border-slate-800 shadow-2xl overflow-hidden rounded-2xl relative">
          <CardHeader className="py-4 border-b border-slate-800/60 bg-slate-900/40 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <CardTitle className="text-sm font-medium text-slate-300">Live Interview Session</CardTitle>
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
      </div>
    </div>
  );
}
