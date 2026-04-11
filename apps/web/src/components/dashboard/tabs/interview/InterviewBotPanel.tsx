import { useState, useRef } from 'react';
import { InterviewSetupPanel } from './InterviewSetupPanel';
import { InterviewWorkspace } from './InterviewWorkspace';
import { InterviewResults } from './InterviewResults';
import { CodingArena } from './CodingArena';
import type {
  InterviewSession,
  InterviewMessage,
  InterviewDurationRecommendation,
  CodingPracticeSet,
  CodingEvaluation,
} from '@repo/types';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Props {
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
}

type MainView = 'setup' | 'active' | 'results';
type ActiveSubView = 'interview' | 'coding';

export function InterviewBotPanel({ resumeId, jobTitle, jobDescription }: Props) {
  const { toast } = useToast();

  // Main flow state
  const [mainView, setMainView] = useState<MainView>('setup');
  const [activeSubView, setActiveSubView] = useState<ActiveSubView>('interview');

  // Session data
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [config, setConfig] = useState<{
    mode: string;
    language: string;
    voiceEnabled: boolean;
    durationMinutes: number;
  } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recommendation, setRecommendation] = useState<InterviewDurationRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Shared timer - both views stay in sync
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (durationMinutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingSeconds(durationMinutes * 60);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── API Handlers ──

  const handleGetRecommendation = async (payload: { mode: string; language: string }) => {
    setRecommendationLoading(true);
    try {
      const { data } = await api.post('/analysis/interview-bot/recommend-duration', {
        resumeId,
        jobTitle,
        jobDescription,
        mode: payload.mode,
        language: payload.language,
      });
      setRecommendation(data);
    } catch {
      toast({
        title: 'Recommendation unavailable',
        description: 'Could not generate a duration recommendation right now.',
        variant: 'destructive',
      });
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleStart = async (setupConfig: {
    mode: string;
    language: string;
    voiceEnabled: boolean;
    durationMinutes: number;
  }) => {
    setLoading(true);
    setConfig(setupConfig);
    try {
      const { data } = await api.post('/analysis/interview-bot/start', {
        resumeId,
        jobTitle,
        jobDescription,
        mode: setupConfig.mode,
        language: setupConfig.language,
        durationMinutes: setupConfig.durationMinutes,
      });
      setSession(data.session);
      setMessages([data.message]);
      startTimer(setupConfig.durationMinutes);
      setActiveSubView('interview');
      setMainView('active');
    } catch {
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
    const userMsg: any = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      id: `temp-${Date.now()}`,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data } = await api.post('/analysis/interview-bot/chat', {
        sessionId: session.id,
        message: content,
      });
      setMessages((prev) => [...prev, data.message]);
    } catch {
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
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setMainView('results');
    try {
      const { data } = await api.post(`/analysis/interview-bot/end/${session.id}`);
      setSession(data);
    } catch {
      toast({
        title: 'Evaluation Failed',
        description: 'Your report could not be generated at this time.',
        variant: 'destructive',
      });
      setMainView('active');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodingQuestions = async (): Promise<CodingPracticeSet> => {
    if (!session) return { questions: [] };
    const { data } = await api.post(`/analysis/interview-bot/coding/${session.id}/questions`);
    return data;
  };

  const handleEvaluateCode = async (question: string, code: string): Promise<CodingEvaluation> => {
    if (!session) throw new Error('Session not found');
    const { data } = await api.post(`/analysis/interview-bot/coding/${session.id}/evaluate`, {
      question,
      code,
      language: config?.language || 'JavaScript',
    });
    return data;
  };

  // ── Render ──

  if (mainView === 'setup') {
    return (
      <InterviewSetupPanel
        onStart={handleStart}
        onGetRecommendation={handleGetRecommendation}
        recommendation={recommendation}
        recommendationLoading={recommendationLoading}
        isLoading={loading}
      />
    );
  }

  if (mainView === 'results') {
    return loading ? (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="relative">
          <div className="h-24 w-24 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 bg-cyan-500/10 rounded-full animate-ping" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">Compiling Evaluation Report</h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            AI is reviewing your performance metrics and communication scores...
          </p>
        </div>
      </div>
    ) : session?.report ? (
      <InterviewResults
        session={session}
        evaluation={session.report as any}
        onRestart={() => {
          setMainView('setup');
          setMessages([]);
          setSession(null);
          setConfig(null);
        }}
      />
    ) : null;
  }

  // Active session — two sub-views
  if (mainView === 'active' && session && config) {
    if (activeSubView === 'coding') {
      return (
        <CodingArena
          onBackToInterview={() => setActiveSubView('interview')}
          onGenerateCodingQuestions={handleGenerateCodingQuestions}
          onEvaluateCode={handleEvaluateCode}
          language={config.language}
          remainingSeconds={remainingSeconds}
          jobTitle={session.jobTitle}
        />
      );
    }

    return (
      <InterviewWorkspace
        messages={messages}
        onSendMessage={handleSendMessage}
        onEndSession={handleEndSession}
        onOpenCodingArena={() => setActiveSubView('coding')}
        isSending={isSending}
        voiceEnabled={config.voiceEnabled}
        context={{
          jobTitle: session.jobTitle,
          resumeFilename: 'Analyzed Resume',
          jobDescription: session.jobDescription,
        }}
        language={config.language}
        durationMinutes={config.durationMinutes}
        sessionId={session.id}
      />
    );
  }

  return null;
}
