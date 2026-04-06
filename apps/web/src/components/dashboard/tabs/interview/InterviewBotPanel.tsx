import { useState } from 'react';
import { InterviewSetupPanel } from './InterviewSetupPanel';
import { InterviewWorkspace } from './InterviewWorkspace';
import { InterviewResults } from './InterviewResults';
import type { 
  InterviewSession, 
  InterviewMessage, 
} from '@repo/types';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Props {
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
}

type ViewState = 'setup' | 'active' | 'results';

export function InterviewBotPanel({ resumeId, jobTitle, jobDescription }: Props) {
  const { toast } = useToast();
  const [view, setView] = useState<ViewState>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [config, setConfig] = useState<{ mode: string; language: string; voiceEnabled: boolean } | null>(null);

  const handleStart = async (setupConfig: { mode: string; language: string; voiceEnabled: boolean }) => {
    setLoading(true);
    setConfig(setupConfig);
    try {
      const { data } = await api.post('/analysis/interview-bot/start', {
        resumeId,
        jobTitle,
        jobDescription,
        mode: setupConfig.mode,
        language: setupConfig.language,
      });
      setSession(data.session);
      setMessages([data.message]);
      setView('active');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Initialization Failed',
        description: 'Could not connect to the mock interview server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!session) return;
    setIsSending(true);
    
    // Optimistic update
    const userMsg: any = { role: 'user', content, createdAt: new Date().toISOString(), id: `temp-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { data } = await api.post('/analysis/interview-bot/chat', {
        sessionId: session.id,
        message: content,
      });
      setMessages(prev => [...prev, data.message]);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Message failed',
        description: 'AI service is temporarily unavailable.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    setLoading(true);
    setView('results'); // Switch view quickly, but show loader
    try {
      const { data } = await api.post(`/analysis/interview-bot/end/${session.id}`);
      setSession(data);
    } catch (err) {
       console.error(err);
       toast({
        title: 'Evaluation Failed',
        description: 'Your report could not be generated at this time.',
        variant: 'destructive',
      });
       setView('active');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {view === 'setup' && (
        <InterviewSetupPanel 
          onStart={handleStart} 
          isLoading={loading} 
        />
      )}

      {view === 'active' && session && config && (
        <InterviewWorkspace 
           messages={messages}
           onSendMessage={handleSendMessage}
           onEndSession={handleEndSession}
           isSending={isSending}
           voiceEnabled={config.voiceEnabled}
           context={{
             jobTitle: session.jobTitle,
             resumeFilename: 'Analyzed Resume',
             jobDescription: session.jobDescription
           }}
           language={config.language}
        />
      )}

      {view === 'results' && (
        loading ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 animate-pulse">
                <div className="relative">
                    <div className="h-20 w-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-10 w-10 bg-cyan-500/20 rounded-full animate-ping" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Compiling Evaluation Report</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">AI is reviewing your performance metrics and communication scores...</p>
                </div>
            </div>
        ) : (
            session?.report && (
                <InterviewResults 
                  evaluation={session.report as any} 
                  onRestart={() => setView('setup')}
                />
            )
        )
      )}
    </div>
  );
}
