import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

type QuestionSet = {
  team?: Array<{ question: string; reason: string }>;
  'role success'?: Array<{ question: string; reason: string }>;
  growth?: Array<{ question: string; reason: string }>;
  culture?: Array<{ question: string; reason: string }>;
};

type Props = {
  analysisId: string;
};

export function ReverseQuestionsPanel({ analysisId }: Props) {
  const [questions, setQuestions] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    if (analysisId) {
      fetchQuestions();
    }
  }, [analysisId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/analysis/${analysisId}/reverse-questions`);
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e: any) {
      console.error(e);
      // We don't set error if it's just not generated yet (404/empty)
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post(`/analysis/${analysisId}/reverse-questions`);
      setQuestions(data.questions);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Generating strategic questions to ask...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleGenerate} variant="outline">Try Again</Button>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <MessageSquare className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Questions Generated</h3>
        <p className="text-center max-w-md mb-6">
          Generate strategic, tailored questions to ask your interviewer based on your resume and the job description.
        </p>
        <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white">
          Generate Questions
        </Button>
      </div>
    );
  }

  const sections = [
    { key: 'team', title: 'The Team & Management' },
    { key: 'role success', title: 'Role Success & Expectations' },
    { key: 'growth', title: 'Growth & Development' },
    { key: 'culture', title: 'Company Culture & Values' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Questions to Ask</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Strategic questions to uncover insights and demonstrate your engagement.
          </p>
        </div>
        <Button onClick={handleGenerate} variant="outline" className="shrink-0" disabled={loading}>
          Regenerate
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map(({ key, title }) => {
          const topicQuestions = questions[key as keyof QuestionSet];
          if (!topicQuestions || topicQuestions.length === 0) return null;

          return (
            <Card key={key} className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                {topicQuestions.map((q, idx) => (
                  <div key={idx} className="group relative rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 pr-8 leading-snug">
                      "{q.question}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Why ask this: </span>
                      {q.reason}
                    </p>
                    <button
                      onClick={() => handleCopy(q.question, `${key}-${idx}`)}
                      className="absolute right-3 top-3 p-1.5 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                      title="Copy question"
                    >
                      {copiedIndex === `${key}-${idx}` ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
